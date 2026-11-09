<script setup>
import { AlertTriangle, X } from '@lucide/vue';
import { nextTick, ref, watch } from 'vue';
import AppButton from './AppButton.vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Go back' },
  busy: { type: Boolean, default: false },
  danger: { type: Boolean, default: false },
});

const emit = defineEmits(['confirm', 'cancel']);
const cancelButton = ref(null);
let previousFocus = null;

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement;
      await nextTick();
      cancelButton.value?.$el?.focus();
      return;
    }
    previousFocus?.focus?.();
    previousFocus = null;
  },
);

function cancel() {
  if (!props.busy) emit('cancel');
}

function onKeydown(event) {
  if (event.key === 'Escape') cancel();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="modal-backdrop" @click.self="cancel" @keydown="onKeydown">
        <section
          class="confirmation-modal card"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirmation-title"
          aria-describedby="confirmation-message"
        >
          <button class="close-button" type="button" aria-label="Close confirmation" :disabled="busy" @click="cancel">
            <X :size="19" />
          </button>
          <span :class="['modal-icon', { danger }]" aria-hidden="true">
            <AlertTriangle :size="27" />
          </span>
          <div class="modal-copy">
            <h2 id="confirmation-title">{{ title }}</h2>
            <p id="confirmation-message">{{ message }}</p>
          </div>
          <div class="modal-actions">
            <AppButton ref="cancelButton" variant="outline" :disabled="busy" @click="cancel">
              {{ cancelLabel }}
            </AppButton>
            <AppButton :variant="danger ? 'danger' : 'primary'" :loading="busy" @click="$emit('confirm')">
              {{ confirmLabel }}
            </AppButton>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop { position: fixed; z-index: 2000; inset: 0; display: grid; place-items: center; padding: 20px; background: rgb(15 23 42 / 0.58); backdrop-filter: blur(3px); }
.confirmation-modal { position: relative; display: grid; width: min(100%, 430px); gap: 18px; padding: 24px; border: 0; box-shadow: 0 28px 80px rgb(15 23 42 / 0.3); }
.close-button { position: absolute; top: 13px; right: 13px; display: grid; width: 36px; height: 36px; place-items: center; border: 0; border-radius: 10px; color: var(--color-text-soft); background: transparent; }
.close-button:hover:not(:disabled) { background: #f1f5f9; color: var(--color-text); }
.modal-icon { display: grid; width: 54px; height: 54px; place-items: center; border-radius: 17px; color: var(--color-primary-dark); background: #d1fae5; }
.modal-icon.danger { color: var(--color-danger); background: #fee2e2; }
.modal-copy { display: grid; gap: 7px; }
.modal-copy h2 { margin: 0; font-size: 1.16rem; }
.modal-copy p { margin: 0; color: var(--color-text-soft); font-size: 0.84rem; line-height: 1.55; }
.modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 160ms ease; }
.modal-fade-enter-active .confirmation-modal, .modal-fade-leave-active .confirmation-modal { transition: transform 160ms ease, opacity 160ms ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .confirmation-modal, .modal-fade-leave-to .confirmation-modal { transform: translateY(8px) scale(0.98); opacity: 0; }
@media (max-width: 430px) { .confirmation-modal { align-self: end; padding: 22px 18px calc(22px + env(safe-area-inset-bottom)); border-radius: 22px 22px 16px 16px; }.modal-actions { grid-template-columns: 1fr; }.modal-actions > :last-child { grid-row: 1; } }
</style>
