<script setup>
import { BarChart3, Bike, BookOpenCheck, CircleUserRound, Gauge, LogOut, Users, WalletCards } from '@lucide/vue';
import { useAuthStore } from '../../stores/auth.js';
import BrandLogo from '../common/BrandLogo.vue';

defineEmits(['navigate']);
const auth = useAuthStore();
const items = [
  { label: 'Dashboard', to: '/admin', icon: Gauge },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Drivers', to: '/admin/drivers', icon: Bike },
  { label: 'Bookings', to: '/admin/bookings', icon: BookOpenCheck },
  { label: 'Fare settings', to: '/admin/fares', icon: WalletCards },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Profile', to: '/admin/profile', icon: CircleUserRound },
];
</script>

<template>
  <aside class="sidebar">
    <BrandLogo inverse />
    <nav aria-label="Admin navigation">
      <RouterLink v-for="item in items" :key="item.to" :to="item.to" @click="$emit('navigate')">
        <component :is="item.icon" :size="19" /><span>{{ item.label }}</span>
      </RouterLink>
    </nav>
    <button class="signout" @click="auth.logout()"><LogOut :size="19" /> Sign out</button>
  </aside>
</template>

<style scoped>
.sidebar { display: flex; height: 100%; flex-direction: column; gap: 30px; padding: 26px 18px; background: linear-gradient(165deg, #064e3b, #047857 68%, #059669); color: white; }
nav { display: grid; gap: 7px; }
nav a, .signout { display: flex; min-height: 44px; align-items: center; gap: 12px; padding: 0 13px; border: 0; border-radius: 12px; background: transparent; color: rgb(255 255 255 / 0.75); font-size: 0.86rem; font-weight: 700; text-align: left; }
nav a:hover, nav a.router-link-exact-active { color: white; background: rgb(255 255 255 / 0.13); }
.signout { width: 100%; margin-top: auto; }
</style>

