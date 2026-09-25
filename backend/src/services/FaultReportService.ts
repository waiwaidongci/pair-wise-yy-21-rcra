import { faultReportRepository } from "../repositories/FaultReportRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { createFaultReportDto, createFaultReportVoidResult } from "../constructors/FaultReportDtoFactory";
import { MERGE_WINDOW_MS, DISPATCH_LOCK_TICKET_STATUSES } from "../constants/MergeRules";
import { ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { FaultReport } from "../models/FaultReport";
import type { FaultReportPayload } from "../types/FaultReportPayload";

const serviceError = (status: number, code: ErrorCode) =>
  Object.assign(new Error(ERROR_MESSAGES[code]), { status, code: ERROR_CODES[code] });

const byCallOrder = (a: FaultReport, b: FaultReport) =>
  Date.parse(a.reported_at) - Date.parse(b.reported_at) || a.id - b.id;

// 已派工（工单状态越过待派工）的故障单不再接纳重复来电。
const isDispatchLocked = (report: FaultReport) => {
  const ticket = repairTicketRepository.findByReportId(report.id);
  return !!ticket && (DISPATCH_LOCK_TICKET_STATUSES as readonly string[]).includes(ticket.status);
};

// 归并窗口锚定在主单首次来电时刻，不随后续来电滑动。
const withinWindow = (masterAt: string, at: string) => {
  const diff = Date.parse(at) - Date.parse(masterAt);
  return diff >= 0 && diff <= MERGE_WINDOW_MS;
};

const findMasterCandidate = (draft: FaultReport) =>
  faultReportRepository.findAll()
    .filter((row) => row.id !== draft.id && row.merged_into_id === null && row.status === "OPEN")
    .filter((row) => row.asset_id === draft.asset_id && row.fault_type === draft.fault_type)
    .filter((row) => withinWindow(row.reported_at, draft.reported_at))
    .sort(byCallOrder)[0];

const register = (payload: FaultReportPayload) => {
  if (!payload || !payload.reporter_name || !payload.phone || !payload.asset_id || !payload.fault_type) {
    throw serviceError(400, "VALIDATION_FAILED");
  }
  const draft = createFaultReportDto({
    ...payload,
    id: faultReportRepository.nextId(),
    reported_at: payload.reported_at ?? new Date().toISOString(),
    status: "OPEN",
    merged_into_id: null
  });
  const master = findMasterCandidate(draft);
  if (master && isDispatchLocked(master)) {
    throw serviceError(409, "MERGE_LOCKED");
  }
  if (master) {
    const row = faultReportRepository.insert({ ...draft, status: "MERGED", merged_into_id: master.id });
    console.info(LOG_TEMPLATES.FaultReport.merge, `report#${row.id}`, `master#${master.id}`);
    return row;
  }
  const row = faultReportRepository.insert(draft);
  console.info(LOG_TEMPLATES.FaultReport.create, `report#${row.id}`);
  return row;
};

// 主单作废后按来电顺序接续：最早来电升为新主单，其余仍在窗口内的并入新主单，超窗的自立主单。
const voidMaster = (id: number) => {
  const master = faultReportRepository.findById(id);
  if (!master) throw serviceError(404, "REPORT_NOT_FOUND");
  if (master.status !== "OPEN" || master.merged_into_id !== null || isDispatchLocked(master)) {
    throw serviceError(409, "VOID_NOT_ALLOWED");
  }
  faultReportRepository.update(master.id, { status: "VOID" });
  console.info(LOG_TEMPLATES.FaultReport.void, `report#${master.id}`);

  const children = faultReportRepository.findAll()
    .filter((row) => row.merged_into_id === master.id)
    .sort(byCallOrder);
  const promoted: FaultReport[] = [];
  let current: FaultReport | undefined;
  for (const child of children) {
    if (!current || !withinWindow(current.reported_at, child.reported_at)) {
      current = faultReportRepository.update(child.id, { status: "OPEN", merged_into_id: null });
      if (current) {
        promoted.push(current);
        console.info(LOG_TEMPLATES.FaultReport.promote, `report#${current.id}`);
      }
    } else {
      faultReportRepository.update(child.id, { merged_into_id: current.id });
      console.info(LOG_TEMPLATES.FaultReport.merge, `report#${child.id}`, `master#${current.id}`);
    }
  }

  // 待派工工单跟随新主单，保证页面仍能看到对应工单。
  const ticket = repairTicketRepository.findByReportId(master.id);
  if (ticket && ticket.status === "WAIT_DISPATCH" && promoted[0]) {
    repairTicketRepository.update(ticket.id, { fault_report_id: promoted[0].id });
    console.info(LOG_TEMPLATES.RepairTicket.update, `ticket#${ticket.id}`, `report#${promoted[0].id}`);
  }

  const updated = faultReportRepository.findById(master.id) as FaultReport;
  return createFaultReportVoidResult(updated, children.map((child) => faultReportRepository.findById(child.id) as FaultReport));
};

export const faultReportService = {
  list: () => faultReportRepository.findAll(),
  register,
  voidMaster
};
