import { mockData } from "../mocks/seedData";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { FaultReport } from "../types/FaultReport";
import type { FaultReportPayload } from "../types/FaultReportPayload";

const endpoint = "/api/fault-report";

const readError = async (res: Response) => {
  try {
    const body = await res.json();
    return body?.message ?? ERROR_MESSAGES.VALIDATION_FAILED;
  } catch {
    return ERROR_MESSAGES.VALIDATION_FAILED;
  }
};

const post = async (url: string, payload?: unknown) => {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {})
    });
  } catch {
    throw new Error(ERROR_MESSAGES.NETWORK_UNAVAILABLE);
  }
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
};

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

export async function createFaultReport(payload: FaultReportPayload): Promise<FaultReport> {
  return post(endpoint, payload);
}

export async function voidFaultReport(id: number): Promise<{ master: FaultReport; children: FaultReport[] }> {
  return post(`${endpoint}/${id}/void`);
}
