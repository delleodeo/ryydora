<script setup>
import { computed } from 'vue';
import { Check } from '@lucide/vue';

const props = defineProps({ status: { type: String, required: true } });
const steps = ['searching', 'accepted', 'driver_arriving', 'picked_up', 'completed'];
const labels = ['Searching', 'Accepted', 'Driver arriving', 'Picked up', 'Completed'];
const currentIndex = computed(() => steps.indexOf(props.status));
</script>

<template>
  <ol class="timeline" aria-label="Booking progress">
    <li v-for="(step, index) in steps" :key="step" :class="{ done: index <= currentIndex, active: index === currentIndex }">
      <span class="dot"><Check v-if="index < currentIndex" :size="12" /></span>
      <small>{{ labels[index] }}</small>
    </li>
  </ol>
</template>

<style scoped>
.timeline { display: grid; grid-template-columns: repeat(5, 1fr); padding: 0; margin: 0; list-style: none; }
li { position: relative; display: grid; justify-items: center; gap: 8px; color: #94a3b8; text-align: center; }
li::before { position: absolute; z-index: 0; top: 9px; right: 50%; left: -50%; height: 2px; background: var(--color-border); content: ''; }
li:first-child::before { display: none; }
.dot { z-index: 1; display: grid; width: 20px; height: 20px; place-items: center; border: 3px solid white; border-radius: 50%; background: #cbd5e1; box-shadow: 0 0 0 1px var(--color-border); }
li.done { color: var(--color-primary-dark); }
li.done::before { background: var(--color-accent); }
li.done .dot { background: var(--color-primary); box-shadow: 0 0 0 1px var(--color-primary); color: white; }
li.active .dot { box-shadow: 0 0 0 5px rgb(16 185 129 / 0.16); }
small { font-size: 0.6rem; font-weight: 700; }
</style>

