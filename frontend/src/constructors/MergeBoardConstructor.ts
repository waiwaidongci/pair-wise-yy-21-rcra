import type { FaultReport } from "../types/FaultReport";
import type { RepairTicket } from "../types/RepairTicket";
import type { Crew } from "../types/Crew";
import type { MergeBoardRow } from "../types/MergeBoard";
import { MERGE_WINDOW_MS, DISPATCH_LOCK_TICKET_STATUS } from "../constants/mergeRules";

const byCallOrder = (a: FaultReport, b: FaultReport) => a.reported_at.localeCompare(b.reported_at) || a.id - b.id;

// 离线模式下在前端组装归并台，规则与后端 FaultReportService.mergeBoard 保持一致。
export const buildMergeBoardRows = (
  reports: FaultReport[],
  tickets: RepairTicket[] = [],
  crews: Crew[] = []
): MergeBoardRow[] =>
  reports
    .filter((row) => row.master_id === null && row.status === "OPEN")
    .sort(byCallOrder)
    .map((master) => {
      const ticket = tickets.find((item) => item.fault_report_id === master.id) ?? null;
      const crew = ticket ? crews.find((item) => item.id === ticket.team_id) : undefined;
      return {
        master,
        followers: reports.filter((row) => row.master_id === master.id && row.status === "MERGED").sort(byCallOrder),
        ticket,
        crew_name: crew?.name ?? null,
        locked: !!ticket && (DISPATCH_LOCK_TICKET_STATUS as readonly string[]).includes(ticket.status),
        window_end: new Date(new Date(master.reported_at).getTime() + MERGE_WINDOW_MS).toISOString()
      };
    });
