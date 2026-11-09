<script setup>
import { CalendarDays, MapPin } from '@lucide/vue';
import { onMounted, ref } from 'vue';
import StatusPill from '../../components/ui/StatusPill.vue';
import { api } from '../../services/api.js';
const bookings = ref([]); const loading = ref(true);
onMounted(async () => { try { const response = await api.get('/drivers/history'); bookings.value = response.data.data.bookings; } finally { loading.value = false; } });
const format = (date) => new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeZone: 'Asia/Manila' }).format(new Date(date));
</script>

<template><section class="page history"><div class="page-header"><div><span class="eyebrow">Driver activity</span><h1 class="page-title">Booking history</h1></div></div><div v-if="loading" class="skeleton" style="height:300px"></div><div v-else-if="!bookings.length" class="card empty-state"><div><CalendarDays :size="38" /><h2>No assigned bookings yet</h2></div></div><div v-else class="stack"><RouterLink v-for="item in bookings" :key="item._id" :to="`/driver/booking/${item._id}`" class="card row"><div><small>{{ format(item.createdAt) }}</small><strong><MapPin :size="15" /> {{ item.pickupLocation.label }}</strong><span>{{ item.rideType === 'shared' ? 'Shared' : 'Private' }} · ₱{{ (item.finalFare ?? item.estimatedFare).toFixed(0) }}</span></div><StatusPill :status="item.status" /></RouterLink></div></section></template>
<style scoped>.history{max-width:780px}.row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px}.row>div{display:grid;gap:5px;min-width:0}.row small,.row span{color:var(--color-text-soft);font-size:.68rem}.row strong{display:flex;align-items:center;gap:6px;overflow:hidden;font-size:.8rem;text-overflow:ellipsis;white-space:nowrap}.empty-state svg{margin:auto auto 12px;color:var(--color-primary)}.empty-state h2{font-size:1rem}</style>

