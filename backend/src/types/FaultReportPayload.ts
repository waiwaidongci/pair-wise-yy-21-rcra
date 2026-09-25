import type { FaultReport } from "../models/FaultReport";
import type { RepairTicket } from "../models/RepairTicket";

export interface FaultReportPayload {
  reporter_name: string;
  phone: string;
  asset_id: number;
  fault_type: string;
  address_desc: string;
  severity: string;
  report_channel: string;
  reported_at?: string;
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

export interface MergeBoardRow {
  master: FaultReport;
  followers: FaultReport[];
  ticket: RepairTicket | null;
  crew_name: string | null;
  locked: boolean;
  window_end: string;
}

export class ServiceError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
