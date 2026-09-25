import { mockData } from "../mocks/seedData";
import type { FaultReport } from "../types/FaultReport";
import type { FaultReportForm, FaultReportRegisterResult, FaultReportVoidResult, MergeBoardRow } from "../types/MergeBoard";

const endpoint = "/api/fault-report";

// 后端业务错误（如已派工锁单）按 { code, message } 抛出，页面据此提示。
async function parseError(res: Response): Promise<never> {
  let code = "INTERNAL_ERROR";
  let message = `请求失败（${res.status}）`;
  try {
    const body = await res.json();
    code = body.code ?? code;
    message = body.message ?? message;
  } catch {
    // 非 JSON 响应时保留默认提示。
  }
  throw Object.assign(new Error(message), { code });
}

export async function listFaultReport(): Promise<FaultReport[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.faultReport as unknown as FaultReport[])];
}

export async function fetchMergeBoard(): Promise<MergeBoardRow[]> {
  const res = await fetch(`${endpoint}/merge-board`);
  if (!res.ok) return parseError(res);
  return await res.json();
}

export async function registerFaultReport(payload: FaultReportForm): Promise<FaultReportRegisterResult> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) return parseError(res);
  return await res.json();
}

export async function voidFaultReport(id: number): Promise<FaultReportVoidResult> {
  const res = await fetch(`${endpoint}/${id}/void`, { method: "POST" });
  if (!res.ok) return parseError(res);
  return await res.json();
}

export async function saveFaultReport(payload: FaultReport) {
  console.info("save FaultReport", payload);
  return payload;
}
