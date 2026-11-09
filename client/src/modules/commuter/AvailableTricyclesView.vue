<script setup>
import { ArrowLeft, RefreshCw, SlidersHorizontal } from '@lucide/vue';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import RydoraMap from '../../components/maps/RydoraMap.vue';
import { useBookingStore } from '../../stores/booking.js';
import { useUiStore } from '../../stores/ui.js';

const router = useRouter();
const booking = useBookingStore();
const ui = useUiStore();
const loading = ref(true);
const requireThreeSeats = ref(false);

const drivers = computed(() =>
  requireThreeSeats.value
    ? booking.nearbyDrivers.filter((driver) => driver.vehicle.seats >= 3)
    : booking.nearbyDrivers,
);
const center = computed(() => {
  const coordinates = booking.pickup?.coordinates;
  return coordinates ? [coordinates[1], coordinates[0]] : [13.1734, 121.2788];
});
const markers = computed(() => [
  ...drivers.value.map((driver) => ({
    id: driver.id,
    position: [driver.location.coordinates[1], driver.location.coordinates[0]],
    type: 'tricycle',
    label: `${driver.name} · ${driver.vehicle.bodyNumber}`,
  })),
  ...(booking.pickup ? [{ id: 'pickup', position: center.value, type: 'pickup', label: booking.pickup.label }] : []),
]);
const routeGeometry = computed(() => booking.estimates[booking.rideType]?.route?.geometry || booking.estimates.shared?.route?.geometry);

function initials(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

async function refresh() {
  loading.value = true;
  try {
    await booking.loadNearbyDrivers();
  } catch {
    ui.notify('Nearby tricycles could not be refreshed.', 'error');
  } finally {
    loading.value = false;
  }
}

function selectDriver(driver) {
  ui.notify(`${driver.name} is currently available. Final assignment is confirmed after a driver accepts.`, 'success');
  router.push('/app/ride-options');
}

onMounted(() => {
  if (!booking.pickup) return router.replace('/app/home');
  return refresh();
});
</script>

<template>
  <section class="available-page">
    <header class="screen-header">
      <button type="button" aria-label="Go back" @click="router.back()"><ArrowLeft :size="21" /></button>
      <h1>Available Tricycles</h1>
      <button class="filter-button" type="button" :class="{ active: requireThreeSeats }" @click="requireThreeSeats = !requireThreeSeats">
        <SlidersHorizontal :size="17" /><span>Filter</span>
      </button>
    </header>

    <div class="drivers-map">
      <RydoraMap
        :center="center"
        :markers="markers"
        :route-geometry="routeGeometry"
        :interactive="false"
        height="100%"
        recenter-position="bottom-right"
      />
    </div>

    <div class="drivers-sheet">
      <span class="sheet-handle" aria-hidden="true"></span>
      <div class="sheet-heading">
        <div><h2>Nearby Available Tricycles</h2><p>Approved drivers near your pickup location</p></div>
        <button type="button" aria-label="Refresh nearby drivers" :disabled="loading" @click="refresh"><RefreshCw :size="20" :class="{ spinning: loading }" /></button>
      </div>

      <div v-if="loading" class="driver-list">
        <div v-for="item in 3" :key="item" class="driver-card skeleton"></div>
      </div>
      <div v-else-if="!drivers.length" class="empty-state">
        <div><span class="empty-icon">🛺</span><h3>No tricycles online nearby</h3><p>Try refreshing in a moment or confirm your booking so eligible drivers can be notified.</p><button type="button" @click="router.push('/app/ride-options')">Back to ride options</button></div>
      </div>
      <div v-else class="driver-list">
        <article v-for="driver in drivers" :key="driver.id" class="driver-card">
          <div class="driver-avatar"><img v-if="driver.avatar" :src="driver.avatar" alt="" /><span v-else>{{ initials(driver.name) }}</span><i aria-label="Online"></i></div>
          <div class="driver-copy">
            <strong>{{ driver.name }}</strong>
            <span>{{ driver.completedBookings }} completed trips</span>
            <small>{{ driver.distanceKm.toFixed(1) }} km away</small>
            <button type="button" @click="selectDriver(driver)">Select</button>
          </div>
          <div class="vehicle-visual" aria-hidden="true">🛺</div>
          <div class="vehicle-copy"><span>Available</span><small>Plate: {{ driver.vehicle.plateNumber }}</small><small>Seats: {{ driver.vehicle.seats }}</small></div>
        </article>
      </div>

      <p class="assignment-disclaimer">Selecting returns you to booking confirmation. A driver is assigned only after an eligible driver accepts your request.</p>
    </div>
  </section>
</template>

<style scoped>
.available-page { min-height: 100svh; background: #edf2f1; }
.screen-header { display: grid; min-height: 64px; grid-template-columns: 70px 1fr 70px; align-items: center; padding: max(8px, env(safe-area-inset-top)) 12px 8px; background: white; }
.screen-header > button:first-child { display: grid; width: 42px; height: 42px; place-items: center; border: 0; border-radius: 50%; background: white; color: var(--color-text); }.screen-header h1 { justify-self: center; margin: 0; font-size: 0.96rem; white-space: nowrap; }
.filter-button { display: inline-flex; min-height: 38px; align-items: center; justify-content: center; gap: 5px; padding: 0 9px; border: 1px solid var(--color-border); border-radius: 11px; background: white; color: #334155; font-size: 0.7rem; font-weight: 750; }.filter-button.active { border-color: var(--color-primary); background: #ecfdf5; color: var(--color-primary-dark); }
.drivers-map { height: 31svh; min-height: 235px; }
.drivers-sheet { position: relative; z-index: 650; display: grid; gap: 13px; min-height: 55svh; margin-top: -18px; padding: 9px 12px max(24px, env(safe-area-inset-bottom)); border-radius: 27px 27px 0 0; background: white; box-shadow: 0 -15px 45px rgb(15 23 42 / 0.14); }
.sheet-handle { width: 48px; height: 5px; justify-self: center; border-radius: 999px; background: #dbe1e8; }.sheet-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 5px; }.sheet-heading h2 { margin: 0 0 3px; font-size: 1.02rem; }.sheet-heading p { margin: 0; color: var(--color-text-soft); font-size: 0.68rem; }.sheet-heading button { display: grid; width: 40px; height: 40px; flex: 0 0 auto; place-items: center; border: 0; border-radius: 50%; background: white; color: #334155; }
.driver-list { display: grid; gap: 9px; }.driver-card { display: grid; min-height: 112px; grid-template-columns: auto minmax(0, 1fr) 62px auto; align-items: center; gap: 10px; padding: 11px; border: 1px solid var(--color-border); border-radius: 15px; background: white; box-shadow: var(--shadow-sm); }.driver-card.skeleton { height: 112px; }
.driver-avatar { position: relative; display: grid; width: 47px; height: 47px; place-items: center; border-radius: 50%; background: linear-gradient(145deg, #d1fae5, #86efac); color: var(--color-primary-deep); font-size: 0.72rem; font-weight: 850; }.driver-avatar img { width: 100%; height: 100%; border-radius: inherit; object-fit: cover; }.driver-avatar i { position: absolute; right: -1px; bottom: 1px; width: 11px; height: 11px; border: 2px solid white; border-radius: 50%; background: var(--color-primary); }
.driver-copy { display: grid; min-width: 0; gap: 3px; }.driver-copy strong { overflow: hidden; font-size: 0.75rem; text-overflow: ellipsis; white-space: nowrap; }.driver-copy span, .driver-copy small { color: var(--color-text-soft); font-size: 0.61rem; }.driver-copy button { width: 86px; min-height: 31px; margin-top: 4px; border: 0; border-radius: 9px; background: var(--color-primary); color: white; font-size: 0.68rem; font-weight: 800; }
.vehicle-visual { display: grid; width: 58px; height: 58px; place-items: center; border-radius: 18px; background: #f0fdf4; font-size: 2.35rem; }.vehicle-copy { display: grid; min-width: 68px; gap: 4px; }.vehicle-copy span { justify-self: start; padding: 5px 8px; border: 1px solid #bbf7d0; border-radius: 999px; background: #f0fdf4; color: #15803d; font-size: 0.59rem; font-weight: 800; }.vehicle-copy small { color: #475569; font-size: 0.58rem; white-space: nowrap; }
.empty-state { min-height: 250px; }.empty-state > div { max-width: 290px; }.empty-icon { display: block; margin-bottom: 10px; font-size: 2.5rem; }.empty-state h3 { margin-bottom: 6px; font-size: 0.92rem; }.empty-state p { margin-bottom: 16px; font-size: 0.7rem; line-height: 1.5; }.empty-state button { min-height: 39px; padding: 0 14px; border: 0; border-radius: 11px; background: var(--color-primary); color: white; font-size: 0.7rem; font-weight: 800; }
.assignment-disclaimer { margin: 0 5px; color: var(--color-text-soft); font-size: 0.61rem; line-height: 1.45; text-align: center; }.spinning { animation: spin 900ms linear infinite; }@keyframes spin { to { transform: rotate(360deg); } }

@media (min-width: 900px) {
  .available-page { display: grid; min-height: 100vh; grid-template-columns: minmax(0, 1.15fr) minmax(440px, 0.85fr); grid-template-rows: auto 1fr; gap: 20px 24px; padding: 24px; }.screen-header { grid-column: 1 / -1; border: 1px solid var(--color-border); border-radius: 18px; }.drivers-map { position: sticky; top: 108px; height: calc(100vh - 132px); min-height: 620px; overflow: hidden; border-radius: 24px; }.drivers-sheet { align-self: start; min-height: 0; margin: 0; padding: 18px; border: 1px solid var(--color-border); border-radius: 24px; box-shadow: var(--shadow-md); }.sheet-handle { display: none; }
}

@media (max-width: 410px) {
  .driver-card { grid-template-columns: auto minmax(0, 1fr) 52px; }.vehicle-copy { grid-column: 2 / -1; display: flex; align-items: center; gap: 8px; }.vehicle-visual { width: 50px; height: 50px; font-size: 2rem; }
}
</style>
