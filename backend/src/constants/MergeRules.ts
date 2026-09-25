// 重复来电归并规则：同资产 + 同故障类型 + 首次来电后 N 分钟内并入主单。
export const MERGE_WINDOW_MINUTES = 30;
export const MERGE_WINDOW_MS = MERGE_WINDOW_MINUTES * 60 * 1000;

// 工单进入以下状态即视为“已派工”，对应故障主单不再接纳重复来电。
export const DISPATCH_LOCK_TICKET_STATUSES = ["ASSIGNED","ARRIVED","REPAIRING","RESTORED","CLOSED"] as const;
