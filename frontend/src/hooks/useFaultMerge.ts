import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useFaultReportStore } from "../stores/FaultReportStore";
import type { FaultReportForm } from "../types/MergeBoard";

// 重复来电归并台：展开状态、登记、作废接续的页面级逻辑。
export function useFaultMerge() {
  const store = useFaultReportStore();
  const { board, loading, saving, offline, error } = storeToRefs(store);

  const expanded = ref<Set<number>>(new Set());
  const toggle = (masterId: number) => {
    const next = new Set(expanded.value);
    if (next.has(masterId)) next.delete(masterId);
    else next.add(masterId);
    expanded.value = next;
  };
  const isExpanded = (masterId: number) => expanded.value.has(masterId);

  const summary = computed(() => ({
    masters: board.value.length,
    merged: board.value.reduce((sum, row) => sum + row.followers.length, 0),
    locked: board.value.filter((row) => row.locked).length
  }));

  const register = (form: FaultReportForm) => store.register(form);
  const voidMaster = (masterId: number) => store.voidMaster(masterId);
  const refresh = () => store.load();

  return { board, loading, saving, offline, error, summary, expanded, toggle, isExpanded, register, voidMaster, refresh };
}
