<script setup>
import { Bike, Clock3, MessageCircle, Phone, ReceiptText, Search, UserRound } from '@lucide/vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BookingTimeline from '../../components/bookings/BookingTimeline.vue';
import RydoraMap from '../../components/maps/RydoraMap.vue';
import AppButton from '../../components/ui/AppButton.vue';
import ConfirmationModal from '../../components/ui/ConfirmationModal.vue';
import StatusPill from '../../components/ui/StatusPill.vue';
import { useBookingStore } from '../../stores/booking.js';
import { useUiStore } from '../../stores/ui.js';

const route = useRoute();
const router = useRouter();
const bookingStore = useBookingStore();
const ui = useUiStore();
const loading = ref(true);
const cancelling = ref(false);
const showCancelModal = ref(false);
const booking = computed(() => bookingStore.current);
const driver = computed(() => booking.value?.assignedDriverId);
const center = computed(() => {
  const location = driver.value?.currentLocation || booking.value?.pickupLocation;
  return location ? [location.coordinates[1], location.coordinates[0]] : [13.1734, 121.2788];
});
const markers = computed(() => {
  if (!booking.value) return [];
  const items = [
    { id: 'pickup', position: [booking.value.pickupLocation.coordinates[1], booking.value.pickupLocation.coordinates[0]], type: 'pickup', label: booking.value.pickupLocation.label },
    { id: 'dropoff', position: [booking.value.dropoffLocation.coordinates[1], booking.value.dropoffLocation.coordinates[0]], type: 'dropoff', label: booking.value.dropoffLocation.label },
  ];
  if (driver.value?.currentLocation) items.push({ id: 'driver', position: [driver.value.currentLocation.coordinates[1], driver.value.currentLocation.coordinates[0]], type: 'driver', label: 'Your driver' });
  return items;
});
const isSearching = computed(() => booking.value?.status === 'searching');
const canCancel = computed(() => booking.value?.status === 'searching');

onMounted(async () => {
  try { await bookingStore.load(route.params.id); }
  catch { ui.notify('Booking could not be loaded.', 'error'); router.replace('/app/history'); }
  finally { loading.value = false; }
});
async function confirmCancellation() {
  cancelling.value = true;
  try {
    await bookingStore.cancel('Cancelled by commuter');
    showCancelModal.value = false;
    ui.notify('Booking cancelled.', 'success');
  }
  catch { ui.notify('This booking can no longer be cancelled.', 'error'); }
  finally { cancelling.value = false; }
}
</script>

<template>
  <section v-if="loading" class="loading-page"><div class="skeleton map-skeleton"></div><div class="skeleton card-skeleton"></div></section>
  <section v-else-if="booking" class="status-page">
    <div class="map-panel"><RydoraMap :center="center" :markers="markers" :route-geometry="booking.routeGeometry" :interactive="false" height="100%" /></div>
    <div class="status-sheet card">
      <div class="status-heading">
        <span v-if="isSearching" class="search-icon"><Search :size="22" /></span><span v-else class="driver-icon"><Bike :size="22" /></span>
        <div><span class="eyebrow">Booking #{{ booking._id.slice(-6).toUpperCase() }}</span><h1>{{ isSearching ? 'Finding your driver…' : booking.status === 'completed' ? 'Ride completed' : 'Your ride is in progress' }}</h1></div>
        <StatusPill :status="booking.status" />
      </div>
      <p v-if="isSearching" class="search-copy">Nearby eligible drivers have been notified. You’ll see the assigned driver here as soon as one accepts.</p>
      <BookingTimeline v-if="!['cancelled', 'expired'].includes(booking.status)" :status="booking.status" />
      <div v-if="driver" class="driver-card">
        <div class="avatar"><UserRound :size="25" /></div>
        <div><small>Your driver</small><strong>{{ driver.userId?.firstName }} {{ driver.userId?.lastName }}</strong><span>{{ driver.vehicleId?.bodyNumber }} · {{ driver.vehicleId?.plateNumber }}</span></div>
        <div class="driver-actions"><button aria-label="Call driver"><Phone :size="18" /></button><button aria-label="Message driver"><MessageCircle :size="18" /></button></div>
      </div>
      <div class="trip-card">
        <div class="route-line"><span></span><i></i><span></span></div>
        <div><small>Pickup</small><strong>{{ booking.pickupLocation.label }}</strong><small>Drop-off</small><strong>{{ booking.dropoffLocation.label }}</strong></div>
      </div>
      <div class="facts"><div><ReceiptText :size="17" /><span>Ride type</span><strong>{{ booking.rideType === 'shared' ? 'Shared' : 'Private' }}</strong></div><div><Clock3 :size="17" /><span>Est. fare</span><strong>₱{{ booking.estimatedFare.toFixed(0) }}</strong></div></div>
      <AppButton v-if="canCancel" variant="danger" block @click="showCancelModal = true">Cancel booking</AppButton>
      <AppButton v-if="['completed', 'cancelled', 'expired'].includes(booking.status)" block @click="router.push('/app/home')">Back to home</AppButton>
    </div>
  </section>
  <ConfirmationModal
    :open="showCancelModal"
    title="Cancel this booking?"
    message="Your request will be removed from nearby drivers. You’ll need to create a new booking if you change your mind."
    confirm-label="Yes, cancel booking"
    cancel-label="Keep booking"
    :busy="cancelling"
    danger
    @cancel="showCancelModal = false"
    @confirm="confirmCancellation"
  />
</template>

<style scoped>
.status-page { position: relative; min-height: calc(100vh - 68px); }.map-panel { height: 42vh; min-height: 300px; }.status-sheet { position: relative; z-index: 600; display: grid; gap: 20px; margin-top: -24px; padding: 20px 18px 110px; border-radius: 25px 25px 0 0; box-shadow: 0 -12px 40px rgb(15 23 42 / 0.12); }.status-heading { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; }.search-icon, .driver-icon { display: grid; width: 45px; height: 45px; place-items: center; border-radius: 14px; color: var(--color-primary-dark); background: #d1fae5; }.search-icon svg { animation: pulse 1.3s ease-in-out infinite; }.status-heading h1 { margin: 0; font-size: 1.05rem; letter-spacing: -0.02em; }.search-copy { margin: -7px 0 0; color: var(--color-text-soft); font-size: 0.78rem; line-height: 1.5; }
.driver-card { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; padding: 14px; border: 1px solid #d1fae5; border-radius: 14px; background: #f0fdf4; }.avatar { display: grid; width: 47px; height: 47px; place-items: center; border-radius: 50%; background: white; color: var(--color-primary-dark); }.driver-card > div:nth-child(2) { display: grid; gap: 2px; }.driver-card small, .driver-card span { color: var(--color-text-soft); font-size: 0.67rem; }.driver-actions { display: flex; gap: 6px; }.driver-actions button { display: grid; width: 36px; height: 36px; place-items: center; border: 1px solid #a7f3d0; border-radius: 11px; background: white; color: var(--color-primary-dark); }
.trip-card { display: grid; grid-template-columns: auto 1fr; gap: 13px; }.route-line { display: grid; grid-template-rows: auto 1fr auto; justify-items: center; padding-block: 5px; }.route-line span { width: 11px; height: 11px; border: 3px solid var(--color-primary); border-radius: 50%; }.route-line span:last-child { border-color: var(--color-danger); }.route-line i { width: 1px; background: #cbd5e1; }.trip-card > div:last-child { display: grid; gap: 4px; }.trip-card small { color: var(--color-text-soft); font-size: 0.66rem; }.trip-card strong { margin-bottom: 7px; font-size: 0.8rem; }
.facts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }.facts div { display: grid; grid-template-columns: auto 1fr; gap: 4px 8px; padding: 13px; border: 1px solid var(--color-border); border-radius: 12px; }.facts svg { grid-row: 1 / 3; color: var(--color-primary); }.facts span { color: var(--color-text-soft); font-size: 0.66rem; }.facts strong { font-size: 0.8rem; }
.loading-page { display: grid; gap: 20px; padding: 20px; }.map-skeleton { height: 42vh; }.card-skeleton { height: 350px; }
@keyframes pulse { 50% { transform: scale(1.12); opacity: 0.65; } }
@media (min-width: 850px) { .status-page { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; padding: 28px; }.map-panel { height: calc(100vh - 126px); overflow: hidden; border-radius: 22px; }.status-sheet { align-self: start; margin: 0; padding: 22px; border-radius: 22px; } }
</style>

