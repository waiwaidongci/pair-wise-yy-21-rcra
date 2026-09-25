<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import StatCard from "../components/common/StatCard.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import TimelineList, { type TimelineItem } from "../components/common/TimelineList.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { useFaultReportStore } from "../stores/FaultReportStore";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useGridAssetStore } from "../stores/GridAssetStore";
import { useFaultMerge } from "../hooks/useFaultMerge";
import { createFaultReportForm, SEVERITY_OPTIONS, REPORT_CHANNEL_OPTIONS } from "../constructors/FaultReportConstructor";
import { FaultType } from "../constants/FaultType";
import { FaultReportStatusText } from "../constants/FaultReportStatus";
import { MERGE_WINDOW_MINUTES } from "../constants/MergeRules";
import { STATUS_TEXT } from "../constants/statusText";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { formatDateTime, formatRisk } from "../utils/formatters";
import type { FaultReport } from "../types/FaultReport";

const faultReportStore = useFaultReportStore();
const repairTicketStore = useRepairTicketStore();
const gridAssetStore = useGridAssetStore();
const { rows: reportRows } = storeToRefs(faultReportStore);
const { rows: ticketRows } = storeToRefs(repairTicketStore);
const { rows: assetRows } = storeToRefs(gridAssetStore);

const { masters, groupOf, ticketOf, isLocked, windowEndOf } = useFaultMerge(reportRows, ticketRows);

const localDateTimeValue = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const form = ref(createFaultReportForm({ reported_at: localDateTimeValue(new Date()) }));
const feedback = ref<{ kind: "ok" | "err"; text: string } | null>(null);
const expandedIds = ref<number[]>([]);

const assetOf = (id: number) => assetRows.value.find((row) => row.id === id);
const assetLabel = (id: number) => {
  const asset = assetOf(id);
  return asset ? `${asset.asset_code}｜${asset.location_desc}` : `资产 #${id}`;
};
const faultTypeText = (value: string) => STATUS_TEXT.FaultTypeZh[value as keyof typeof STATUS_TEXT.FaultTypeZh] ?? value;
const reportStatusText = (value: string) => FaultReportStatusText[value as keyof typeof FaultReportStatusText] ?? value;
const ticketStatusText = (value: string) => STATUS_TEXT.TicketStatusZh[value as keyof typeof STATUS_TEXT.TicketStatusZh] ?? value;

const todayCalls = computed(() => {
  const today = new Date().toDateString();
  return reportRows.value.filter((row) => new Date(row.reported_at).toDateString() === today).length;
});
const openMasters = computed(() => masters.value.filter((row) => row.status === "OPEN"));
const mergedCalls = computed(() => reportRows.value.filter((row) => row.status === "MERGED"));
const lockedMasters = computed(() => masters.value.filter((row) => isLocked(row)));

const toggleExpand = (id: number) => {
  expandedIds.value = expandedIds.value.includes(id)
    ? expandedIds.value.filter((row) => row !== id)
    : [...expandedIds.value, id];
};

const timelineOf = (master: FaultReport): TimelineItem[] =>
  groupOf(master).map((call) => ({
    id: call.id,
    title: `${call.reporter_name} · ${call.phone}`,
    time: formatDateTime(call.reported_at),
    tag: call.id === master.id ? (master.status === "VOID" ? "主单 · 已作废" : "主单") : reportStatusText(call.status),
    desc: `${call.report_channel}｜${call.address_desc}`
  }));

const submit = async () => {
  feedback.value = null;
  if (!form.value.reporter_name || !form.value.phone || !form.value.asset_id) {
    feedback.value = { kind: "err", text: ERROR_MESSAGES.VALIDATION_FAILED };
    return;
  }
  try {
    const row = await faultReportStore.register({
      ...form.value,
      reported_at: form.value.reported_at ? new Date(form.value.reported_at).toISOString() : new Date().toISOString()
    });
    feedback.value = row.status === "MERGED"
      ? { kind: "ok", text: `同资产同故障类型 ${MERGE_WINDOW_MINUTES} 分钟内已有主单，已并入主单 #${row.merged_into_id}（来电单 #${row.id}）` }
      : { kind: "ok", text: `已新立主单 #${row.id}，${MERGE_WINDOW_MINUTES} 分钟内的重复来电将自动并入` };
    form.value = createFaultReportForm({ reported_at: localDateTimeValue(new Date()), asset_id: form.value.asset_id });
  } catch (err) {
    feedback.value = { kind: "err", text: err instanceof Error ? err.message : ERROR_MESSAGES.VALIDATION_FAILED };
  }
};

const voidMaster = async (master: FaultReport) => {
  if (!window.confirm(`确认作废主单 #${master.id}？并入的来电将按来电顺序接续。`)) return;
  feedback.value = null;
  try {
    const result = await faultReportStore.voidMaster(master.id);
    await repairTicketStore.load();
    const successor = result.children.find((row) => row.status === "OPEN");
    feedback.value = successor
      ? { kind: "ok", text: `主单 #${master.id} 已作废，来电单 #${successor.id} 按来电顺序接续为主单` }
      : { kind: "ok", text: `主单 #${master.id} 已作废，无待接续的并入来电` };
  } catch (err) {
    feedback.value = { kind: "err", text: err instanceof Error ? err.message : ERROR_MESSAGES.VALIDATION_FAILED };
  }
};

onMounted(() => {
  faultReportStore.load();
  repairTicketStore.load();
  gridAssetStore.load();
});
</script>

<template>
  <section class="metrics">
    <StatCard label="受理中主单" :value="openMasters.length" />
    <StatCard label="今日来电" :value="todayCalls" />
    <StatCard label="已并入来电" :value="mergedCalls.length" />
    <StatCard label="派工锁定主单" :value="lockedMasters.length" />
  </section>

  <p v-if="feedback" class="feedback" :class="feedback.kind">{{ feedback.text }}</p>

  <section class="workbench">
    <div class="panel wide">
      <h2>重复来电归并台</h2>
      <EmptyState v-if="masters.length === 0" />
      <article v-for="master in masters" :key="master.id" class="master" :class="{ voided: master.status === 'VOID' }">
        <header class="master-head">
          <strong>#{{ master.id }} {{ assetLabel(master.asset_id) }}</strong>
          <span class="master-tags">
            <span class="badge">{{ faultTypeText(master.fault_type) }}</span>
            <PriorityTag :value="master.severity" />
            <StatusBadge :value="reportStatusText(master.status)" />
            <span v-if="isLocked(master)" class="badge locked">已派工 · 停止归并</span>
          </span>
        </header>
        <p class="master-meta">
          首次来电 {{ formatDateTime(master.reported_at) }}
          <template v-if="master.status === 'OPEN'">｜归并窗口截止 {{ formatDateTime(windowEndOf(master)) }}</template>
          ｜来电 {{ groupOf(master).length }} 通
        </p>
        <p class="master-meta">
          对应工单：
          <template v-if="ticketOf(master.id)">#{{ ticketOf(master.id)!.id }} · {{ ticketStatusText(ticketOf(master.id)!.status) }}</template>
          <template v-else>未生成工单</template>
        </p>
        <div class="master-actions">
          <button class="action" @click="toggleExpand(master.id)">
            {{ expandedIds.includes(master.id) ? "收起跟进记录" : `展开跟进记录（${groupOf(master).length}）` }}
          </button>
          <button
            v-if="master.status === 'OPEN'"
            class="action danger"
            :disabled="isLocked(master) || faultReportStore.mutating"
            :title="isLocked(master) ? '已派工的主单不可作废' : '作废后并入来电按来电顺序接续'"
            @click="voidMaster(master)"
          >作废主单</button>
        </div>
        <div v-if="expandedIds.includes(master.id)" class="master-detail">
          <TimelineList title="跟进记录（按来电顺序）" :items="timelineOf(master)" />
          <p class="ticket-line">
            对应工单：
            <template v-if="ticketOf(master.id)">
              #{{ ticketOf(master.id)!.id }} · {{ ticketStatusText(ticketOf(master.id)!.status) }} · 派工 {{ formatDateTime(ticketOf(master.id)!.assigned_at) }} · 复电 {{ formatDateTime(ticketOf(master.id)!.restored_at) }}
            </template>
            <template v-else>未生成工单</template>
          </p>
        </div>
      </article>
    </div>

    <div class="panel">
      <h2>登记报修</h2>
      <form class="report-form" @submit.prevent="submit">
        <label>来电人<input v-model.trim="form.reporter_name" placeholder="来电人姓名" /></label>
        <label>联系电话<input v-model.trim="form.phone" placeholder="手机或固话" /></label>
        <label>故障资产
          <select v-model.number="form.asset_id">
            <option :value="0" disabled>请选择资产</option>
            <option v-for="asset in assetRows" :key="asset.id" :value="asset.id">
              {{ asset.asset_code }}｜{{ asset.feeder_line }}｜{{ asset.location_desc }}
            </option>
          </select>
        </label>
        <label>故障类型
          <select v-model="form.fault_type">
            <option v-for="value in FaultType" :key="value" :value="value">{{ faultTypeText(value) }}</option>
          </select>
        </label>
        <label>严重度
          <select v-model="form.severity">
            <option v-for="value in SEVERITY_OPTIONS" :key="value" :value="value">{{ formatRisk(value) }}</option>
          </select>
        </label>
        <label>报修渠道
          <select v-model="form.report_channel">
            <option v-for="value in REPORT_CHANNEL_OPTIONS" :key="value" :value="value">{{ value }}</option>
          </select>
        </label>
        <label>来电时间<input v-model="form.reported_at" type="datetime-local" /></label>
        <label>地址描述<input v-model.trim="form.address_desc" placeholder="故障地址或影响范围" /></label>
        <button class="action primary" type="submit" :disabled="faultReportStore.mutating">登记来电</button>
      </form>
      <div class="rules">
        <h2>归并规则</h2>
        <p>同一资产、同一故障类型，且在主单首次来电后 {{ MERGE_WINDOW_MINUTES }} 分钟内的来电自动并入主单，各自来电人与时间保留在跟进记录中。</p>
        <p>已派工的故障单不再接纳重复来电；主单作废时，并入来电按来电顺序接续下一条作为主单。</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.metrics { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.feedback { margin: 0; padding: 10px 14px; border-radius: 8px; font-weight: 700; }
.feedback.ok { background: #e4efe4; color: #244b31; }
.feedback.err { background: #f3c5c5; color: #8f1d1d; }
.master { border-top: 1px solid #e4e0d3; padding: 14px 0; display: grid; gap: 6px; }
.master.voided { opacity: 0.6; }
.master-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.master-tags { display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.badge.locked { background: #f6d5c8; color: #93360f; }
.master-meta { margin: 0; color: #596257; font-size: 13px; }
.master-actions { display: flex; gap: 8px; margin-top: 4px; }
.action { border: 1px solid #c9d0c3; background: #fbfaf4; color: #274335; padding: 6px 12px; border-radius: 6px; font-weight: 700; }
.action:hover:not(:disabled) { background: #eef1e8; }
.action:disabled { opacity: 0.5; cursor: not-allowed; }
.action.danger { color: #8f1d1d; border-color: #e0b3b3; }
.action.primary { background: #274335; color: #f5f1e6; border-color: #274335; }
.action.primary:hover:not(:disabled) { background: #35594a; color: #f5f1e6; }
.master-detail { border-left: 3px solid #d39b46; padding: 10px 0 2px 14px; margin-top: 6px; display: grid; gap: 10px; }
.ticket-line { margin: 0; font-size: 13px; color: #274335; font-weight: 700; }
.report-form { display: grid; gap: 10px; }
.report-form label { display: grid; gap: 4px; font-size: 13px; font-weight: 700; color: #274335; }
.report-form input, .report-form select { padding: 8px 10px; border: 1px solid #c9d0c3; border-radius: 6px; background: #fff; font: inherit; }
.rules { margin-top: 18px; border-top: 1px dashed #b8b09f; padding-top: 12px; }
.rules p { margin: 0 0 8px; color: #596257; font-size: 13px; line-height: 1.6; }
@media (max-width: 760px) { .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
