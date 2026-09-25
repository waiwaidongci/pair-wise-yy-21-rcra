export const FaultReportStatus = ["OPEN","MERGED","VOID"] as const;
export type FaultReportStatus = (typeof FaultReportStatus)[number];
export const FaultReportStatusText: Record<FaultReportStatus, string> = {
  OPEN: "受理中",
  MERGED: "已并入",
  VOID: "已作废"
};
