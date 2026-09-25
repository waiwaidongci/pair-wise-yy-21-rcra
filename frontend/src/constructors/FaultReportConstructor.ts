import type { FaultReport } from "../types/FaultReport";
import type { FaultReportPayload } from "../types/FaultReportPayload";

export const SEVERITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL", "EXTREME"] as const;

export const REPORT_CHANNEL_OPTIONS = ["95598 热线", "网上国网", "营业厅", "现场报修"] as const;

export const createDefaultFaultReport = (overrides: Partial<FaultReport> = {}): FaultReport => ({
  id: 0,
  reporter_name: "",
  phone: "",
  asset_id: 0,
  fault_type: "OUTAGE",
  address_desc: "",
  severity: "MEDIUM",
  report_channel: REPORT_CHANNEL_OPTIONS[0],
  status: "OPEN",
  reported_at: "",
  merged_into_id: null,
  ...overrides
});

export const createFaultReportForm = (overrides: Partial<FaultReportPayload> = {}): FaultReportPayload => ({
  reporter_name: "",
  phone: "",
  asset_id: 0,
  fault_type: "OUTAGE",
  address_desc: "",
  severity: "MEDIUM",
  report_channel: REPORT_CHANNEL_OPTIONS[0],
  reported_at: "",
  ...overrides
});

export const createFaultReportResponse = createDefaultFaultReport;
