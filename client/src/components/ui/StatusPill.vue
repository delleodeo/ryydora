<script setup>
import { computed } from 'vue';
const props = defineProps({ status: { type: String, required: true } });
const label = computed(() => props.status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()));
const tone = computed(() => {
  if (['completed', 'active', 'available', 'approved', 'picked_up'].includes(props.status)) return 'success';
  if (['cancelled', 'rejected', 'suspended', 'inactive'].includes(props.status)) return 'danger';
  if (['accepted', 'driver_arriving', 'on_ride'].includes(props.status)) return 'info';
  return 'warning';
});
</script>

<template><span class="pill" :class="tone">{{ label }}</span></template>

<style scoped>
.pill { display: inline-flex; min-height: 25px; align-items: center; padding: 3px 9px; border-radius: 999px; font-size: 0.7rem; font-weight: 800; white-space: nowrap; }
.success { color: #047857; background: #d1fae5; }
.danger { color: #b91c1c; background: #fee2e2; }
.info { color: #1d4ed8; background: #dbeafe; }
.warning { color: #a16207; background: #fef3c7; }
</style>

