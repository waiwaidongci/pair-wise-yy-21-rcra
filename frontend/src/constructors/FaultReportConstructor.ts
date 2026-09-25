import type { FaultReport } from "../types/FaultReport";
import type { FaultReportForm } from "../types/MergeBoard";

const nowIso = () => new Date().toISOString();
// datetime-local 输入框需要的本地时间格式（YYYY-MM-DDTHH:mm）。
const nowLocalInput = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export const createDefaultFaultReport = (overrides: Partial<FaultReport> = {}): FaultReport => ({
  id: 1,
  reporter_name: "王桂香",
  phone: "13800000001",
  asset_id: 1,
  fault_type: "VOLTAGE_LOW",
  address_desc: "幸福小区 3 栋整栋电压偏低",
  severity: "MEDIUM",
  report_channel: "95598",
  status: "OPEN",
  reported_at: nowIso(),
  master_id: null,
  ...overrides
});

// 登记报修表单默认对象：页面与 store 禁止散写空结构。
export const createFaultReportForm = (overrides: Partial<FaultReportForm> = {}): FaultReportForm => ({
  reporter_name: "",
  phone: "",
  asset_id: null,
  fault_type: "OUTAGE",
  address_desc: "",
  severity: "MEDIUM",
  report_channel: "95598",
  reported_at: nowLocalInput(),
  ...overrides
});

export const createFaultReportResponse = createDefaultFaultReport;
