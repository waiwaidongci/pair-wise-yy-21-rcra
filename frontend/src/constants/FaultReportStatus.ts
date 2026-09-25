export const FaultReportStatus = ["OPEN", "MERGED", "VOID"] as const;
export type FaultReportStatus = (typeof FaultReportStatus)[number];
export const FaultReportStatusText: Record<FaultReportStatus, string> = {
  OPEN: "在办",
  MERGED: "已归并",
  VOID: "已作废"
};
