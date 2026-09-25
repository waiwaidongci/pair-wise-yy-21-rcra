import { computed, type Ref } from "vue";
import { MERGE_WINDOW_MS, DISPATCH_LOCK_TICKET_STATUSES } from "../constants/MergeRules";
import type { FaultReport } from "../types/FaultReport";
import type { RepairTicket } from "../types/RepairTicket";

const byCallOrder = (a: FaultReport, b: FaultReport) =>
  Date.parse(a.reported_at) - Date.parse(b.reported_at) || a.id - b.id;

// 重复来电归并台共用逻辑：主单分组、跟进记录、对应工单与派工锁定判断。
export function useFaultMerge(reports: Ref<FaultReport[]>, tickets: Ref<RepairTicket[]>) {
  // 主单按首次来电倒序，最新一组排在最前。
  const masters = computed(() =>
    reports.value.filter((row) => row.merged_into_id === null).slice().sort(byCallOrder).reverse()
  );

  const childrenOf = (masterId: number) =>
    reports.value.filter((row) => row.merged_into_id === masterId).slice().sort(byCallOrder);

  // 跟进记录 = 主单本身 + 已并入的来电，按来电顺序排列。
  const groupOf = (master: FaultReport) => [master, ...childrenOf(master.id)];

  const ticketOf = (reportId: number) => tickets.value.find((row) => row.fault_report_id === reportId);

  const isLocked = (master: FaultReport) => {
    const ticket = ticketOf(master.id);
    return !!ticket && (DISPATCH_LOCK_TICKET_STATUSES as readonly string[]).includes(ticket.status);
  };

  const windowEndOf = (master: FaultReport) =>
    new Date(Date.parse(master.reported_at) + MERGE_WINDOW_MS).toISOString();

  return { masters, childrenOf, groupOf, ticketOf, isLocked, windowEndOf };
}
