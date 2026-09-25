export const FaultReportStatus = ["OPEN", "MERGED", "VOID"] as const;
export type FaultReportStatus = (typeof FaultReportStatus)[number];
export const FaultReportStatusText: Record<FaultReportStatus, string> = {
  OPEN: "OPEN",
  MERGED: "MERGED",
  VOID: "VOID"
};
