<script setup>
import { computed } from 'vue';

const model = defineModel({ type: [String, Number], default: '' });
const props = defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
});
const inputId = computed(() => `field-${props.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
</script>

<template>
  <label class="field" :for="inputId">
    <span class="label">{{ label }}</span>
    <span class="input-wrap" :class="{ invalid: error }">
      <slot name="icon" />
      <input
        :id="inputId"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error || hint ? `${inputId}-help` : undefined"
        v-bind="$attrs"
      />
      <slot name="suffix" />
    </span>
    <small v-if="error || hint" :id="`${inputId}-help`" :class="{ error: error }">{{ error || hint }}</small>
  </label>
</template>

<style scoped>
.field { display: grid; gap: 7px; }
.label { color: #334155; font-size: 0.82rem; font-weight: 700; }
.input-wrap { display: flex; min-height: 49px; align-items: center; gap: 10px; padding: 0 14px; border: 1px solid var(--color-border); border-radius: 13px; background: white; color: var(--color-text-soft); transition: border-color 150ms ease, box-shadow 150ms ease; }
.input-wrap:focus-within { border-color: var(--color-accent); box-shadow: 0 0 0 4px rgb(16 185 129 / 0.1); }
.input-wrap.invalid { border-color: var(--color-danger); }
input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--color-text); font-size: 0.92rem; }
input::placeholder { color: #94a3b8; }
small { color: var(--color-text-soft); font-size: 0.74rem; }
small.error { color: var(--color-danger); }
</style>

