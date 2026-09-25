import { faultReportRepository } from "../repositories/FaultReportRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { MERGE_WINDOW_MS, DISPATCH_LOCK_TICKET_STATUS } from "../constants/mergeRules";
import { createMergeBoardRowDto } from "../constructors/FaultReportDtoFactory";
import type { FaultReport } from "../models/FaultReport";
import type { FaultReportPayload, FaultReportRegisterResult, FaultReportVoidResult, MergeBoardRow } from "../types/FaultReportPayload";
import { ServiceError } from "../types/FaultReportPayload";

const log = (template: string, row: FaultReport, extra = "") => console.info(template, `#${row.id}`, row.reporter_name, extra);

// 已派工判定：主单已挂工单且工单状态越过 WAIT_DISPATCH。
const isDispatchLocked = (masterId: number): boolean => {
  const ticket = repairTicketRepository.findByFaultReportId(masterId);
  return !!ticket && (DISPATCH_LOCK_TICKET_STATUS as readonly string[]).includes(ticket.status);
};

const windowEndOf = (master: FaultReport): string => new Date(new Date(master.reported_at).getTime() + MERGE_WINDOW_MS).toISOString();

// 归并匹配：同一资产、同一故障类型、来电时刻落在主单首次来电后 30 分钟窗口内。
const findMergeMaster = (payload: FaultReportPayload): FaultReport | undefined => {
  const calledAt = new Date(payload.reported_at as string).getTime();
  return faultReportRepository
    .findOpenMasters()
    .filter((master) => master.asset_id === payload.asset_id && master.fault_type === payload.fault_type)
    .filter((master) => {
      const first = new Date(master.reported_at).getTime();
      return calledAt >= first && calledAt <= first + MERGE_WINDOW_MS;
    })
    .sort((a, b) => a.reported_at.localeCompare(b.reported_at))[0];
};

const validate = (payload: FaultReportPayload) => {
  const calledAt = Date.parse(payload.reported_at ?? "");
  if (!payload.reporter_name || !payload.phone || !payload.asset_id || !payload.fault_type || Number.isNaN(calledAt)) {
    throw new ServiceError(400, ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED);
  }
};

export const faultReportService = {
  list: () => faultReportRepository.findAll(),

  // 归并台：每个在办主单一行，带跟进来电、对应工单与派工锁定标记。
  mergeBoard: (): MergeBoardRow[] =>
    faultReportRepository
      .findOpenMasters()
      .sort((a, b) => a.reported_at.localeCompare(b.reported_at))
      .map((master) => {
        const ticket = repairTicketRepository.findByFaultReportId(master.id) ?? null;
        const crew = ticket ? crewRepository.findById(ticket.team_id) : undefined;
        return createMergeBoardRowDto({
          master,
          followers: faultReportRepository.findFollowers(master.id),
          ticket,
          crew_name: crew?.name ?? null,
          locked: isDispatchLocked(master.id),
          window_end: windowEndOf(master)
        }) as unknown as MergeBoardRow;
      }),

  register: (payload: FaultReportPayload): FaultReportRegisterResult => {
    validate(payload);
    const master = findMergeMaster(payload);
    if (master) {
      if (isDispatchLocked(master.id)) {
        throw new ServiceError(409, ERROR_CODES.MERGE_LOCKED_DISPATCHED, ERROR_MESSAGES.MERGE_LOCKED_DISPATCHED);
      }
      const row = faultReportRepository.insert({ ...payload, reported_at: payload.reported_at as string, status: "MERGED", master_id: master.id });
      log(LOG_TEMPLATES.FaultReport[4], row, `-> master #${master.id}`);
      return { row, merged: true, master };
    }
    const row = faultReportRepository.insert({ ...payload, reported_at: payload.reported_at as string, status: "OPEN", master_id: null });
    log(LOG_TEMPLATES.FaultReport[0], row);
    return { row, merged: false, master: null };
  },

  // 作废：主单作废后按来电顺序接续下一条为新主单，其余跟进记录改挂新主单。
  void: (id: number): FaultReportVoidResult => {
    const row = faultReportRepository.findById(id);
    if (!row) throw new ServiceError(404, ERROR_CODES.REPORT_NOT_FOUND, ERROR_MESSAGES.REPORT_NOT_FOUND);
    if (row.status === "VOID") throw new ServiceError(409, ERROR_CODES.REPORT_ALREADY_VOID, ERROR_MESSAGES.REPORT_ALREADY_VOID);
    if (row.master_id === null && isDispatchLocked(row.id)) {
      throw new ServiceError(409, ERROR_CODES.VOID_LOCKED_DISPATCHED, ERROR_MESSAGES.VOID_LOCKED_DISPATCHED);
    }
    faultReportRepository.update(id, { status: "VOID" });
    log(LOG_TEMPLATES.FaultReport[5], row);
    let successor: FaultReport | null = null;
    if (row.master_id === null) {
      const [next, ...rest] = faultReportRepository.findFollowers(id);
      if (next) {
        successor = faultReportRepository.update(next.id, { status: "OPEN", master_id: null }) ?? null;
        log(LOG_TEMPLATES.FaultReport[6], next, `<- voided master #${id}`);
        rest.forEach((follower) => faultReportRepository.update(follower.id, { master_id: next.id }));
      }
    }
    return { row, successor };
  }
};
