import { seed } from "../seed";
import type { RepairTicket } from "../models/RepairTicket";

const rows: RepairTicket[] = seed.repairTicket.map((row) => ({ ...row })) as unknown as RepairTicket[];

export const repairTicketRepository = {
  findAll: () => rows,
  findByReportId: (faultReportId: number) => rows.find((row) => row.fault_report_id === faultReportId),
  save: (row: unknown) => row,
  update: (id: number, patch: Partial<RepairTicket>) => {
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return undefined;
    rows[index] = { ...rows[index], ...patch };
    return rows[index];
  }
};
