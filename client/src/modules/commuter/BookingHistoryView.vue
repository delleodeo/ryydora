<script setup>
import { ArrowRight, CalendarDays, MapPin } from '@lucide/vue';
import { onMounted, ref } from 'vue';
import StatusPill from '../../components/ui/StatusPill.vue';
import { useBookingStore } from '../../stores/booking.js';

const store = useBookingStore();
const loading = ref(true);
onMounted(async () => { try { await store.loadHistory(); } finally { loading.value = false; } });
const formatDate = (value) => new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(value));
</script>

<template>
  <section class="page history-page">
    <div class="page-header"><div><span class="eyebrow">Your trips</span><h1 class="page-title">Booking history</h1><p class="muted">Review current and past rides.</p></div></div>
    <div v-if="loading" class="stack"><div v-for="n in 3" :key="n" class="skeleton loading-card"></div></div>
    <div v-else-if="!store.history.length" class="card empty-state"><div><CalendarDays :size="38" /><h2>No bookings yet</h2><p>Your first RYDORA trip will appear here.</p><RouterLink to="/app/home">Book your first ride</RouterLink></div></div>
    <div v-else class="stack">
      <RouterLink v-for="item in store.history" :key="item._id" :to="`/app/booking/${item._id}`" class="booking-card card">
        <div class="booking-top"><div><small>#{{ item._id.slice(-6).toUpperCase() }}</small><strong>{{ item.rideType === 'shared' ? 'Shared ride' : 'Private ride' }}</strong></div><StatusPill :status="item.status" /></div>
        <div class="route"><MapPin :size="17" /><span>{{ item.pickupLocation.label }}</span><ArrowRight :size="15" /><span>{{ item.dropoffLocation.label }}</span></div>
        <div class="booking-bottom"><span>{{ formatDate(item.createdAt) }}</span><strong>₱{{ (item.finalFare ?? item.estimatedFare).toFixed(0) }}</strong></div>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.history-page { max-width: 780px; }.loading-card { height: 145px; }.booking-card { display: grid; gap: 15px; padding: 17px; transition: transform 150ms ease, box-shadow 150ms ease; }.booking-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }.booking-top, .booking-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; }.booking-top > div { display: grid; gap: 3px; }.booking-top small, .booking-bottom { color: var(--color-text-soft); font-size: 0.7rem; }.booking-top strong { font-size: 0.9rem; }.route { display: grid; grid-template-columns: auto 1fr auto 1fr; align-items: center; gap: 7px; color: var(--color-text-soft); }.route > svg:first-child { color: var(--color-primary); }.route span { overflow: hidden; font-size: 0.72rem; text-overflow: ellipsis; white-space: nowrap; }.booking-bottom { padding-top: 12px; border-top: 1px solid var(--color-border); }.booking-bottom strong { color: var(--color-text); font-size: 0.92rem; }.empty-state svg { margin: auto auto 14px; color: var(--color-primary); }.empty-state h2 { margin-bottom: 6px; font-size: 1rem; }.empty-state p { font-size: 0.8rem; }.empty-state a { color: var(--color-primary-dark); font-size: 0.8rem; font-weight: 800; }
</style>

