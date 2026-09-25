import { defineStore } from "pinia";
import { createFaultReport, listFaultReport, voidFaultReport } from "../api/FaultReport";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { FaultReport } from "../types/FaultReport";
import type { FaultReportPayload } from "../types/FaultReportPayload";

export const useFaultReportStore = defineStore("faultReport", {
  state: () => ({ rows: [] as FaultReport[], loading: false, mutating: false }),
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listFaultReport();
      } finally {
        this.loading = false;
      }
    },
    async register(payload: FaultReportPayload) {
      this.mutating = true;
      try {
        const row = await createFaultReport(payload);
        console.info(row.status === "MERGED" ? LOG_TEMPLATES.FaultReport.merge : LOG_TEMPLATES.FaultReport.create, row.id);
        await this.load();
        return row;
      } finally {
        this.mutating = false;
      }
    },
    async voidMaster(id: number) {
      this.mutating = true;
      try {
        const result = await voidFaultReport(id);
        console.info(LOG_TEMPLATES.FaultReport.void, id);
        await this.load();
        return result;
      } finally {
        this.mutating = false;
      }
    }
  }
});
