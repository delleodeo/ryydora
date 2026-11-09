<script setup>
import { Check, ChevronRight, Clock3, Leaf, ShieldCheck } from '@lucide/vue';
import { computed } from 'vue';

const props = defineProps({
  type: { type: String, required: true },
  selected: { type: Boolean, default: false },
  fare: { type: Number, default: null },
  loading: { type: Boolean, default: false },
  duration: { type: Number, default: null },
  availableCount: { type: Number, default: 0 },
});
defineEmits(['select']);

const isShared = computed(() => props.type === 'shared');
const title = computed(() => (isShared.value ? 'Shared Ride' : 'Non-Shared Ride'));
const subtitle = computed(() =>
  isShared.value ? 'Share the tricycle with other passengers' : 'Get the whole tricycle for yourself',
);
const features = computed(() =>
  isShared.value
    ? ['Share with other passengers', 'Lower individual fare', 'Seats protected by capacity rules']
    : ['Exclusive use', 'No additional passengers', 'Direct private booking'],
);
</script>

<template>
  <button
    class="ride-card"
    :class="{ selected, private: !isShared }"
    type="button"
    :aria-pressed="selected"
    @click="$emit('select', type)"
  >
    <span class="ride-visual" aria-hidden="true">🛺</span>

    <span class="ride-content">
      <span class="ride-heading">
        <span><strong>{{ title }}</strong><small>{{ subtitle }}</small></span>
        <span class="selector" aria-hidden="true"><Check v-if="selected" :size="16" /></span>
      </span>

      <span class="fare-row">
        <span v-if="loading" class="fare muted">Calculating…</span>
        <span v-else-if="fare != null" class="fare">₱{{ fare.toFixed(0) }}</span>
        <span v-else class="fare unavailable">Fare unavailable</span>
        <small v-if="fare != null">{{ isShared ? 'per person (est.)' : 'whole tricycle (est.)' }}</small>
      </span>

      <span class="features">
        <span v-for="feature in features" :key="feature"><Check :size="13" />{{ feature }}</span>
      </span>

      <span class="ride-meta">
        <span><Clock3 :size="15" />{{ duration == null ? 'Route time pending' : `${duration} min estimated` }}</span>
        <span v-if="isShared"><Leaf :size="15" />Lower-impact option</span>
        <span v-else><ShieldCheck :size="15" />Private trip</span>
      </span>

      <span class="availability">
        <span><small>Available Tricycles</small><strong>{{ availableCount }} nearby</strong></span>
        <ChevronRight :size="16" />
      </span>
    </span>
  </button>
</template>

<style scoped>
.ride-card {
  display: grid;
  width: 100%;
  grid-template-columns: 76px 1fr;
  align-items: start;
  gap: 14px;
  padding: 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 19px;
  background: white;
  color: var(--color-text);
  text-align: left;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.ride-card:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
.ride-card.selected { border-color: var(--color-primary); background: linear-gradient(135deg, #ecfdf5, #fff); box-shadow: 0 12px 30px rgb(5 150 105 / 0.12); }

.ride-visual {
  display: grid;
  width: 76px;
  height: 76px;
  place-items: center;
  border-radius: 22px;
  background: radial-gradient(circle at 40% 35%, #d1fae5, #a7f3d0);
  color: var(--color-primary-dark);
  font-size: 2.7rem;
  line-height: 1;
}

.private .ride-visual { background: radial-gradient(circle at 40% 35%, #f1f5f9, #dbe3ec); color: #334155; }
.ride-content { display: grid; min-width: 0; gap: 11px; }
.ride-heading { display: grid; grid-template-columns: 1fr auto; gap: 10px; }
.ride-heading > span:first-child { display: grid; gap: 3px; }
.ride-heading strong { font-size: 0.94rem; }
.ride-heading small { color: var(--color-text-soft); font-size: 0.69rem; line-height: 1.35; }

.selector {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border: 2px solid #94a3b8;
  border-radius: 50%;
  color: white;
}

.selected .selector { border-color: var(--color-primary); background: var(--color-primary); }
.fare-row { display: flex; align-items: baseline; gap: 7px; }
.fare { color: var(--color-text); font-size: 1.45rem; font-weight: 900; letter-spacing: -0.04em; }
.fare.unavailable { color: var(--color-text-soft); font-size: 0.8rem; letter-spacing: 0; }
.fare-row small { color: var(--color-text-soft); font-size: 0.65rem; }
.features { display: grid; gap: 5px; color: #475569; font-size: 0.67rem; }
.features > span { display: flex; align-items: center; gap: 6px; }
.features svg { color: var(--color-primary); }
.ride-meta { display: flex; flex-wrap: wrap; gap: 7px 13px; padding-top: 9px; border-top: 1px solid #e8edf2; color: var(--color-text-soft); font-size: 0.64rem; font-weight: 700; }
.ride-meta > span { display: inline-flex; align-items: center; gap: 5px; }
.ride-meta svg { color: var(--color-primary-dark); }
.availability { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 10px; border-radius: 11px; background: rgb(255 255 255 / 0.76); color: var(--color-primary-dark); }
.availability > span { display: grid; gap: 2px; }.availability small { color: var(--color-text-soft); font-size: 0.59rem; }.availability strong { font-size: 0.72rem; }

@media (max-width: 410px) {
  .ride-card { grid-template-columns: 58px 1fr; padding: 13px; }
  .ride-visual { width: 58px; height: 58px; border-radius: 17px; }
  .ride-visual { font-size: 2rem; }
}
</style>
