import { seed } from "../seed";
import type { FaultReport } from "../models/FaultReport";

// 内存存储：从种子数据深拷贝，服务重启后还原。
const rows: FaultReport[] = (seed.faultReport as unknown as FaultReport[]).map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

const byCallOrder = (a: FaultReport, b: FaultReport) => a.reported_at.localeCompare(b.reported_at) || a.id - b.id;

export const faultReportRepository = {
  findAll: (): FaultReport[] => rows,
  findById: (id: number): FaultReport | undefined => rows.find((row) => row.id === id),
  // 归并候选：在办主单（未并入他单、未作废）。
  findOpenMasters: (): FaultReport[] => rows.filter((row) => row.master_id === null && row.status === "OPEN"),
  findFollowers: (masterId: number): FaultReport[] => rows.filter((row) => row.master_id === masterId && row.status === "MERGED").sort(byCallOrder),
  insert: (row: Omit<FaultReport, "id">): FaultReport => {
    const saved: FaultReport = { ...row, id: nextId++ };
    rows.push(saved);
    return saved;
  },
  update: (id: number, patch: Partial<FaultReport>): FaultReport | undefined => {
    const row = rows.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
