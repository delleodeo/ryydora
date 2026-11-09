<script setup>
import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronRight,
  Crosshair,
  LocateFixed,
  MapPin,
  Navigation,
  Radio,
} from '@lucide/vue';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import BrandLogo from '../../components/common/BrandLogo.vue';
import RydoraMap from '../../components/maps/RydoraMap.vue';
import RoadsideNoteModal from '../../components/roadside/RoadsideNoteModal.vue';
import AppButton from '../../components/ui/AppButton.vue';
import { useGeolocation } from '../../composables/useGeolocation.js';
import { useSocketListeners } from '../../composables/useSocket.js';
import { api, getApiError } from '../../services/api.js';
import { useAuthStore } from '../../stores/auth.js';
import { useBookingStore } from '../../stores/booking.js';
import { useUiStore } from '../../stores/ui.js';

const router = useRouter();
const auth = useAuthStore();
const booking = useBookingStore();
const ui = useUiStore();
const geolocation = useGeolocation();
const center = ref(geolocation.fallback);
const currentCoordinates = ref(null);
const unreadCount = ref(0);
const roadsideNote = ref('');
const roadsideSignal = ref(null);
const roadsideUpdating = ref(false);
const showRoadsideModal = ref(false);
let roadsideExpiryTimer;

const firstName = computed(() => auth.user?.firstName || 'commuter');
const initials = computed(() =>
  [auth.user?.firstName, auth.user?.lastName]
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'RY',
);
const pickupLabel = computed(() => booking.pickup?.label || 'Choose your pickup point');
const dropoffLabel = computed(() => booking.dropoff?.label || 'Select your destination');
const locationLabel = computed(() =>
  booking.pickup?.label || (geolocation.loading ? 'Finding your location…' : 'Poblacion, Victoria, Oriental Mindoro'),
);
const roadsideActive = computed(() => Boolean(roadsideSignal.value));
const roadsideWaiting = computed(() => roadsideSignal.value?.status === 'waiting');
const roadsideClaimed = computed(() => roadsideSignal.value?.status === 'claimed');
const roadsideOnboard = computed(() => roadsideSignal.value?.status === 'picked_up');
const roadsideLocked = computed(() => roadsideClaimed.value || roadsideOnboard.value);
const roadsideExpiry = computed(() =>
  roadsideSignal.value?.expiresAt
    ? new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' }).format(
        new Date(roadsideSignal.value.expiresAt),
      )
    : '',
);
const markers = computed(() => [
  ...booking.nearbyDrivers
    .filter((driver) => driver.id !== roadsideSignal.value?.driver?.id)
    .map((driver) => ({
      id: driver.id,
      position: [driver.location.coordinates[1], driver.location.coordinates[0]],
      type: 'tricycle',
      label: `${driver.name} · ${driver.vehicle.bodyNumber}`,
    })),
  ...(roadsideLocked.value && roadsideSignal.value.driver?.currentLocation?.coordinates
    ? [{
        id: `roadside-driver-${roadsideSignal.value.driver.id}`,
        position: [
          roadsideSignal.value.driver.currentLocation.coordinates[1],
          roadsideSignal.value.driver.currentLocation.coordinates[0],
        ],
        type: 'driver',
        label: roadsideOnboard.value
          ? `${roadsideSignal.value.driver.name} · Your shared-ride driver`
          : `${roadsideSignal.value.driver.name} is coming to you`,
        permanentLabel: true,
      }]
    : []),
  ...(roadsideClaimed.value
    ? [{
        id: 'roadside-pickup',
        position: [
          roadsideSignal.value.location.coordinates[1],
          roadsideSignal.value.location.coordinates[0],
        ],
        type: 'assigned',
        label: 'Your roadside pickup point',
      }]
    : []),
  { id: 'me', position: center.value, type: 'current', label: 'Your current area' },
]);

async function loadRoadsideSignal() {
  const response = await api.get('/roadside-signals/mine');
  roadsideSignal.value = response.data.data.signal;
  if (roadsideSignal.value) {
    roadsideNote.value = roadsideSignal.value.destinationNote;
    scheduleRoadsideExpiry();
  }
}

onMounted(async () => {
  booking.loadHistory().catch(() => {});
  api.get('/notifications').then((response) => {
    unreadCount.value = response.data.data.unreadCount;
  }).catch(() => {});
  loadRoadsideSignal().catch(() => {});
  const location = await geolocation.requestLocation();
  if (location) {
    center.value = location;
    currentCoordinates.value = location;
  }
  booking.loadNearbyDrivers({
    type: 'Point',
    coordinates: [center.value[1], center.value[0]],
  }).catch(() => {});
});
onBeforeUnmount(() => window.clearTimeout(roadsideExpiryTimer));

useSocketListeners({
  'roadside:changed': async (event) => {
    if (event.signalId !== roadsideSignal.value?.id) return;
    if (event.action === 'claimed') {
      await loadRoadsideSignal().catch(() => {});
      showRoadsideModal.value = false;
      ui.notify('A driver is on the way. Follow their live location on the map.', 'success');
      return;
    }
    if (event.action === 'picked_up') {
      await loadRoadsideSignal().catch(() => {});
      ui.notify('You are now onboard. You can book or add another note after drop-off.', 'success');
      return;
    }
    if (event.action === 'dropped_off') {
      window.clearTimeout(roadsideExpiryTimer);
      roadsideSignal.value = null;
      roadsideNote.value = '';
      showRoadsideModal.value = false;
      ui.notify('Drop-off completed. You can now book or publish another roadside note.', 'success');
    } else if (event.action === 'removed') {
      window.clearTimeout(roadsideExpiryTimer);
      roadsideSignal.value = null;
      roadsideNote.value = '';
      showRoadsideModal.value = false;
    }
  },
  'driver:location_updated': (event) => {
    if (!roadsideLocked.value || event.driverId !== roadsideSignal.value?.driver?.id) return;
    roadsideSignal.value = {
      ...roadsideSignal.value,
      driver: {
        ...roadsideSignal.value.driver,
        currentLocation: {
          type: 'Point',
          coordinates: event.coordinates,
        },
      },
    };
  },
});

function openRoadsideNote() {
  if (roadsideLocked.value) {
    ui.notify(
      roadsideOnboard.value
        ? 'You can add another note after your driver completes drop-off.'
        : 'Your driver is already on the way. Their location is live on the map.',
      'info',
    );
    return;
  }
  showRoadsideModal.value = true;
}

function setCurrentPickup() {
  booking.setLocation('pickup', {
    type: 'Point',
    coordinates: [center.value[1], center.value[0]],
    label: 'Current location',
  });
}

function bookingBlockedByRoadsidePickup() {
  if (!roadsideLocked.value) return false;
  ui.notify('Wait for your roadside passenger drop-off before booking another ride.', 'warning');
  return true;
}

function choosePickup() {
  if (bookingBlockedByRoadsidePickup()) return;
  if (!booking.pickup) setCurrentPickup();
  router.push('/app/pickup');
}

function chooseDropoff() {
  if (bookingBlockedByRoadsidePickup()) return;
  if (!booking.pickup) setCurrentPickup();
  router.push('/app/dropoff');
}

function continueBooking() {
  if (bookingBlockedByRoadsidePickup()) return;
  if (!booking.pickup) return choosePickup();
  if (!booking.dropoff) return chooseDropoff();
  return router.push('/app/ride-options');
}

async function recenter() {
  const location = await geolocation.requestLocation();
  if (location) {
    center.value = location;
    currentCoordinates.value = location;
    booking.loadNearbyDrivers({
      type: 'Point',
      coordinates: [location[1], location[0]],
    }).catch(() => {});
  }
}

async function publishRoadsideSignal() {
  const note = roadsideNote.value.trim();
  if (note.length < 2) {
    ui.notify('Tell drivers where you are going.', 'warning');
    return;
  }
  roadsideUpdating.value = true;
  try {
    let coordinates = currentCoordinates.value;
    if (!coordinates) {
      coordinates = await geolocation.requestLocation();
      if (coordinates) {
        currentCoordinates.value = coordinates;
        center.value = coordinates;
      }
    }
    if (!coordinates) {
      ui.notify('Allow location access so drivers can find you safely.', 'warning');
      return;
    }
    const response = await api.put('/roadside-signals/mine', {
      location: {
        type: 'Point',
        coordinates: [coordinates[1], coordinates[0]],
        label: 'Current roadside location',
      },
      destinationNote: note,
    });
    roadsideSignal.value = response.data.data.signal;
    roadsideNote.value = roadsideSignal.value.destinationNote;
    scheduleRoadsideExpiry();
    showRoadsideModal.value = false;
    ui.notify('You are now visible to nearby available drivers.', 'success');
  } catch (error) {
    ui.notify(getApiError(error, 'Unable to publish your roadside signal.').message, 'error');
  } finally {
    roadsideUpdating.value = false;
  }
}

async function stopRoadsideSignal() {
  roadsideUpdating.value = true;
  try {
    await api.delete('/roadside-signals/mine');
    window.clearTimeout(roadsideExpiryTimer);
    roadsideSignal.value = null;
    roadsideNote.value = '';
    showRoadsideModal.value = false;
    ui.notify('You are no longer visible on driver maps.', 'success');
  } catch (error) {
    ui.notify(getApiError(error, 'Unable to stop roadside visibility.').message, 'error');
  } finally {
    roadsideUpdating.value = false;
  }
}

function scheduleRoadsideExpiry() {
  window.clearTimeout(roadsideExpiryTimer);
  if (!roadsideSignal.value?.expiresAt) return;
  const delay = Math.max(0, new Date(roadsideSignal.value.expiresAt).getTime() - Date.now());
  roadsideExpiryTimer = window.setTimeout(() => {
    roadsideSignal.value = null;
    roadsideNote.value = '';
    showRoadsideModal.value = false;
    ui.notify('Your roadside visibility expired.', 'info');
  }, delay);
}
</script>

<template>
  <section class="commuter-dashboard">
    <header class="dashboard-header">
      <BrandLogo tagline="A Tricycle Booking System in Victoria" />
      <div class="header-actions">
        <button class="roadside-note-button" :class="{ active: roadsideActive, claimed: roadsideLocked }" type="button" aria-haspopup="dialog" :aria-expanded="showRoadsideModal" :disabled="roadsideLocked" @click="openRoadsideNote">
          <Radio :size="17" />
          <span>{{ roadsideOnboard ? 'On shared ride' : roadsideClaimed ? 'Driver coming' : roadsideWaiting ? 'Note live' : 'Add note' }}</span>
        </button>
        <RouterLink class="notification-button" to="/app/notifications" aria-label="Open notifications">
          <Bell :size="21" />
          <span v-if="unreadCount" aria-label="Unread notifications">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        </RouterLink>
      </div>
    </header>

    <div class="map-stage">
      <RydoraMap
        :center="center"
        :markers="markers"
        :route-geometry="roadsideClaimed ? roadsideSignal.pickupRouteGeometry : null"
        :interactive="true"
        height="100%"
        recenter-position="hidden"
      />

      <button class="greeting-card" type="button" @click="router.push('/app/profile')">
        <span class="avatar" aria-hidden="true">{{ initials }}</span>
        <span class="greeting-copy">
          <strong>Hello, {{ firstName }}!</strong>
          <small>Where do you want to go today?</small>
        </span>
        <ChevronDown :size="20" />
      </button>

      <div class="location-card">
        <span class="location-icon"><MapPin :size="21" /></span>
        <span>
          <small>Current location</small>
          <strong>{{ locationLabel }}</strong>
        </span>
        <button type="button" aria-label="Use current location" :disabled="geolocation.loading" @click="recenter">
          <Crosshair :size="21" />
        </button>
      </div>

      <div class="map-actions" aria-label="Map controls">
        <button type="button" aria-label="Recenter map" @click="recenter"><LocateFixed :size="21" /></button>
      </div>

      <div class="booking-sheet">
        <span class="sheet-handle" aria-hidden="true"></span>

        <section v-if="roadsideLocked" class="roadside-tracking" aria-live="polite">
          <div class="roadside-tracking-heading">
            <span><Navigation :size="18" /></span>
            <div>
              <small>{{ roadsideOnboard ? 'Shared roadside ride · Onboard' : 'Roadside pickup · Driver on the way' }}</small>
              <strong>{{ roadsideSignal.driver?.name || 'Your driver' }}</strong>
            </div>
            <em>{{ roadsideOnboard ? 'Onboard' : 'Live' }}</em>
          </div>
          <div class="roadside-tracking-meta">
            <template v-if="roadsideClaimed">
              <span>{{ roadsideSignal.pickupRouteDurationMinutes ?? '—' }} min away</span>
              <span>{{ roadsideSignal.pickupRouteDistanceKm ?? '—' }} km</span>
            </template>
            <span v-else>Drop-off pending</span>
            <span v-if="roadsideSignal.driver?.vehicle?.bodyNumber">
              Unit {{ roadsideSignal.driver.vehicle.bodyNumber }}
            </span>
          </div>
          <p>“{{ roadsideSignal.destinationNote }}”</p>
        </section>

        <RouterLink v-if="booking.current" class="active-booking" :to="`/app/booking/${booking.current._id}`">
          <span><small>Active booking</small><strong>{{ booking.current.status.replaceAll('_', ' ') }}</strong></span>
          <span>Track ride <ArrowRight :size="16" /></span>
        </RouterLink>

        <div v-if="roadsideLocked" class="booking-locked">
          {{ roadsideOnboard ? 'Your shared roadside ride is active. Booking and notes unlock after the driver confirms drop-off.' : 'Your driver is coming. Booking and notes unlock after passenger drop-off.' }}
        </div>

        <template v-else>
          <div class="sheet-heading"><h1>Book a Tricycle</h1></div>

          <div class="location-fields">
            <button type="button" @click="choosePickup">
              <span class="field-pin pickup"><MapPin :size="20" /></span>
              <span><small>Pickup location</small><strong>{{ pickupLabel }}</strong></span>
              <ChevronRight :size="20" />
            </button>
            <button type="button" @click="chooseDropoff">
              <span class="field-pin dropoff"><MapPin :size="20" /></span>
              <span><small>Drop-off location</small><strong>{{ dropoffLabel }}</strong></span>
              <ChevronRight :size="20" />
            </button>
          </div>

          <AppButton block size="lg" @click="continueBooking">
            {{ booking.pickup && booking.dropoff ? 'Choose Ride Option' : 'Continue Booking' }}
            <template #icon><ArrowRight :size="19" /></template>
          </AppButton>
        </template>

        <p v-if="geolocation.error" class="location-note">{{ geolocation.error }}</p>
      </div>
    </div>
  </section>
  <RoadsideNoteModal
    v-model="roadsideNote"
    :open="showRoadsideModal"
    :active="roadsideWaiting"
    :expiry="roadsideExpiry"
    :busy="roadsideUpdating"
    @close="showRoadsideModal = false"
    @submit="publishRoadsideSignal"
    @stop="stopRoadsideSignal"
  />
</template>

<style scoped>
.commuter-dashboard {
  width: min(100%, 1280px);
  min-height: 100svh;
  margin-inline: auto;
  background: white;
}

.dashboard-header {
  position: relative;
  z-index: 700;
  display: flex;
  min-height: 92px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: max(12px, env(safe-area-inset-top)) 20px 12px;
  border-bottom: 1px solid rgb(226 232 240 / 0.72);
  background: rgb(255 255 255 / 0.96);
}

.header-actions { display: flex; flex: 0 0 auto; align-items: center; gap: 8px; }.roadside-note-button { display: inline-flex; min-height: 40px; align-items: center; gap: 6px; padding: 0 11px; border: 1px solid #fdba74; border-radius: 12px; background: #fff7ed; color: #c2410c; font-size: 0.7rem; font-weight: 800; }.roadside-note-button.active { border-color: #86efac; background: #f0fdf4; color: #047857; }.roadside-note-button.active::after { width: 7px; height: 7px; border-radius: 50%; background: #10b981; content: ''; box-shadow: 0 0 0 3px rgb(16 185 129 / 0.15); }
.roadside-note-button.claimed { border-color: #93c5fd; background: #eff6ff; color: #1d4ed8; }
.roadside-note-button.claimed::after { background: #2563eb; box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15); }
.roadside-note-button:disabled { cursor: not-allowed; opacity: 0.82; }

.notification-button {
  position: relative;
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: #f8fafc;
  color: var(--color-text);
}

.notification-button span {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  min-width: 18px;
  height: 18px;
  padding-inline: 3px;
  place-items: center;
  border: 2px solid white;
  border-radius: 50%;
  background: var(--color-danger);
  color: white;
  font-size: 0.58rem;
  font-weight: 850;
}

.map-stage {
  position: relative;
  height: calc(100svh - 92px);
  min-height: 680px;
  overflow: hidden;
}

.greeting-card,
.location-card {
  position: absolute;
  z-index: 550;
  right: 16px;
  left: 16px;
  display: grid;
  align-items: center;
  gap: 12px;
  border: 1px solid rgb(226 232 240 / 0.88);
  background: rgb(255 255 255 / 0.96);
  box-shadow: 0 12px 32px rgb(15 23 42 / 0.12);
  backdrop-filter: blur(14px);
}

.greeting-card {
  top: 16px;
  grid-template-columns: auto 1fr auto;
  min-height: 68px;
  padding: 10px 14px;
  border-radius: 19px;
  color: var(--color-text);
  text-align: left;
}

.avatar {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(145deg, #d1fae5, #86efac);
  color: var(--color-primary-deep);
  font-size: 0.78rem;
  font-weight: 850;
}

.greeting-copy,
.location-card > span:nth-child(2) {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.greeting-copy strong { font-size: 1rem; }
.greeting-copy small,
.location-card small { color: var(--color-text-soft); font-size: 0.72rem; }

.location-card {
  top: 96px;
  grid-template-columns: auto 1fr auto;
  min-height: 64px;
  padding: 10px 12px;
  border-radius: 17px;
}

.location-card strong {
  overflow: hidden;
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 13px;
  background: var(--color-primary-soft);
  color: var(--color-primary-dark);
}

.location-card button,
.map-actions button {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: white;
  color: #334155;
}

.map-actions {
  position: absolute;
  z-index: 560;
  right: 18px;
  bottom: 348px;
}

.map-actions button { box-shadow: 0 8px 24px rgb(15 23 42 / 0.18); }

.booking-sheet {
  position: absolute;
  z-index: 600;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  gap: 14px;
  padding: 10px 18px 100px;
  border: 1px solid rgb(226 232 240 / 0.9);
  border-bottom: 0;
  border-radius: 28px 28px 0 0;
  background: rgb(255 255 255 / 0.98);
  box-shadow: 0 -16px 50px rgb(15 23 42 / 0.16);
}

.sheet-handle {
  width: 48px;
  height: 5px;
  justify-self: center;
  border-radius: 999px;
  background: #dbe1e8;
}

.roadside-tracking {
  display: grid;
  gap: 9px;
  padding: 12px;
  border: 1px solid #93c5fd;
  border-radius: 15px;
  background: linear-gradient(135deg, #eff6ff, #f0fdf4);
  box-shadow: 0 8px 20px rgb(37 99 235 / 0.08);
}

.roadside-tracking-heading {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 9px;
}

.roadside-tracking-heading > span {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 11px;
  background: #dbeafe;
  color: #1d4ed8;
}

.roadside-tracking-heading > div { display: grid; gap: 2px; }
.roadside-tracking-heading small { color: #1d4ed8; font-size: 0.6rem; font-weight: 800; text-transform: uppercase; }
.roadside-tracking-heading strong { font-size: 0.82rem; }
.roadside-tracking-heading em { padding: 4px 7px; border-radius: 999px; background: #dcfce7; color: #047857; font-size: 0.58rem; font-style: normal; font-weight: 850; text-transform: uppercase; }
.roadside-tracking-meta { display: flex; flex-wrap: wrap; gap: 6px; }
.roadside-tracking-meta span { padding: 4px 7px; border-radius: 999px; background: rgb(255 255 255 / 0.85); color: #334155; font-size: 0.62rem; font-weight: 750; }
.roadside-tracking p { margin: 0; padding: 7px 9px; border-left: 3px solid #3b82f6; background: rgb(255 255 255 / 0.72); color: #1e3a8a; font-size: 0.68rem; line-height: 1.35; }
.booking-locked { padding: 9px 11px; border: 1px solid #bfdbfe; border-radius: 12px; background: #eff6ff; color: #1e40af; font-size: 0.68rem; font-weight: 700; line-height: 1.4; }

.sheet-heading { display: grid; gap: 2px; }
.sheet-heading h1 { margin: 0; font-size: 1.25rem; letter-spacing: -0.025em; }

.active-booking {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 13px;
  background: #ecfdf5;
  color: var(--color-primary-deep);
  font-size: 0.72rem;
  font-weight: 800;
}

.active-booking > span { display: flex; align-items: center; gap: 5px; }
.active-booking > span:first-child { display: grid; gap: 2px; }
.active-booking small { color: var(--color-primary-dark); font-size: 0.62rem; }
.active-booking strong { text-transform: capitalize; }

.location-fields {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 17px;
  background: white;
}

.location-fields button {
  display: grid;
  width: 100%;
  min-height: 66px;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 13px;
  border: 0;
  background: white;
  color: var(--color-text);
  text-align: left;
}

.location-fields button + button { border-top: 1px solid var(--color-border); }
.location-fields button > span:nth-child(2) { display: grid; min-width: 0; gap: 3px; }
.location-fields small { color: var(--color-text-soft); font-size: 0.68rem; text-transform: capitalize; }
.location-fields strong { overflow: hidden; font-size: 0.82rem; text-overflow: ellipsis; white-space: nowrap; }
.location-fields button > svg { color: #64748b; }

.field-pin {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 12px;
}

.field-pin.pickup { background: #ecfdf5; color: var(--color-primary); }
.field-pin.dropoff { background: #fff1f2; color: var(--color-danger); }
.location-note { margin: -4px 0 0; color: #92400e; font-size: 0.7rem; line-height: 1.4; }

@media (max-width: 430px) { .dashboard-header { gap: 8px; padding-inline: 12px; }.dashboard-header :deep(.brand) { gap: 7px; }.dashboard-header :deep(.brand span) { display: none; }.roadside-note-button { padding-inline: 9px; } }

@media (min-width: 800px) {
  .commuter-dashboard { padding: 24px; background: var(--color-background); }
  .dashboard-header {
    min-height: 82px;
    padding: 12px 20px;
    border: 1px solid var(--color-border);
    border-radius: 22px 22px 0 0;
  }
  .map-stage {
    height: calc(100vh - 130px);
    min-height: 650px;
    border: 1px solid var(--color-border);
    border-top: 0;
    border-radius: 0 0 24px 24px;
  }
  .greeting-card,
  .location-card { right: auto; width: min(390px, calc(100% - 40px)); left: 20px; }
  .booking-sheet {
    top: 20px;
    right: 20px;
    bottom: 20px;
    left: auto;
    width: min(430px, calc(100% - 40px));
    align-content: end;
    padding: 18px;
    border: 1px solid rgb(226 232 240 / 0.9);
    border-radius: 24px;
  }
  .map-actions { right: 468px; bottom: 28px; }
}
</style>
