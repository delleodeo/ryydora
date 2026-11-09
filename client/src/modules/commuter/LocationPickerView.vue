<script setup>
import { LocateFixed, MapPin, MoveLeft, Search, X } from '@lucide/vue';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import RydoraMap from '../../components/maps/RydoraMap.vue';
import AppButton from '../../components/ui/AppButton.vue';
import { useGeolocation } from '../../composables/useGeolocation.js';
import { api, getApiError } from '../../services/api.js';
import { useBookingStore } from '../../stores/booking.js';
import { useUiStore } from '../../stores/ui.js';

const props = defineProps({ mode: { type: String, required: true } });
const router = useRouter();
const booking = useBookingStore();
const ui = useUiStore();
const geolocation = useGeolocation();
const selected = ref(props.mode === 'pickup' ? booking.pickup : booking.dropoff);
const center = ref(selected.value ? [selected.value.coordinates[1], selected.value.coordinates[0]] : geolocation.fallback);
const query = ref('');
const results = ref([]);
const searching = ref(false);
const title = computed(() => (props.mode === 'pickup' ? 'Set pickup location' : 'Set drop-off location'));
const markers = computed(() => selected.value ? [{ id: 'selected', position: [selected.value.coordinates[1], selected.value.coordinates[0]], type: props.mode, label: selected.value.label }] : []);

onMounted(async () => {
  if (props.mode === 'pickup' && !selected.value) await useCurrentLocation();
});
function selectCoordinates([latitude, longitude], label = 'Pinned location') {
  center.value = [latitude, longitude];
  selected.value = { type: 'Point', coordinates: [longitude, latitude], label };
}
async function useCurrentLocation() {
  const location = await geolocation.requestLocation();
  if (location) selectCoordinates(location, 'Current location');
  else if (geolocation.error) ui.notify(geolocation.error, 'warning');
}
async function search() {
  if (query.value.trim().length < 3) return;
  searching.value = true;
  try {
    const response = await api.get('/locations/search', { params: { q: query.value } });
    results.value = response.data.data.locations;
  } catch (error) {
    ui.notify(getApiError(error, 'Location search is unavailable.').message, 'error');
  } finally { searching.value = false; }
}
function selectResult(result) {
  selected.value = { type: 'Point', coordinates: result.coordinates, label: result.label, address: result.label };
  center.value = [result.coordinates[1], result.coordinates[0]];
  results.value = [];
  query.value = '';
}
function confirm() {
  if (!selected.value) return;
  booking.setLocation(props.mode, selected.value);
  router.push(props.mode === 'pickup' ? '/app/dropoff' : '/app/ride-options');
}
</script>

<template>
  <section class="picker-page">
    <div class="map-wrap"><RydoraMap :center="center" :markers="markers" height="100%" @map-click="selectCoordinates" /></div>
    <div class="top-controls">
      <button class="back" aria-label="Go back" @click="router.back()"><MoveLeft :size="20" /></button>
      <form class="search" @submit.prevent="search"><Search :size="18" /><input v-model="query" :placeholder="`Search ${mode === 'pickup' ? 'pickup' : 'destination'}`" aria-label="Search location" /><button v-if="query" type="button" aria-label="Clear search" @click="query = ''; results = []"><X :size="17" /></button></form>
      <div v-if="results.length" class="results card"><button v-for="result in results" :key="result.id" type="button" @click="selectResult(result)"><MapPin :size="17" /><span>{{ result.label }}</span></button></div>
    </div>
    <button class="locate" type="button" :disabled="geolocation.loading" @click="useCurrentLocation"><LocateFixed :size="20" /></button>
    <div class="sheet card">
      <span class="handle"></span><span class="eyebrow">{{ mode === 'pickup' ? 'Starting point' : 'Destination' }}</span><h1>{{ title }}</h1>
      <div class="selected"><span><MapPin :size="20" /></span><div><small>{{ selected ? 'Selected location' : 'Tap anywhere on the map' }}</small><strong>{{ selected?.label || 'No location selected yet' }}</strong></div></div>
      <AppButton block size="lg" :disabled="!selected" @click="confirm">Confirm {{ mode === 'pickup' ? 'pickup' : 'drop-off' }}</AppButton>
    </div>
  </section>
</template>

<style scoped>
.picker-page { position: fixed; z-index: 850; inset: 0; background: #e2e8f0; }.map-wrap { position: absolute; inset: 0; }
.top-controls { position: absolute; z-index: 600; top: max(15px, env(safe-area-inset-top)); right: 14px; left: 14px; display: grid; grid-template-columns: auto 1fr; gap: 9px; }.back { display: grid; width: 47px; height: 47px; place-items: center; border: 1px solid var(--color-border); border-radius: 14px; background: white; box-shadow: var(--shadow-md); }.search { display: flex; height: 47px; align-items: center; gap: 9px; padding: 0 13px; border: 1px solid var(--color-border); border-radius: 14px; background: white; box-shadow: var(--shadow-md); color: var(--color-text-soft); }.search input { width: 100%; border: 0; outline: 0; }.search button { display: grid; padding: 3px; border: 0; background: none; color: var(--color-text-soft); }.results { position: absolute; top: 56px; right: 0; left: 56px; overflow: hidden; }.results button { display: grid; width: 100%; grid-template-columns: auto 1fr; gap: 9px; padding: 12px; border: 0; border-bottom: 1px solid var(--color-border); background: white; color: var(--color-text); text-align: left; }.results span { overflow: hidden; font-size: 0.75rem; line-height: 1.35; text-overflow: ellipsis; }
.locate { position: absolute; z-index: 600; right: 17px; bottom: 310px; display: grid; width: 47px; height: 47px; place-items: center; border: 0; border-radius: 14px; background: white; box-shadow: var(--shadow-md); color: var(--color-primary-dark); }
.sheet { position: absolute; z-index: 600; right: 0; bottom: 0; left: 0; display: grid; gap: 14px; padding: 12px 20px max(20px, env(safe-area-inset-bottom)); border-radius: 23px 23px 0 0; box-shadow: 0 -14px 40px rgb(15 23 42 / 0.12); }.handle { width: 45px; height: 5px; justify-self: center; border-radius: 999px; background: #cbd5e1; }.sheet h1 { margin: -8px 0 0; font-size: 1.25rem; }.selected { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 12px; padding: 13px; border: 1px solid var(--color-border); border-radius: 13px; }.selected > span { display: grid; width: 41px; height: 41px; place-items: center; border-radius: 12px; background: #d1fae5; color: var(--color-primary-dark); }.selected div { display: grid; gap: 3px; min-width: 0; }.selected small { color: var(--color-text-soft); }.selected strong { overflow: hidden; font-size: 0.8rem; text-overflow: ellipsis; white-space: nowrap; }
@media (min-width: 780px) { .sheet { right: 28px; bottom: 28px; left: auto; width: 410px; border-radius: 22px; }.locate { right: 455px; bottom: 32px; } }
</style>

