import type { FaultReport } from "./FaultReport";
import type { RepairTicket } from "./RepairTicket";

// 归并台行：一个在办主单 + 全部跟进来电 + 对应工单。
export interface MergeBoardRow {
  master: FaultReport;
  followers: FaultReport[];
  ticket: RepairTicket | null;
  crew_name: string | null;
  locked: boolean;
  window_end: string;
}

export interface FaultReportForm {
  reporter_name: string;
  phone: string;
  asset_id: number | null;
  fault_type: string;
  address_desc: string;
  severity: string;
  report_channel: string;
  reported_at: string;
}

export interface FaultReportRegisterResult {
  row: FaultReport;
  merged: boolean;
  master: FaultReport | null;
}

export interface FaultReportVoidResult {
  row: FaultReport;
  successor: FaultReport | null;
}
