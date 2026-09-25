export const FaultReportStatus = ["OPEN", "MERGED", "VOID"] as const;
export type FaultReportStatus = (typeof FaultReportStatus)[number];
