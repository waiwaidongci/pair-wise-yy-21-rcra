import type { FaultReportPayload } from "../types/FaultReportPayload";

export const createFaultReportDto = (overrides = {}) => ({ id: 1, reporter_name: "reporter name 1", phone: "13800000001", asset_id: 1, fault_type: "VOLTAGE_LOW", address_desc: "address desc 1", severity: "severity 1", report_channel: "report channel 1", status: "OPEN", reported_at: new Date().toISOString(), master_id: null, ...overrides });

// 登记报修请求体归一化：缺省来电时间取当前时刻，asset_id 强制转数值。
export const createFaultReportPayload = (body: Record<string, unknown> = {}): FaultReportPayload => ({
  reporter_name: String(body.reporter_name ?? ""),
  phone: String(body.phone ?? ""),
  asset_id: Number(body.asset_id ?? 0),
  fault_type: String(body.fault_type ?? ""),
  address_desc: String(body.address_desc ?? ""),
  severity: String(body.severity ?? "MEDIUM"),
  report_channel: String(body.report_channel ?? "电话"),
  reported_at: body.reported_at ? String(body.reported_at) : new Date().toISOString()
});

export const createMergeBoardRowDto = (overrides = {}) => ({ master: null, followers: [], ticket: null, crew_name: null, locked: false, window_end: null, ...overrides });
