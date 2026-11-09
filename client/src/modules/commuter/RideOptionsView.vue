<script setup>
import { ArrowDownUp, ArrowLeft, ChevronRight, Minus, Plus, Route, UserRound, UsersRound } from '@lucide/vue';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import RideOptionCard from '../../components/bookings/RideOptionCard.vue';
import RydoraMap from '../../components/maps/RydoraMap.vue';
import AppButton from '../../components/ui/AppButton.vue';
import { useBookingStore } from '../../stores/booking.js';
import { useUiStore } from '../../stores/ui.js';

const router = useRouter();
const booking = useBookingStore();
const ui = useUiStore();
const selected = ref(booking.rideType || 'shared');
const estimating = ref(true);

const route = computed(() => booking.estimates.shared?.route || booking.estimates.non_shared?.route || null);
const routeCenter = computed(() => {
  if (!booking.pickup || !booking.dropoff) return [13.1734, 121.2788];
  return [
    (booking.pickup.coordinates[1] + booking.dropoff.coordinates[1]) / 2,
    (booking.pickup.coordinates[0] + booking.dropoff.coordinates[0]) / 2,
  ];
});
const markers = computed(() => {
  if (!booking.pickup || !booking.dropoff) return [];
  return [
    { id: 'pickup', position: [booking.pickup.coordinates[1], booking.pickup.coordinates[0]], type: 'pickup', label: booking.pickup.label },
    { id: 'dropoff', position: [booking.dropoff.coordinates[1], booking.dropoff.coordinates[0]], type: 'dropoff', label: booking.dropoff.label },
  ];
});
const selectedFare = computed(() => booking.estimates[selected.value]?.fare?.amount ?? null);

onMounted(async () => {
  if (!booking.pickup || !booking.dropoff) return router.replace('/app/home');
  try {
    await Promise.all([
      booking.estimate('shared'),
      booking.estimate('non_shared'),
      booking.loadNearbyDrivers(),
    ]);
  } catch {
    ui.notify('Some live trip information is unavailable. Server fare rules are still applied.', 'warning');
  } finally {
    estimating.value = false;
  }
});

async function bookNow() {
  try {
    const created = await booking.create(selected.value);
    ui.notify('Booking created. Nearby eligible drivers have been notified.', 'success');
    router.replace(`/app/booking/${created._id}`);
  } catch {
    ui.notify(booking.error?.message || 'Unable to create booking.', 'error');
  }
}
</script>

<template>
  <section class="ride-options-page">
    <header class="screen-header">
      <button type="button" aria-label="Go back" @click="router.back()"><ArrowLeft :size="21" /></button>
      <h1>Choose Ride Option</h1>
      <span aria-hidden="true"></span>
    </header>

    <div class="route-map">
      <RydoraMap
        :center="routeCenter"
        :markers="markers"
        :route-geometry="route?.geometry"
        :interactive="false"
        height="100%"
        recenter-position="bottom-right"
      />
      <div v-if="route?.distanceKm != null || route?.durationMinutes != null" class="route-badge">
        <Route :size="16" />
        <strong v-if="route?.distanceKm != null">{{ route.distanceKm.toFixed(1) }} km</strong>
        <span>•</span>
        <strong v-if="route?.durationMinutes != null">{{ route.durationMinutes }} min</strong>
      </div>
    </div>

    <div class="options-sheet">
      <span class="sheet-handle" aria-hidden="true"></span>

      <div class="route-summary">
        <div class="route-points"><span></span><i></i><span></span></div>
        <div class="route-copy">
          <span><strong>{{ booking.pickup?.label }}</strong><small>Pickup location</small></span>
          <span><strong>{{ booking.dropoff?.label }}</strong><small>Drop-off location</small></span>
        </div>
        <RouterLink to="/app/pickup" aria-label="Edit route"><ArrowDownUp :size="18" /></RouterLink>
      </div>

      <div class="ride-tabs" aria-label="Ride type">
        <button type="button" :class="{ active: selected === 'shared' }" @click="selected = 'shared'">
          <UsersRound :size="21" /><span><strong>Shared Ride</strong><small>Share with other passengers</small></span>
        </button>
        <button type="button" :class="{ active: selected === 'non_shared' }" @click="selected = 'non_shared'">
          <UserRound :size="21" /><span><strong>Non-Shared Ride</strong><small>Get the whole tricycle</small></span>
        </button>
      </div>

      <div v-if="selected === 'shared'" class="passenger-row">
        <div><strong>Passengers</strong><small>Seats needed</small></div>
        <div class="stepper">
          <button type="button" :disabled="booking.passengerCount <= 1" aria-label="Remove passenger" @click="booking.passengerCount--"><Minus :size="15" /></button>
          <strong>{{ booking.passengerCount }}</strong>
          <button type="button" :disabled="booking.passengerCount >= 3" aria-label="Add passenger" @click="booking.passengerCount++"><Plus :size="15" /></button>
        </div>
      </div>

      <div class="ride-list">
        <RideOptionCard
          type="shared"
          :selected="selected === 'shared'"
          :fare="booking.estimates.shared?.fare?.amount"
          :duration="booking.estimates.shared?.route?.durationMinutes"
          :available-count="booking.nearbyDrivers.length"
          :loading="estimating"
          @select="selected = $event"
        />
        <RideOptionCard
          type="non_shared"
          :selected="selected === 'non_shared'"
          :fare="booking.estimates.non_shared?.fare?.amount"
          :duration="booking.estimates.non_shared?.route?.durationMinutes"
          :available-count="booking.nearbyDrivers.length"
          :loading="estimating"
          @select="selected = $event"
        />
      </div>

      <RouterLink class="nearby-link" to="/app/available-tricycles">
        <span><strong>Nearby Available Tricycles</strong><small>See drivers near your pickup location</small></span>
        <span>{{ booking.nearbyDrivers.length }} nearby <ChevronRight :size="17" /></span>
      </RouterLink>

      <div class="confirm-row">
        <AppButton block size="lg" :loading="booking.loading" :disabled="estimating || selectedFare == null" @click="bookNow">
          Confirm Booking
        </AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ride-options-page { min-height: 100svh; background: #edf2f1; }
.screen-header { display: grid; min-height: 64px; grid-template-columns: 44px 1fr 44px; align-items: center; padding: max(8px, env(safe-area-inset-top)) 14px 8px; background: white; }
.screen-header button { display: grid; width: 42px; height: 42px; place-items: center; border: 0; border-radius: 50%; background: white; color: var(--color-text); }
.screen-header h1 { justify-self: center; margin: 0; font-size: 0.98rem; }
.route-map { position: relative; height: 30svh; min-height: 230px; }
.route-badge { position: absolute; z-index: 580; top: 18px; left: 50%; display: flex; align-items: center; gap: 7px; padding: 10px 13px; border: 1px solid rgb(226 232 240 / 0.9); border-radius: 13px; transform: translateX(-50%); background: rgb(255 255 255 / 0.95); box-shadow: var(--shadow-md); color: #334155; font-size: 0.75rem; white-space: nowrap; }
.route-badge svg { color: var(--color-primary); }
.options-sheet { position: relative; z-index: 650; display: grid; gap: 13px; margin-top: -18px; padding: 9px 16px max(22px, env(safe-area-inset-bottom)); border-radius: 27px 27px 0 0; background: white; box-shadow: 0 -15px 45px rgb(15 23 42 / 0.14); }
.sheet-handle { width: 48px; height: 5px; justify-self: center; border-radius: 999px; background: #dbe1e8; }
.route-summary { display: grid; grid-template-columns: auto 1fr auto; align-items: stretch; gap: 12px; padding: 13px; border: 1px solid var(--color-border); border-radius: 15px; }
.route-points { display: grid; grid-template-rows: auto 1fr auto; justify-items: center; padding-block: 5px; }.route-points span { width: 11px; height: 11px; border: 3px solid var(--color-primary); border-radius: 50%; }.route-points span:last-child { border-color: var(--color-danger); }.route-points i { width: 1px; min-height: 19px; background: #cbd5e1; }
.route-copy { display: grid; min-width: 0; gap: 12px; }.route-copy > span { display: grid; min-width: 0; gap: 3px; }.route-copy strong { overflow: hidden; font-size: 0.77rem; text-overflow: ellipsis; white-space: nowrap; }.route-copy small { color: var(--color-text-soft); font-size: 0.61rem; }.route-summary > a { display: grid; width: 38px; height: 38px; align-self: center; place-items: center; border-radius: 50%; background: #f1f5f9; color: #334155; }
.ride-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }.ride-tabs button { display: grid; min-height: 68px; grid-template-columns: auto 1fr; align-items: center; gap: 8px; padding: 10px; border: 1px solid var(--color-border); border-radius: 14px; background: white; color: #475569; text-align: left; }.ride-tabs button.active { border-color: var(--color-primary); background: #ecfdf5; color: var(--color-primary-dark); }.ride-tabs button > span { display: grid; gap: 3px; }.ride-tabs strong { color: var(--color-text); font-size: 0.72rem; }.ride-tabs small { color: var(--color-text-soft); font-size: 0.57rem; line-height: 1.25; }
.passenger-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 9px 12px; border-radius: 12px; background: #f8fafc; }.passenger-row > div:first-child { display: grid; gap: 2px; }.passenger-row strong { font-size: 0.74rem; }.passenger-row small { color: var(--color-text-soft); font-size: 0.59rem; }.stepper { display: flex; align-items: center; gap: 10px; }.stepper button { display: grid; width: 29px; height: 29px; place-items: center; border: 1px solid var(--color-border); border-radius: 9px; background: white; color: var(--color-primary-dark); }.stepper button:disabled { cursor: not-allowed; opacity: 0.35; }
.ride-list { display: grid; gap: 11px; }
.nearby-link { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 13px; border: 1px solid #bbf7d0; border-radius: 13px; background: #f0fdf4; color: var(--color-primary-dark); }.nearby-link > span { display: grid; gap: 3px; }.nearby-link > span:last-child { display: flex; align-items: center; white-space: nowrap; font-size: 0.67rem; font-weight: 800; }.nearby-link strong { font-size: 0.76rem; }.nearby-link small { color: var(--color-text-soft); font-size: 0.62rem; }
.confirm-row { position: sticky; bottom: 0; padding-top: 11px; border-top: 1px solid var(--color-border); background: white; }

@media (min-width: 900px) {
  .ride-options-page { display: grid; min-height: 100vh; grid-template-columns: minmax(0, 1.15fr) minmax(430px, 0.85fr); grid-template-rows: auto 1fr; gap: 20px 24px; padding: 24px; }
  .screen-header { grid-column: 1 / -1; border: 1px solid var(--color-border); border-radius: 18px; }
  .route-map { position: sticky; top: 108px; height: calc(100vh - 132px); min-height: 620px; overflow: hidden; border-radius: 24px; }
  .options-sheet { align-self: start; margin: 0; padding: 18px; border: 1px solid var(--color-border); border-radius: 24px; box-shadow: var(--shadow-md); }
  .sheet-handle { display: none; }
}
</style>
