<script setup>
defineProps({
  compact: { type: Boolean, default: false },
  inverse: { type: Boolean, default: false },
  tagline: { type: String, default: 'Ride local. Ride safe.' },
});
</script>

<template>
  <div class="brand" :class="{ compact, inverse }" aria-label="RYDORA">
    <img src="/rydora-mark.svg" alt="" width="42" height="42" />
    <div v-if="!compact">
      <strong>Rydora</strong>
      <span>{{ tagline }}</span>
    </div>
  </div>
</template>

<style scoped>
.brand { display: inline-flex; min-width: 0; align-items: center; gap: 11px; }
.brand > div { min-width: 0; }
.brand img { width: 42px; height: 42px; border-radius: 12px; box-shadow: 0 7px 18px rgb(4 120 87 / 0.2); }
.brand strong { display: block; font-size: 1.3rem; line-height: 1; letter-spacing: -0.035em; }
.brand span { display: block; margin-top: 4px; color: var(--color-text-soft); font-size: 0.69rem; font-weight: 600; line-height: 1.25; }
.brand.inverse strong { color: white; }
.brand.inverse span { color: rgb(255 255 255 / 0.72); }
.compact img { width: 38px; height: 38px; }
</style>

