export const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) : "—";
export const formatTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", hour12: false }) : "—";
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
