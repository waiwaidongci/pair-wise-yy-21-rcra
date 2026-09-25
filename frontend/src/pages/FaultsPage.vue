<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import StatCard from "../components/common/StatCard.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import TimelineList from "../components/common/TimelineList.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { useFaultMerge } from "../hooks/useFaultMerge";
import { useGridAssetStore } from "../stores/GridAssetStore";
import { createFaultReportForm } from "../constructors/FaultReportConstructor";
import type { TimelineItem } from "../components/common/TimelineList.vue";
import type { FaultReportForm, MergeBoardRow } from "../types/MergeBoard";
import { FaultType, FaultTypeTextZh } from "../constants/FaultType";
import { TicketStatusTextZh } from "../constants/TicketStatus";
import { MERGE_WINDOW_MINUTES } from "../constants/mergeRules";
import { formatDate, formatRisk, formatTime } from "../utils/formatters";

const { board, loading, saving, offline, error, summary, toggle, isExpanded, register, voidMaster, refresh } = useFaultMerge();
const gridAssetStore = useGridAssetStore();

const form = reactive<FaultReportForm>(createFaultReportForm());
const notice = ref<{ type: "ok" | "err"; text: string } | null>(null);

const severityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const channelOptions = ["95598", "电话", "微信", "现场"] as const;

const assetLabel = (assetId: number) => {
  const asset = gridAssetStore.rows.find((item) => item.id === assetId);
  return asset ? `${asset.asset_code} · ${asset.feeder_line}` : `资产 #${assetId}`;
};
const faultTypeLabel = (value: string) => FaultTypeTextZh[value as keyof typeof FaultTypeTextZh] ?? value;
const ticketStatusLabel = (value: string) => TicketStatusTextZh[value as keyof typeof TicketStatusTextZh] ?? value;

const resetForm = () => Object.assign(form, createFaultReportForm());

const submit = async () => {
  notice.value = null;
  try {
    const result = await register({
      ...form,
      asset_id: Number(form.asset_id),
      reported_at: new Date(form.reported_at).toISOString()
    });
    notice.value = result.merged
      ? { type: "ok", text: `重复来电已并入主单 #${result.master?.id}（${result.master?.reporter_name} ${formatTime(result.master?.reported_at)} 首次来电），来电人与时间各自保留。` }
      : { type: "ok", text: `已开立主单 #${result.row.id}，${MERGE_WINDOW_MINUTES} 分钟归并窗口开始计时。` };
    resetForm();
  } catch {
    notice.value = { type: "err", text: error.value ?? "登记失败，请稍后重试" };
  }
};

const onVoid = async (row: MergeBoardRow) => {
  if (!window.confirm(`确认作废主单 #${row.master.id}？作废后将按来电顺序接续下一条记录。`)) return;
  notice.value = null;
  try {
    const result = await voidMaster(row.master.id);
    notice.value = result.successor
      ? { type: "ok", text: `主单 #${row.master.id} 已作废，#${result.successor.id}（${result.successor.reporter_name} ${formatTime(result.successor.reported_at)} 来电）接续为新主单。` }
      : { type: "ok", text: `主单 #${row.master.id} 已作废，该单无跟进记录需要接续。` };
  } catch {
    notice.value = { type: "err", text: error.value ?? "作废失败，请稍后重试" };
  }
};

// 展开后的来电时间线：主单首次来电在前，跟进记录按来电顺序排列。
const timelineItems = (row: MergeBoardRow): TimelineItem[] => [
  {
    time: formatTime(row.master.reported_at),
    title: `${row.master.reporter_name} · ${row.master.phone}`,
    desc: row.master.address_desc,
    tag: "主单首次来电"
  },
  ...row.followers.map((item) => ({
    time: formatTime(item.reported_at),
    title: `${item.reporter_name} · ${item.phone}`,
    desc: item.address_desc,
    tag: `并入 #${row.master.id}`
  }))
];

const windowText = (row: MergeBoardRow) => {
  const ended = new Date(row.window_end).getTime() < Date.now();
  return ended ? `归并窗口已于 ${formatTime(row.window_end)} 关闭` : `归并窗口至 ${formatTime(row.window_end)}`;
};

const empty = computed(() => !loading.value && board.value.length === 0);

onMounted(async () => {
  await Promise.all([refresh(), gridAssetStore.load()]);
});
</script>

<template>
  <div class="faults-console">
    <section class="metrics">
      <StatCard label="在办主单" :value="summary.masters" />
      <StatCard label="已归并来电" :value="summary.merged" />
      <StatCard label="已派工停止归并" :value="summary.locked" />
    </section>

    <section class="console-grid">
      <div class="panel register-panel">
        <h2>登记报修</h2>
        <p class="hint">同一资产、同一故障类型，首次来电后 {{ MERGE_WINDOW_MINUTES }} 分钟内的后续来电自动并入原单；已派工故障单不再接纳。</p>
        <form class="register-form" @submit.prevent="submit">
          <label>来电人<input v-model="form.reporter_name" required placeholder="姓名" /></label>
          <label>联系电话<input v-model="form.phone" required placeholder="手机号" /></label>
          <label>故障资产
            <select v-model="form.asset_id" required>
              <option :value="null" disabled>请选择资产</option>
              <option v-for="asset in gridAssetStore.rows" :key="asset.id" :value="asset.id">
                {{ asset.asset_code }} · {{ asset.feeder_line }}
              </option>
            </select>
          </label>
          <label>故障类型
            <select v-model="form.fault_type">
              <option v-for="type in FaultType" :key="type" :value="type">{{ FaultTypeTextZh[type] }}</option>
            </select>
          </label>
          <label>严重度
            <select v-model="form.severity">
              <option v-for="level in severityOptions" :key="level" :value="level">{{ formatRisk(level) }}</option>
            </select>
          </label>
          <label>来电渠道
            <select v-model="form.report_channel">
              <option v-for="channel in channelOptions" :key="channel" :value="channel">{{ channel }}</option>
            </select>
          </label>
          <label class="span-2">来电时间<input v-model="form.reported_at" type="datetime-local" required /></label>
          <label class="span-2">地址描述<textarea v-model="form.address_desc" rows="2" placeholder="故障位置 / 现象" /></label>
          <button class="primary" type="submit" :disabled="saving">{{ saving ? "提交中…" : "登记并自动归并" }}</button>
        </form>
        <p v-if="notice" class="notice" :class="notice.type">{{ notice.text }}</p>
      </div>

      <div class="panel board-panel">
        <div class="panel-head">
          <h2>重复来电归并台</h2>
          <StatusBadge v-if="offline" value="OFFLINE · 本地种子数据" />
          <button class="ghost" type="button" @click="refresh">刷新</button>
        </div>
        <EmptyState v-if="empty" />
        <article v-for="row in board" :key="row.master.id" class="merge-group" :class="{ locked: row.locked }">
          <header class="merge-head">
            <div class="merge-main">
              <strong class="master-id">主单 #{{ row.master.id }}</strong>
              <span>{{ row.master.reporter_name }} · {{ row.master.phone }}</span>
              <span>{{ formatTime(row.master.reported_at) }} 来电</span>
              <PriorityTag :value="row.master.severity" />
            </div>
            <div class="merge-meta">
              <span>{{ assetLabel(row.master.asset_id) }}</span>
              <span>{{ faultTypeLabel(row.master.fault_type) }}</span>
              <StatusBadge v-if="row.locked" value="已派工 · 停止归并" />
              <StatusBadge v-else :value="windowText(row)" />
              <button class="ghost" type="button" @click="toggle(row.master.id)">
                {{ isExpanded(row.master.id) ? "收起" : `展开跟进（${row.followers.length}）` }}
              </button>
              <button class="danger" type="button" :disabled="row.locked" :title="row.locked ? '已派工故障单不允许作废' : '主单作废后按来电顺序接续'" @click="onVoid(row)">作废主单</button>
            </div>
          </header>

          <div v-if="isExpanded(row.master.id)" class="merge-detail">
            <TimelineList title="来电跟进记录（各自保留来电人与时间）" :items="timelineItems(row)" />
            <div class="ticket-box" :class="{ empty: !row.ticket }">
              <template v-if="row.ticket">
                <strong>对应工单 #{{ row.ticket.id }}</strong>
                <span>班组：{{ row.crew_name ?? `#${row.ticket.team_id}` }}</span>
                <StatusBadge :value="ticketStatusLabel(row.ticket.status)" />
                <PriorityTag :value="row.ticket.priority" />
                <span>派工时间：{{ formatDate(row.ticket.assigned_at) }}</span>
                <span>复电时间：{{ formatDate(row.ticket.restored_at) }}</span>
              </template>
              <template v-else>尚未生成抢修工单，归并窗口内的重复来电继续并入本单。</template>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
