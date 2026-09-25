import { TicketStatus } from "./TicketStatus";

// 重复来电归并规则：同一资产 + 同一故障类型 + 首次来电后 30 分钟内并入主单。
export const MERGE_WINDOW_MINUTES = 30;
export const MERGE_WINDOW_MS = MERGE_WINDOW_MINUTES * 60 * 1000;

// 工单进入这些状态即视为“已派工”，对应故障单不再接纳重复来电，也不允许作废。
export const DISPATCH_LOCK_TICKET_STATUS = TicketStatus.filter((status) => status !== "WAIT_DISPATCH");
