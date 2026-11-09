<script setup>
import { ArrowLeft, CheckCircle2, Navigation, UserRound } from '@lucide/vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RydoraMap from '../../components/maps/RydoraMap.vue';
import AppButton from '../../components/ui/AppButton.vue';
import StatusPill from '../../components/ui/StatusPill.vue';
import { api, getApiError } from '../../services/api.js';
import { reconnectSocket } from '../../services/socket.js';
import { useUiStore } from '../../stores/ui.js';

const route = useRoute(); const router = useRouter(); const ui = useUiStore();
const booking = ref(null); const loading = ref(true); const actionLoading = ref(false);
const center = computed(() => booking.value ? [booking.value.pickupLocation.coordinates[1], booking.value.pickupLocation.coordinates[0]] : [13.1734, 121.2788]);
const markers = computed(() => booking.value ? [
  { id: 'pickup', position: [booking.value.pickupLocation.coordinates[1], booking.value.pickupLocation.coordinates[0]], type: 'assigned', label: 'Passenger pickup' },
  { id: 'dropoff', position: [booking.value.dropoffLocation.coordinates[1], booking.value.dropoffLocation.coordinates[0]], type: 'dropoff', label: 'Passenger drop-off' },
] : []);
onMounted(load);
async function load() { try { const response = await api.get(`/bookings/${route.params.id}`); booking.value = response.data.data.booking; } catch (error) { ui.notify(getApiError(error).message, 'error'); router.replace('/driver/home'); } finally { loading.value = false; } }
async function transition(action) { actionLoading.value = true; try { const response = await api.post(`/drivers/bookings/${booking.value._id}/${action}`); booking.value = response.data.data.booking; ui.notify(action === 'complete' ? 'Ride completed.' : 'Booking status updated.', 'success'); if (action === 'complete') { reconnectSocket(); router.replace('/driver/home'); } } catch (error) { ui.notify(getApiError(error).message, 'error'); } finally { actionLoading.value = false; } }
</script>

<template>
  <section v-if="booking" class="ride-page">
    <div class="map"><RydoraMap :center="center" :markers="markers" :route-geometry="booking.routeGeometry" height="100%" /><button class="back" @click="router.back()"><ArrowLeft :size="20" /></button></div>
    <div class="ride-sheet card">
      <div class="heading"><div><span class="eyebrow">Assigned booking</span><h1>{{ booking.status === 'picked_up' ? 'Ongoing ride' : 'Passenger pickup' }}</h1></div><StatusPill :status="booking.status" /></div>
      <div class="passenger"><span><UserRound :size="22" /></span><div><small>Passenger</small><strong>{{ booking.commuterId?.firstName }} {{ booking.commuterId?.lastName }}</strong></div><span class="seats">{{ booking.passengerCount }} seat{{ booking.passengerCount > 1 ? 's' : '' }}</span></div>
      <div class="locations"><div><span class="pickup-dot"></span><p><small>Pickup</small><strong>{{ booking.pickupLocation.label }}</strong></p></div><div><span class="dropoff-dot"></span><p><small>Drop-off</small><strong>{{ booking.dropoffLocation.label }}</strong></p></div></div>
      <div class="fare"><span>{{ booking.rideType === 'shared' ? 'Shared ride' : 'Private ride' }}</span><strong>₱{{ booking.estimatedFare.toFixed(0) }}</strong></div>
      <AppButton v-if="booking.status === 'accepted'" block size="lg" :loading="actionLoading" @click="transition('arriving')"><template #icon><Navigation :size="19" /></template>Start navigating to pickup</AppButton>
      <AppButton v-else-if="booking.status === 'driver_arriving'" block size="lg" :loading="actionLoading" @click="transition('pickup')"><template #icon><UserRound :size="19" /></template>Mark passenger as picked up</AppButton>
      <AppButton v-else-if="booking.status === 'picked_up'" block size="lg" :loading="actionLoading" @click="transition('complete')"><template #icon><CheckCircle2 :size="19" /></template>Complete passenger drop-off</AppButton>
    </div>
  </section>
  <section v-else class="page"><div class="skeleton" style="height:70vh"></div></section>
</template>

<style scoped>
.ride-page { min-height: calc(100vh - 68px); }.map { position: relative; height: 48vh; min-height: 350px; }.back { position: absolute; z-index: 600; top: 15px; left: 15px; display: grid; width: 45px; height: 45px; place-items: center; border: 0; border-radius: 13px; background: white; box-shadow: var(--shadow-md); }.ride-sheet { position: relative; z-index: 650; display: grid; gap: 17px; margin-top: -23px; padding: 21px 18px 110px; border-radius: 24px 24px 0 0; }.heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }.heading h1 { margin: 0; font-size: 1.2rem; }.passenger { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 11px; padding: 13px; border-radius: 14px; background: #f1f5f9; }.passenger > span:first-child { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 50%; background: white; color: var(--color-primary-dark); }.passenger > div { display: grid; gap: 3px; }.passenger small { color: var(--color-text-soft); }.passenger strong { font-size: 0.82rem; }.seats { color: var(--color-primary-dark); font-size: 0.72rem; font-weight: 800; }.locations { display: grid; gap: 13px; }.locations > div { display: grid; grid-template-columns: auto 1fr; gap: 11px; }.locations span { width: 13px; height: 13px; margin-top: 5px; border: 3px solid; border-radius: 50%; }.pickup-dot { border-color: var(--color-primary) !important; }.dropoff-dot { border-color: var(--color-danger) !important; }.locations p { display: grid; gap: 3px; margin: 0; }.locations small { color: var(--color-text-soft); }.locations strong { font-size: 0.8rem; }.fare { display: flex; align-items: center; justify-content: space-between; padding: 13px 0; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); font-size: 0.8rem; }.fare strong { font-size: 1.05rem; }
@media (min-width: 850px) { .ride-page { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; padding: 27px; }.map { height: calc(100vh - 124px); overflow: hidden; border-radius: 22px; }.ride-sheet { align-self: start; margin: 0; padding: 22px; border-radius: 22px; } }
</style>

