<script setup>
import { Bike, Clock3, MapPin, Navigation, Power, Radio, UsersRound, X } from '@lucide/vue';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import RydoraMap from '../../components/maps/RydoraMap.vue';
import AppButton from '../../components/ui/AppButton.vue';
import AppInput from '../../components/ui/AppInput.vue';
import StatusPill from '../../components/ui/StatusPill.vue';
import { useGeolocation } from '../../composables/useGeolocation.js';
import { useSocketListeners } from '../../composables/useSocket.js';
import { api, getApiError } from '../../services/api.js';
import { reconnectSocket } from '../../services/socket.js';
import { useUiStore } from '../../stores/ui.js';
import { roadsideSignalMapLabel } from './roadsidePresentation.js';

const router = useRouter();
const ui = useUiStore();
const geolocation = useGeolocation();
const profile = ref(null);
const requests = ref([]);
const assignments = ref([]);
const roadsideSignals = ref([]);
const claimedRoadsideSignals = ref([]);
const loading = ref(true);
const updating = ref(false);
const center = ref(geolocation.fallback);
const selectedRequestId = ref(null);
const selectedSignalId = ref(null);
const vehicle = reactive({ plateNumber: '', bodyNumber: '', maximumPassengerCapacity: 3 });
const isOnline = computed(() => profile.value?.availabilityStatus !== 'offline');
const approved = computed(() => profile.value?.approvalStatus === 'approved');
const canReceiveSharedRequests = computed(() =>
  profile.value?.availabilityStatus === 'available' ||
  (profile.value?.availabilityStatus === 'on_ride' &&
    profile.value?.currentRideId?.rideType === 'shared'),
);
const maximumCapacity = computed(
  () => profile.value?.vehicleId?.maximumPassengerCapacity ?? 0,
);
const occupiedSeats = computed(
  () =>
    claimedRoadsideSignals.value.length +
    assignments.value.reduce((total, item) => total + (item.passengerCount ?? 1), 0),
);
const availableSeats = computed(() => Math.max(0, maximumCapacity.value - occupiedSeats.value));
const selectedRequest = computed(
  () => requests.value.find((item) => item._id === selectedRequestId.value) || null,
);
const selectedSignal = computed(
  () =>
    [...roadsideSignals.value, ...claimedRoadsideSignals.value].find(
      (item) => item.id === selectedSignalId.value,
    ) || null,
);
const mapRouteGeometry = computed(
  () =>
    selectedRequest.value?.routeGeometry ||
    (selectedSignal.value?.status === 'claimed'
      ? selectedSignal.value.pickupRouteGeometry
      : null),
);
const markers = computed(() => [
  ...(center.value ? [{ id: 'driver', position: center.value, type: 'current', label: 'Your location' }] : []),
  ...requests.value.map((item) => ({
    id: item._id,
    bookingId: item._id,
    position: [item.pickupLocation.coordinates[1], item.pickupLocation.coordinates[0]],
    type: 'available',
    label: `${item.rideType === 'shared' ? 'Shared' : 'Private'} booking`,
  })),
  ...roadsideSignals.value.map((item) => ({
    id: `roadside-${item.id}`,
    signalId: item.id,
    position: [item.location.coordinates[1], item.location.coordinates[0]],
    type: 'roadside',
    label: roadsideSignalMapLabel(item),
    permanentLabel: true,
    tooltipClass: 'waiting-commuter-tooltip',
  })),
  ...claimedRoadsideSignals.value
    .filter((item) => item.status === 'claimed')
    .map((item) => ({
      id: `claimed-roadside-${item.id}`,
      signalId: item.id,
      position: [item.location.coordinates[1], item.location.coordinates[0]],
      type: 'assigned',
      label: `Your pickup: ${roadsideSignalMapLabel(item)}`,
      permanentLabel: true,
      tooltipClass: 'waiting-commuter-tooltip',
    })),
]);
let refreshTimer;
let syncingLocation = false;

async function loadProfile() {
  const response = await api.get('/drivers/me');
  profile.value = response.data.data.driver;
  if (profile.value.vehicleId) Object.assign(vehicle, profile.value.vehicleId);
}
async function reconcile() {
  if (!approved.value) {
    requests.value = [];
    roadsideSignals.value = [];
    claimedRoadsideSignals.value = [];
    selectedRequestId.value = null;
    selectedSignalId.value = null;
    return;
  }
  const [availableResponse, activeResponse, roadsideResponse, claimedResponse] = await Promise.all([
    isOnline.value
      ? api.get('/drivers/available-bookings')
      : Promise.resolve({ data: { data: { bookings: [] } } }),
    api.get('/drivers/active-assignments'),
    canReceiveSharedRequests.value
      ? api.get('/roadside-signals/nearby')
      : Promise.resolve({ data: { data: { signals: [] } } }),
    api.get('/roadside-signals/active'),
  ]);
  requests.value = availableResponse.data.data.bookings;
  assignments.value = activeResponse.data.data.bookings;
  roadsideSignals.value = roadsideResponse.data.data.signals;
  claimedRoadsideSignals.value = claimedResponse.data.data.signals;
  if (selectedRequestId.value && !selectedRequest.value) selectedRequestId.value = null;
  if (selectedSignalId.value && !selectedSignal.value) selectedSignalId.value = null;
  if (
    claimedRoadsideSignals.value.length &&
    !selectedRequestId.value &&
    !selectedSignalId.value
  ) {
    selectedSignalId.value = claimedRoadsideSignals.value[0].id;
  }
}

async function syncDriverLocation() {
  if (!isOnline.value || syncingLocation) return;
  syncingLocation = true;
  try {
    const coords = await geolocation.requestLocation({ maximumAge: 5_000 });
    if (!coords) return;
    center.value = coords;
    await api.patch('/drivers/location', { coordinates: [coords[1], coords[0]] });
  } finally {
    syncingLocation = false;
  }
}

onMounted(async () => {
  try {
    await loadProfile();
    await syncDriverLocation();
    await reconcile();
    refreshTimer = window.setInterval(async () => {
      await syncDriverLocation().catch(() => {});
      await reconcile().catch(() => {});
    }, 15_000);
  } catch (error) { ui.notify(getApiError(error, 'Driver dashboard could not be loaded.').message, 'error'); }
  finally { loading.value = false; }
});
onBeforeUnmount(() => window.clearInterval(refreshTimer));
useSocketListeners({
  'booking:new': (item) => { if (!requests.value.some((request) => request._id === item.bookingId)) reconcile(); },
  'booking:removed': (item) => {
    requests.value = requests.value.filter((request) => request._id !== item.bookingId);
    if (selectedRequestId.value === item.bookingId) selectedRequestId.value = null;
  },
  'booking:updated': reconcile,
  'roadside:changed': () => {
    reconcile().catch(() => {});
  },
});
async function toggleOnline() {
  updating.value = true;
  try {
    const status = isOnline.value ? 'offline' : 'available';
    const response = await api.patch('/drivers/availability', { status });
    profile.value = { ...profile.value, ...response.data.data.driver };
    if (status === 'available') {
      await syncDriverLocation();
    }
    reconnectSocket();
    await reconcile();
    ui.notify(status === 'available' ? 'You are online and visible to bookings.' : 'You are now offline.', 'success');
  } catch (error) { ui.notify(getApiError(error).message, 'error'); }
  finally { updating.value = false; }
}
async function saveVehicle() {
  updating.value = true;
  try {
    const response = await api.put('/drivers/vehicle', { ...vehicle, maximumPassengerCapacity: Number(vehicle.maximumPassengerCapacity) });
    profile.value.vehicleId = response.data.data.vehicle;
    ui.notify('Vehicle details saved. An administrator can now review your application.', 'success');
  } catch (error) { ui.notify(getApiError(error).message, 'error'); }
  finally { updating.value = false; }
}
async function accept(item) {
  updating.value = true;
  try {
    await api.post(`/drivers/bookings/${item._id}/accept`);
    reconnectSocket();
    ui.notify('Booking accepted. It is now assigned to you.', 'success');
    router.push(`/driver/booking/${item._id}`);
  } catch (error) { ui.notify(getApiError(error, 'This booking is no longer available.').message, 'error'); await reconcile(); }
  finally { updating.value = false; }
}
async function claimRoadsideCommuter(signal) {
  updating.value = true;
  try {
    await api.post(`/roadside-signals/${signal.id}/claim`);
    await reconcile();
    selectedSignalId.value = signal.id;
    ui.notify('Pickup confirmed. The commuter can now see you approaching.', 'success');
  } catch (error) {
    ui.notify(getApiError(error, 'This commuter is no longer waiting.').message, 'error');
    await reconcile();
  } finally {
    updating.value = false;
  }
}
async function markRoadsidePassengerPickedUp(signal) {
  updating.value = true;
  try {
    await api.post(`/roadside-signals/${signal.id}/pickup`);
    await reconcile();
    ui.notify('Passenger is onboard. You can collect another shared passenger if seats remain.', 'success');
  } catch (error) {
    ui.notify(getApiError(error, 'Unable to confirm this passenger pickup.').message, 'error');
    await reconcile();
  } finally {
    updating.value = false;
  }
}
async function dropOffRoadsidePassenger(signal) {
  updating.value = true;
  try {
    await api.post(`/roadside-signals/${signal.id}/dropoff`);
    selectedSignalId.value = null;
    await reconcile();
    ui.notify('Passenger drop-off completed.', 'success');
  } catch (error) {
    ui.notify(getApiError(error, 'Unable to complete this passenger drop-off.').message, 'error');
    await reconcile();
  } finally {
    updating.value = false;
  }
}
function selectWaitingCommuter(marker) {
  if (marker.bookingId) {
    selectedRequestId.value = marker.bookingId;
    selectedSignalId.value = null;
  }
  if (marker.signalId) {
    selectedSignalId.value = marker.signalId;
    selectedRequestId.value = null;
  }
}
</script>

<template>
  <section v-if="loading" class="page"><div class="skeleton loading-map"></div></section>
  <section v-else-if="!approved" class="page approval-page">
    <div class="approval-hero"><span><Bike :size="32" /></span><StatusPill :status="profile.approvalStatus" /><h1>Driver application</h1><p>Your account needs administrator approval before you can go online. Add your vehicle details to complete the review.</p></div>
    <form class="vehicle-form card" @submit.prevent="saveVehicle"><h2>Vehicle details</h2><AppInput v-model="vehicle.plateNumber" label="Plate number" placeholder="ABC-1234" required /><AppInput v-model="vehicle.bodyNumber" label="Body number" placeholder="VIC-001" required /><AppInput v-model="vehicle.maximumPassengerCapacity" label="Passenger capacity" type="number" min="1" max="8" required /><AppButton type="submit" block :loading="updating">Save vehicle</AppButton></form>
  </section>
  <section v-else class="driver-home">
    <div class="map-area"><RydoraMap :center="center" :markers="markers" :route-geometry="mapRouteGeometry" height="100%" @marker-click="selectWaitingCommuter" /><div class="online-control card"><div><span :class="['online-dot', { active: isOnline }]"></span><div><strong>{{ isOnline ? 'You’re online' : 'You’re offline' }}</strong><small>{{ isOnline ? 'Receiving eligible requests' : 'Go online to receive bookings' }}</small></div></div><AppButton :variant="isOnline ? 'danger' : 'primary'" size="sm" :loading="updating" @click="toggleOnline"><template #icon><Power :size="16" /></template>{{ isOnline ? 'Go offline' : 'Go online' }}</AppButton></div><aside v-if="selectedRequest || selectedSignal" class="selected-request card"><div v-if="selectedRequest"><span class="eyebrow">Booking route</span><strong>{{ selectedRequest.dropoffLocation.label }}</strong><small>Pickup: {{ selectedRequest.pickupLocation.label }}</small></div><div v-else><span class="eyebrow roadside">{{ selectedSignal.status === 'claimed' ? 'Your active roadside pickup' : 'Passenger onboard · Shared ride' }}</span><strong>{{ selectedSignal.commuter.displayName }}</strong><p>“{{ selectedSignal.destinationNote }}”</p><small v-if="selectedSignal.status === 'claimed'">{{ selectedSignal.pickupRouteDurationMinutes ? `${selectedSignal.pickupRouteDurationMinutes} min to pickup · ` : '' }}{{ selectedSignal.location.label }}</small><small v-else>Drop off at the noted destination</small></div><button type="button" aria-label="Close map preview" @click="selectedRequestId = null; selectedSignalId = null"><X :size="18" /></button></aside></div>
    <div class="request-panel">
      <div v-if="assignments.length" class="active-assignment card"><span class="eyebrow">Active ride</span><div v-for="item in assignments" :key="item._id" class="active-row"><div><strong>{{ item.commuterId?.firstName }} {{ item.commuterId?.lastName }}</strong><small>{{ item.pickupLocation.label }} → {{ item.dropoffLocation.label }}</small></div><StatusPill :status="item.status" /><AppButton size="sm" @click="router.push(`/driver/booking/${item._id}`)">Open</AppButton></div></div>
      <section v-if="claimedRoadsideSignals.length" class="claimed-roadside card">
        <div class="roadside-manifest-heading"><span class="eyebrow">Shared roadside passengers</span><strong>{{ occupiedSeats }}/{{ maximumCapacity }} seats</strong></div>
        <article v-for="signal in claimedRoadsideSignals" :key="signal.id" :class="{ onboard: signal.status === 'picked_up' }">
          <div><strong>{{ signal.commuter.displayName }}</strong><small>“{{ signal.destinationNote }}”</small><span v-if="signal.status === 'claimed'">{{ signal.pickupRouteDurationMinutes ? `${signal.pickupRouteDurationMinutes} min` : 'Route time unavailable' }} · {{ signal.pickupRouteDistanceKm ? `${signal.pickupRouteDistanceKm} km` : 'Road distance unavailable' }}</span><span v-else>Passenger onboard · Drop-off required</span></div>
          <div v-if="signal.status === 'claimed'" class="claimed-actions"><AppButton variant="outline" size="sm" @click="selectedSignalId = signal.id; selectedRequestId = null">Show route</AppButton><AppButton size="sm" :loading="updating" @click="markRoadsidePassengerPickedUp(signal)">Passenger picked up</AppButton></div>
          <AppButton v-else block size="sm" :loading="updating" @click="dropOffRoadsidePassenger(signal)">Passenger dropped off</AppButton>
        </article>
      </section>
      <section v-if="canReceiveSharedRequests && roadsideSignals.length" class="roadside-section">
        <div class="panel-heading"><div><h1>Roadside commuters</h1><p>{{ roadsideSignals.length }} nearby · {{ availableSeats }} seat{{ availableSeats === 1 ? '' : 's' }} available</p></div><span class="roadside-badge"><Radio :size="14" /> Shared</span></div>
        <div class="roadside-list">
          <article v-for="signal in roadsideSignals" :key="signal.id" class="roadside-card card" :class="{ selected: selectedSignalId === signal.id }"><div class="roadside-top"><span><Radio :size="19" /></span><div><strong>{{ signal.commuter.displayName }}</strong><small>{{ signal.location.label }}</small></div></div><p>“{{ signal.destinationNote }}”</p><div class="roadside-actions"><AppButton variant="outline" size="sm" block @click="selectedSignalId = signal.id; selectedRequestId = null">Show on map</AppButton><AppButton size="sm" block :loading="updating" @click="claimRoadsideCommuter(signal)">Confirm pickup</AppButton></div></article>
        </div>
      </section>
      <div class="panel-heading"><div><h1>Booking requests</h1><p>{{ isOnline ? `${requests.length} eligible request${requests.length === 1 ? '' : 's'}` : 'Go online to see requests' }}</p></div><StatusPill :status="profile.availabilityStatus" /></div>
      <div v-if="!isOnline" class="empty card"><Power :size="34" /><strong>You’re currently offline</strong><span>Go online when you’re ready to accept rides.</span></div>
      <div v-else-if="!requests.length" class="empty card"><Navigation :size="34" /><strong>No requests nearby</strong><span>New eligible bookings will appear here in real time.</span></div>
      <div v-else class="request-list">
        <article v-for="item in requests" :key="item._id" class="request-card card" :class="{ selected: selectedRequestId === item._id }"><div class="request-top"><span><UsersRound v-if="item.rideType === 'shared'" :size="21" /><Bike v-else :size="21" /></span><div><small>{{ item.rideType === 'shared' ? 'Shared ride' : 'Private ride' }}</small><strong>{{ item.passengerCount }} passenger{{ item.passengerCount > 1 ? 's' : '' }}</strong></div><strong class="fare">₱{{ item.estimatedFare.toFixed(0) }}</strong></div><div class="route-details"><div class="route-row"><MapPin :size="16" /><span><small>Pickup</small>{{ item.pickupLocation.label }}</span></div><div class="route-row destination"><Navigation :size="16" /><span><small>Going to</small>{{ item.dropoffLocation.label }}</span></div></div><div class="request-meta"><span><Clock3 :size="15" /> {{ item.routeDurationMinutes ? `${item.routeDurationMinutes} min` : 'Time unavailable' }}</span><span>{{ item.routeDistanceKm ? `${item.routeDistanceKm} km` : 'Road distance unavailable' }}</span></div><div class="request-actions"><AppButton variant="outline" block @click="selectedRequestId = item._id; selectedSignalId = null">Show route</AppButton><AppButton block :loading="updating" @click="accept(item)">Accept booking</AppButton></div></article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.loading-map { height: 75vh; }.approval-page { max-width: 680px; }.approval-hero { display: grid; justify-items: center; padding: 30px 0 15px; text-align: center; }.approval-hero > span { display: grid; width: 70px; height: 70px; place-items: center; margin-bottom: 14px; border-radius: 22px; background: #d1fae5; color: var(--color-primary-dark); }.approval-hero h1 { margin: 15px 0 7px; }.approval-hero p { max-width: 540px; color: var(--color-text-soft); line-height: 1.6; }.vehicle-form { display: grid; gap: 17px; padding: 20px; }.vehicle-form h2 { margin: 0; font-size: 1.05rem; }
.driver-home { min-height: calc(100vh - 68px); }.map-area { position: relative; height: 52vh; min-height: 390px; }.online-control { position: absolute; z-index: 600; top: 15px; right: 15px; left: 15px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 11px; box-shadow: var(--shadow-md); }.online-control > div { display: flex; align-items: center; gap: 10px; }.online-control > div > div { display: grid; gap: 2px; }.online-control strong { font-size: 0.8rem; }.online-control small { color: var(--color-text-soft); font-size: 0.64rem; }.online-dot { width: 11px; height: 11px; border-radius: 50%; background: #94a3b8; box-shadow: 0 0 0 5px rgb(148 163 184 / 0.15); }.online-dot.active { background: var(--color-accent); box-shadow: 0 0 0 5px rgb(16 185 129 / 0.15); }.selected-request { position: absolute; z-index: 600; right: 15px; bottom: 37px; left: 15px; display: grid; grid-template-columns: 1fr auto; gap: 10px; padding: 13px 14px; border-color: #a7f3d0; box-shadow: var(--shadow-md); }.selected-request > div { display: grid; gap: 4px; min-width: 0; }.selected-request strong { overflow: hidden; color: var(--color-primary-dark); font-size: 0.84rem; text-overflow: ellipsis; white-space: nowrap; }.selected-request p { margin: 0; color: var(--color-text); font-size: 0.72rem; line-height: 1.35; }.selected-request small { overflow: hidden; color: var(--color-text-soft); font-size: 0.65rem; text-overflow: ellipsis; white-space: nowrap; }.selected-request button { align-self: start; display: grid; width: 32px; height: 32px; place-items: center; border: 0; border-radius: 9px; background: #f1f5f9; color: var(--color-text-soft); }
.request-panel { position: relative; z-index: 650; display: grid; gap: 17px; margin-top: -24px; padding: 20px 17px 110px; border-radius: 24px 24px 0 0; background: var(--color-background); }.panel-heading { display: flex; align-items: center; justify-content: space-between; }.panel-heading h1 { margin: 0 0 4px; font-size: 1.2rem; }.panel-heading p { margin: 0; color: var(--color-text-soft); font-size: 0.74rem; }.active-assignment { display: grid; gap: 11px; padding: 15px; border-color: #a7f3d0; }.active-row { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 9px; }.active-row > div { display: grid; gap: 3px; min-width: 0; }.active-row small { overflow: hidden; color: var(--color-text-soft); font-size: 0.65rem; text-overflow: ellipsis; white-space: nowrap; }
.claimed-roadside { display: grid; gap: 11px; padding: 15px; border-color: #fdba74; background: #fff7ed; }.claimed-roadside article { display: grid; gap: 10px; }.claimed-roadside article > div:first-child { display: grid; gap: 4px; }.claimed-roadside strong { font-size: 0.82rem; }.claimed-roadside small { color: #9a3412; font-size: 0.72rem; line-height: 1.4; }.claimed-roadside article span { color: var(--color-text-soft); font-size: 0.65rem; }.claimed-actions { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 8px; }
.roadside-manifest-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; }.roadside-manifest-heading > strong { padding: 5px 8px; border-radius: 999px; background: white; color: #9a3412; font-size: 0.65rem; }.claimed-roadside article.onboard { padding: 11px; border: 1px solid #86efac; border-radius: 13px; background: #f0fdf4; }.claimed-roadside article.onboard small { color: #047857; }
.roadside-section { display: grid; gap: 11px; padding: 14px; border: 1px solid #fed7aa; border-radius: 17px; background: #fff7ed; }.roadside-section .panel-heading h1 { font-size: 1rem; }.roadside-badge { display: inline-flex; align-items: center; gap: 4px; padding: 5px 8px; border-radius: 999px; background: #ffedd5; color: #c2410c; font-size: 0.62rem; font-weight: 850; text-transform: uppercase; }.roadside-list { display: grid; gap: 9px; }.roadside-card { display: grid; gap: 10px; padding: 12px; border-color: #fed7aa; }.roadside-card.selected { border-color: #f97316; box-shadow: 0 0 0 3px rgb(249 115 22 / 0.1); }.roadside-top { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 9px; }.roadside-top > span { display: grid; width: 37px; height: 37px; place-items: center; border-radius: 12px; background: #ffedd5; color: #c2410c; }.roadside-top > div { display: grid; gap: 2px; min-width: 0; }.roadside-top strong { font-size: 0.78rem; }.roadside-top small { overflow: hidden; color: var(--color-text-soft); font-size: 0.62rem; text-overflow: ellipsis; white-space: nowrap; }.roadside-card > p { margin: 0; padding: 8px 10px; border-left: 3px solid #fb923c; background: #fff7ed; color: #9a3412; font-size: 0.72rem; line-height: 1.4; }.roadside-actions { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 8px; }
.empty { display: grid; min-height: 190px; place-items: center; align-content: center; gap: 8px; padding: 25px; color: var(--color-text-soft); text-align: center; }.empty svg { color: var(--color-primary); }.empty strong { color: var(--color-text); }.empty span { font-size: 0.75rem; }.request-list { display: grid; gap: 13px; }.request-card { display: grid; gap: 13px; padding: 16px; transition: border-color 160ms ease, box-shadow 160ms ease; }.request-card.selected { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgb(16 185 129 / 0.1); }.request-top { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 11px; }.request-top > span { display: grid; width: 43px; height: 43px; place-items: center; border-radius: 13px; background: #d1fae5; color: var(--color-primary-dark); }.request-top > div { display: grid; gap: 2px; }.request-top small { color: var(--color-text-soft); }.request-top strong { font-size: 0.8rem; }.request-top .fare { color: var(--color-primary-dark); font-size: 1.05rem; }.route-details { display: grid; gap: 9px; }.route-row { display: flex; align-items: center; gap: 8px; }.route-row svg { flex: 0 0 auto; color: var(--color-primary); }.route-row.destination svg { color: var(--color-danger); }.route-row span { display: grid; overflow: hidden; font-size: 0.76rem; text-overflow: ellipsis; white-space: nowrap; }.route-row small { color: var(--color-text-soft); font-size: 0.6rem; }.request-meta { display: flex; justify-content: space-between; color: var(--color-text-soft); font-size: 0.67rem; }.request-meta span { display: inline-flex; align-items: center; gap: 5px; }.request-actions { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 9px; }
@media (min-width: 900px) { .driver-home { display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 24px; padding: 25px; }.map-area { height: calc(100vh - 120px); overflow: hidden; border-radius: 22px; }.request-panel { overflow-y: auto; max-height: calc(100vh - 120px); margin: 0; padding: 4px 4px 90px; border-radius: 0; }.online-control { left: 15px; } }
</style>

