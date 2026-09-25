<script setup lang="ts">
import { formatRisk } from "../../utils/formatters";
defineProps<{ value: string }>();
</script>

<template><span class="priority-tag" :data-level="value">{{ formatRisk(value) }}</span></template>
