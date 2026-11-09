<script setup>
import { computed } from 'vue';
import { CalendarDays, CircleUserRound, Home, WalletCards } from '@lucide/vue';
import { useRoute } from 'vue-router';

const props = defineProps({ role: { type: String, required: true } });
const route = useRoute();
const items = computed(() =>
  props.role === 'driver'
    ? [
        { label: 'Home', to: '/driver/home', icon: Home },
        { label: 'Bookings', to: '/driver/history', icon: CalendarDays },
        { label: 'Earnings', to: '/driver/earnings', icon: WalletCards },
        { label: 'Profile', to: '/driver/profile', icon: CircleUserRound },
      ]
    : [
        { label: 'Home', to: '/app/home', icon: Home },
        { label: 'Bookings', to: '/app/history', icon: CalendarDays },
        { label: 'Wallet', to: '/app/wallet', icon: WalletCards },
        { label: 'Profile', to: '/app/profile', icon: CircleUserRound },
      ],
);
function active(to) { return route.path === to || (to.includes('history') && route.path.includes('booking')); }
</script>

<template>
  <nav class="bottom-nav" aria-label="Primary navigation">
    <RouterLink v-for="item in items" :key="item.to" :to="item.to" :class="{ active: active(item.to) }">
      <component :is="item.icon" :size="20" :stroke-width="active(item.to) ? 2.6 : 2" />
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav { position: fixed; z-index: 900; right: 12px; bottom: max(10px, env(safe-area-inset-bottom)); left: 12px; display: grid; max-width: 560px; min-height: 66px; grid-template-columns: repeat(4, 1fr); margin-inline: auto; padding: 7px; border: 1px solid rgb(226 232 240 / 0.9); border-radius: 20px; background: rgb(255 255 255 / 0.94); box-shadow: 0 14px 40px rgb(15 23 42 / 0.16); backdrop-filter: blur(16px); }
a { display: grid; place-items: center; gap: 3px; border-radius: 14px; color: #64748b; font-size: 0.64rem; font-weight: 700; transition: 150ms ease; }
a.active { color: var(--color-primary-dark); background: #ecfdf5; }
@media (min-width: 900px) { .bottom-nav { bottom: 18px; } }
</style>

