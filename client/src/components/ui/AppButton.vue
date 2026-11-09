<script setup>
import { LoaderCircle } from '@lucide/vue';

defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
});
defineEmits(['click']);
</script>

<template>
  <button
    class="app-button"
    :class="[`is-${variant}`, `is-${size}`, { 'is-block': block }]"
    :type="type"
    :disabled="loading || $attrs.disabled"
    @click="$emit('click', $event)"
  >
    <LoaderCircle v-if="loading" :size="18" class="spinner" aria-hidden="true" />
    <slot v-else name="icon" />
    <span><slot /></span>
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 13px;
  font-weight: 750;
  line-height: 1;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
}
.app-button:not(:disabled):active { transform: translateY(1px) scale(0.99); }
.app-button:disabled { cursor: not-allowed; opacity: 0.55; }
.is-primary { color: white; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); box-shadow: 0 10px 24px rgb(5 150 105 / 0.2); }
.is-primary:hover:not(:disabled) { box-shadow: 0 13px 30px rgb(5 150 105 / 0.28); }
.is-secondary { color: var(--color-primary-dark); border-color: #a7f3d0; background: #ecfdf5; }
.is-outline { color: var(--color-text); border-color: var(--color-border); background: white; }
.is-ghost { color: var(--color-primary-dark); background: transparent; }
.is-danger { color: var(--color-danger); border-color: #fecaca; background: #fff; }
.is-sm { min-height: 36px; padding-inline: 12px; border-radius: 10px; font-size: 0.82rem; }
.is-lg { min-height: 54px; padding-inline: 24px; border-radius: 15px; font-size: 0.98rem; }
.is-block { width: 100%; }
.spinner { animation: spin 800ms linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

