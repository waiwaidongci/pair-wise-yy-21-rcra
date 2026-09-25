<script setup lang="ts">
import { computed } from "vue";
import { formatRisk } from "../../utils/formatters";

const props = defineProps<{ value: string }>();
const levelClass = computed(() => `lv-${props.value.toLowerCase()}`);
</script>

<template>
  <span class="priority-tag" :class="levelClass">{{ formatRisk(value) }}</span>
</template>

<style scoped>
.priority-tag { display: inline-flex; align-items: center; min-height: 24px; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 800; background: #e4efe4; color: #244b31; }
.priority-tag.lv-high { background: #f7e3c8; color: #8a5a12; }
.priority-tag.lv-critical { background: #f6d5c8; color: #93360f; }
.priority-tag.lv-extreme { background: #f3c5c5; color: #8f1d1d; }
</style>
