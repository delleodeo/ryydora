<script setup>
import { MapPin, Radio, X } from '@lucide/vue';
import { nextTick, ref, watch } from 'vue';
import AppButton from '../ui/AppButton.vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  modelValue: { type: String, default: '' },
  active: { type: Boolean, default: false },
  expiry: { type: String, default: '' },
  busy: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue', 'submit', 'stop', 'close']);
const noteInput = ref(null);
let previousFocus = null;

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement;
      await nextTick();
      noteInput.value?.focus();
      return;
    }
    previousFocus?.focus?.();
    previousFocus = null;
  },
);

function close() {
  if (!props.busy) emit('close');
}

function onKeydown(event) {
  if (event.key === 'Escape') close();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="roadside-modal-fade">
      <div v-if="open" class="roadside-modal-backdrop" @click.self="close" @keydown="onKeydown">
        <form
          class="roadside-modal card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="roadside-modal-title"
          aria-describedby="roadside-modal-description"
          @submit.prevent="$emit('submit')"
        >
          <button class="close-button" type="button" aria-label="Close roadside note" :disabled="busy" @click="close">
            <X :size="19" />
          </button>
          <div class="modal-heading">
            <span class="modal-icon"><Radio :size="24" /></span>
            <span>
              <span v-if="active" class="live-pill">Live on driver maps</span>
              <h2 id="roadside-modal-title">{{ active ? 'Update roadside note' : 'Add roadside note' }}</h2>
            </span>
          </div>
          <p id="roadside-modal-description">
            Tell nearby available drivers where you are going. This is separate from booking and creates no fare or ride record.
          </p>
          <label class="note-field">
            <span>Where are you going?</span>
            <textarea
              ref="noteInput"
              :value="modelValue"
              maxlength="180"
              rows="3"
              placeholder="e.g. Public market, main entrance"
              @input="$emit('update:modelValue', $event.target.value)"
            ></textarea>
            <small>{{ modelValue.length }}/180</small>
          </label>
          <div class="privacy-note">
            <MapPin :size="17" />
            <span v-if="active">Your current location is visible until {{ expiry }}.</span>
            <span v-else>Uses your current location and expires automatically after 15 minutes.</span>
          </div>
          <div class="modal-actions" :class="{ active }">
            <AppButton v-if="active" type="button" variant="danger" :disabled="busy" @click="$emit('stop')">
              Stop sharing
            </AppButton>
            <AppButton type="submit" :loading="busy">
              {{ active ? 'Update signal' : 'Show me to drivers' }}
            </AppButton>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.roadside-modal-backdrop { position: fixed; z-index: 2000; inset: 0; display: grid; place-items: center; padding: 20px; background: rgb(15 23 42 / 0.58); backdrop-filter: blur(3px); }.roadside-modal { position: relative; display: grid; width: min(100%, 450px); gap: 17px; padding: 24px; border: 0; box-shadow: 0 28px 80px rgb(15 23 42 / 0.3); }.close-button { position: absolute; top: 13px; right: 13px; display: grid; width: 36px; height: 36px; place-items: center; border: 0; border-radius: 10px; background: transparent; color: var(--color-text-soft); }.close-button:hover:not(:disabled) { background: #f1f5f9; color: var(--color-text); }.modal-heading { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 12px; padding-right: 38px; }.modal-heading > span:last-child { display: grid; gap: 5px; }.modal-heading h2 { margin: 0; font-size: 1.16rem; }.modal-icon { display: grid; width: 52px; height: 52px; place-items: center; border-radius: 16px; background: #ffedd5; color: #c2410c; }.live-pill { width: fit-content; padding: 4px 7px; border-radius: 999px; background: #dcfce7; color: #047857; font-size: 0.58rem; font-weight: 850; text-transform: uppercase; }.roadside-modal > p { margin: -4px 0 0; color: var(--color-text-soft); font-size: 0.8rem; line-height: 1.5; }.note-field { display: grid; gap: 7px; }.note-field > span { font-size: 0.74rem; font-weight: 800; }.note-field textarea { width: 100%; resize: vertical; border: 1px solid var(--color-border); border-radius: 12px; padding: 11px 12px; outline: 0; color: var(--color-text); font: inherit; font-size: 0.8rem; line-height: 1.45; }.note-field textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgb(16 185 129 / 0.12); }.note-field small { justify-self: end; color: var(--color-text-soft); font-size: 0.65rem; }.privacy-note { display: flex; align-items: flex-start; gap: 8px; padding: 10px 11px; border-radius: 11px; background: #f8fafc; color: var(--color-text-soft); font-size: 0.7rem; line-height: 1.4; }.privacy-note svg { flex: 0 0 auto; color: var(--color-primary); }.modal-actions { display: grid; }.modal-actions.active { grid-template-columns: 1fr 1fr; gap: 10px; }.roadside-modal-fade-enter-active, .roadside-modal-fade-leave-active { transition: opacity 160ms ease; }.roadside-modal-fade-enter-active .roadside-modal, .roadside-modal-fade-leave-active .roadside-modal { transition: transform 160ms ease, opacity 160ms ease; }.roadside-modal-fade-enter-from, .roadside-modal-fade-leave-to { opacity: 0; }.roadside-modal-fade-enter-from .roadside-modal, .roadside-modal-fade-leave-to .roadside-modal { transform: translateY(8px) scale(0.98); opacity: 0; }
@media (max-width: 480px) { .roadside-modal { align-self: end; padding: 22px 18px calc(22px + env(safe-area-inset-bottom)); border-radius: 22px 22px 16px 16px; }.modal-actions.active { grid-template-columns: 1fr; }.modal-actions.active > :last-child { grid-row: 1; } }
</style>
