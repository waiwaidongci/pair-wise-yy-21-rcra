<script lang="ts">
export interface TimelineItem {
  time: string;
  title: string;
  desc?: string;
  tag?: string;
}
</script>

<script setup lang="ts">
withDefaults(defineProps<{ title?: string; items?: TimelineItem[] }>(), { items: () => [] });
</script>

<template>
  <div class="timeline">
    <strong v-if="title" class="timeline-title">{{ title }}</strong>
    <ol>
      <li v-for="(item, index) in items" :key="index">
        <span class="timeline-time">{{ item.time }}</span>
        <div class="timeline-body">
          <b>{{ item.title }}</b>
          <p v-if="item.desc">{{ item.desc }}</p>
        </div>
        <em v-if="item.tag" class="timeline-tag">{{ item.tag }}</em>
      </li>
    </ol>
  </div>
</template>
