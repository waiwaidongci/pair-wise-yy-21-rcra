import { seed } from "../seed";
import type { RepairTicket } from "../models/RepairTicket";

const rows: RepairTicket[] = (seed.repairTicket as unknown as RepairTicket[]).map((row) => ({ ...row }));

export const repairTicketRepository = {
  findAll: (): RepairTicket[] => rows,
  findByFaultReportId: (faultReportId: number): RepairTicket | undefined => rows.find((row) => row.fault_report_id === faultReportId),
  save: (row: unknown) => row
};
