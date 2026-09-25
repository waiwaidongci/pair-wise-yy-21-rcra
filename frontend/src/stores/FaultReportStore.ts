import { defineStore } from "pinia";
import { listFaultReport, fetchMergeBoard, registerFaultReport, voidFaultReport } from "../api/FaultReport";
import { mockData } from "../mocks/seedData";
import { buildMergeBoardRows } from "../constructors/MergeBoardConstructor";
import { MERGE_WINDOW_MS, DISPATCH_LOCK_TICKET_STATUS } from "../constants/mergeRules";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { FaultReport } from "../types/FaultReport";
import type { RepairTicket } from "../types/RepairTicket";
import type { Crew } from "../types/Crew";
import type { FaultReportForm, FaultReportRegisterResult, FaultReportVoidResult, MergeBoardRow } from "../types/MergeBoard";

// 离线可写副本：仅在后端不可达时启用，规则与后端 FaultReportService 保持一致。
let localRows: FaultReport[] | null = null;
const localStore = (): FaultReport[] => {
  if (!localRows) localRows = (mockData.faultReport as unknown as FaultReport[]).map((row) => ({ ...row }));
  return localRows;
};
const mockTickets = mockData.repairTicket as unknown as RepairTicket[];
const mockCrews = mockData.crew as unknown as Crew[];

const isBusinessError = (err: unknown): err is Error & { code: string } =>
  err instanceof Error && "code" in err;

const zhMessage = (err: unknown): string => {
  if (isBusinessError(err)) {
    const text = (ERROR_MESSAGES as Record<string, string>)[err.code];
    if (text) return text;
  }
  return err instanceof Error ? err.message : String(err);
};

const localLocked = (masterId: number): boolean => {
  const ticket = mockTickets.find((item) => item.fault_report_id === masterId);
  return !!ticket && (DISPATCH_LOCK_TICKET_STATUS as readonly string[]).includes(ticket.status);
};

const localRegister = (payload: FaultReportForm): FaultReportRegisterResult => {
  const rows = localStore();
  const reported_at = new Date(payload.reported_at).toISOString();
  const asset_id = Number(payload.asset_id);
  const calledAt = new Date(reported_at).getTime();
  const master = rows
    .filter((row) => row.master_id === null && row.status === "OPEN")
    .filter((row) => row.asset_id === asset_id && row.fault_type === payload.fault_type)
    .filter((row) => {
      const first = new Date(row.reported_at).getTime();
      return calledAt >= first && calledAt <= first + MERGE_WINDOW_MS;
    })
    .sort((a, b) => a.reported_at.localeCompare(b.reported_at))[0];
  const id = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  if (master) {
    if (localLocked(master.id)) {
      throw Object.assign(new Error(ERROR_MESSAGES.MERGE_LOCKED_DISPATCHED), { code: ERROR_CODES.MERGE_LOCKED_DISPATCHED });
    }
    const row: FaultReport = { ...payload, asset_id, reported_at, id, status: "MERGED", master_id: master.id };
    rows.push(row);
    console.info(LOG_TEMPLATES.FaultReport[4], row);
    return { row, merged: true, master };
  }
  const row: FaultReport = { ...payload, asset_id, reported_at, id, status: "OPEN", master_id: null };
  rows.push(row);
  console.info(LOG_TEMPLATES.FaultReport[0], row);
  return { row, merged: false, master: null };
};

const localVoid = (id: number): FaultReportVoidResult => {
  const rows = localStore();
  const row = rows.find((item) => item.id === id);
  if (!row) throw Object.assign(new Error(ERROR_MESSAGES.REPORT_NOT_FOUND), { code: ERROR_CODES.REPORT_NOT_FOUND });
  if (row.status === "VOID") throw Object.assign(new Error(ERROR_MESSAGES.REPORT_ALREADY_VOID), { code: ERROR_CODES.REPORT_ALREADY_VOID });
  if (row.master_id === null && localLocked(row.id)) {
    throw Object.assign(new Error(ERROR_MESSAGES.VOID_LOCKED_DISPATCHED), { code: ERROR_CODES.VOID_LOCKED_DISPATCHED });
  }
  row.status = "VOID";
  console.info(LOG_TEMPLATES.FaultReport[5], row);
  let successor: FaultReport | null = null;
  if (row.master_id === null) {
    const followers = rows
      .filter((item) => item.master_id === id && item.status === "MERGED")
      .sort((a, b) => a.reported_at.localeCompare(b.reported_at) || a.id - b.id);
    const [next, ...rest] = followers;
    if (next) {
      next.status = "OPEN";
      next.master_id = null;
      console.info(LOG_TEMPLATES.FaultReport[6], next);
      rest.forEach((follower) => { follower.master_id = next.id; });
      successor = next;
    }
  }
  return { row, successor };
};

export const useFaultReportStore = defineStore("faultReport", {
  state: () => ({
    rows: [] as FaultReport[],
    board: [] as MergeBoardRow[],
    loading: false,
    saving: false,
    offline: false,
    error: null as string | null
  }),
  actions: {
    async load() {
      this.loading = true;
      this.error = null;
      try {
        const [rows, board] = await Promise.all([listFaultReport(), fetchMergeBoard()]);
        this.rows = rows;
        this.board = board;
        this.offline = false;
      } catch (err) {
        if (isBusinessError(err)) {
          this.error = zhMessage(err);
          throw err;
        }
        // 后端不可达：降级为本地种子数据，归并台仍可演示。
        this.offline = true;
        this.rows = [...localStore()];
        this.board = buildMergeBoardRows(localStore(), mockTickets, mockCrews);
      } finally {
        this.loading = false;
      }
    },
    async register(form: FaultReportForm): Promise<FaultReportRegisterResult> {
      this.saving = true;
      this.error = null;
      try {
        let result: FaultReportRegisterResult;
        try {
          result = await registerFaultReport(form);
        } catch (err) {
          if (isBusinessError(err)) throw err;
          result = localRegister(form);
        }
        await this.load();
        return result;
      } catch (err) {
        this.error = zhMessage(err);
        throw err;
      } finally {
        this.saving = false;
      }
    },
    async voidMaster(id: number): Promise<FaultReportVoidResult> {
      this.error = null;
      try {
        let result: FaultReportVoidResult;
        try {
          result = await voidFaultReport(id);
        } catch (err) {
          if (isBusinessError(err)) throw err;
          result = localVoid(id);
        }
        await this.load();
        return result;
      } catch (err) {
        this.error = zhMessage(err);
        throw err;
      }
    }
  }
});
