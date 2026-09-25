import type { FaultReport } from "../models/FaultReport";

export const createFaultReportDto = (overrides: Partial<FaultReport> = {}): FaultReport => ({
  id: 0,
  reporter_name: "",
  phone: "",
  asset_id: 0,
  fault_type: "OUTAGE",
  address_desc: "",
  severity: "MEDIUM",
  report_channel: "95598",
  status: "OPEN",
  reported_at: new Date().toISOString(),
  merged_into_id: null,
  ...overrides
});

export const createFaultReportVoidResult = (master: FaultReport, children: FaultReport[]) => ({ master, children });
