import { seed } from "../seed";
import type { FaultReport } from "../models/FaultReport";

const rows: FaultReport[] = seed.faultReport.map((row) => ({ ...row })) as unknown as FaultReport[];

export const faultReportRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  insert: (row: FaultReport) => { rows.push(row); return row; },
  update: (id: number, patch: Partial<FaultReport>) => {
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return undefined;
    rows[index] = { ...rows[index], ...patch };
    return rows[index];
  },
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1
};
