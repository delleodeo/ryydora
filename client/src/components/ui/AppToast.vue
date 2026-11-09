<script setup>
import { CheckCircle2, CircleAlert, Info, X } from '@lucide/vue';
import { useUiStore } from '../../stores/ui.js';

const ui = useUiStore();
const icons = { success: CheckCircle2, error: CircleAlert, info: Info, warning: CircleAlert };
</script>

<template>
  <div class="toast-region" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div v-for="toast in ui.toasts" :key="toast.id" class="toast" :class="toast.type" role="status">
        <component :is="icons[toast.type] || Info" :size="20" aria-hidden="true" />
        <span>{{ toast.message }}</span>
        <button aria-label="Dismiss notification" @click="ui.dismiss(toast.id)"><X :size="16" /></button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-region { position: fixed; z-index: 2000; top: max(16px, env(safe-area-inset-top)); right: 16px; display: grid; width: min(calc(100% - 32px), 390px); gap: 10px; pointer-events: none; }
.toast { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 11px; padding: 13px 14px; border: 1px solid var(--color-border); border-radius: 14px; background: rgb(255 255 255 / 0.97); box-shadow: var(--shadow-md); color: var(--color-text); pointer-events: auto; backdrop-filter: blur(12px); }
.toast.success > svg { color: var(--color-primary); }
.toast.error > svg { color: var(--color-danger); }
.toast.warning > svg { color: var(--color-warning); }
.toast span { font-size: 0.86rem; font-weight: 650; line-height: 1.4; }
.toast button { display: grid; width: 28px; height: 28px; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--color-text-soft); }
.toast-enter-active, .toast-leave-active { transition: all 180ms ease; }
.toast-enter-from, .toast-leave-to { transform: translateY(-8px); opacity: 0; }
</style>

