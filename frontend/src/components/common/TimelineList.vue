<script setup lang="ts">
export interface TimelineItem {
  id: number | string;
  title: string;
  time?: string;
  tag?: string;
  desc?: string;
}

defineProps<{ title?: string; items?: TimelineItem[] }>();
</script>

<template>
  <div class="timeline">
    <strong v-if="title" class="timeline-title">{{ title }}</strong>
    <p v-if="!items || items.length === 0" class="timeline-empty">暂无跟进记录</p>
    <ol v-else class="timeline-list">
      <li v-for="item in items" :key="item.id">
        <span class="timeline-dot" aria-hidden="true"></span>
        <div class="timeline-body">
          <div class="timeline-head">
            <strong>{{ item.title }}</strong>
            <span v-if="item.tag" class="badge">{{ item.tag }}</span>
          </div>
          <p v-if="item.desc" class="timeline-desc">{{ item.desc }}</p>
        </div>
        <time v-if="item.time">{{ item.time }}</time>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.timeline-title { display: block; margin-bottom: 10px; }
.timeline-empty { margin: 0; color: #596257; font-size: 13px; }
.timeline-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.timeline-list li { display: grid; grid-template-columns: 14px 1fr auto; gap: 10px; align-items: start; }
.timeline-dot { width: 9px; height: 9px; margin-top: 5px; border-radius: 50%; background: #d39b46; box-shadow: 0 0 0 3px #f0e4cd; }
.timeline-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.timeline-desc { margin: 4px 0 0; color: #596257; font-size: 13px; }
time { color: #7d4d18; font-size: 12px; white-space: nowrap; }
</style>
