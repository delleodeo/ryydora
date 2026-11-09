<script setup>
import { Bell } from '@lucide/vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { RouterView } from 'vue-router';
import BrandLogo from '../components/common/BrandLogo.vue';
import BottomNav from '../components/navigation/BottomNav.vue';
import { useAuthStore } from '../stores/auth.js';
const auth = useAuthStore();
const route = useRoute();
const immersiveRoutes = new Set(['commuter-home', 'pickup', 'dropoff', 'ride-options', 'available-tricycles', 'booking-status']);
const showChromeHeader = computed(() => !immersiveRoutes.has(route.name));
const showBottomNavigation = computed(() => route.name === 'commuter-home' || !immersiveRoutes.has(route.name));
</script>

<template>
  <div class="app-layout">
    <header v-if="showChromeHeader">
      <BrandLogo compact />
      <div class="welcome"><small>Welcome back</small><strong>{{ auth.user?.firstName }}</strong></div>
      <RouterLink to="/app/notifications" class="icon-button" aria-label="Notifications"><Bell :size="20" /></RouterLink>
    </header>
    <main><RouterView /></main>
    <BottomNav v-if="showBottomNavigation" role="commuter" />
  </div>
</template>

<style scoped>
.app-layout { min-height: 100vh; }
header { position: sticky; z-index: 800; top: 0; display: grid; min-height: 68px; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; padding: env(safe-area-inset-top) 18px 0; border-bottom: 1px solid rgb(226 232 240 / 0.8); background: rgb(255 255 255 / 0.9); backdrop-filter: blur(15px); }
.welcome { display: grid; gap: 2px; }
.welcome small { color: var(--color-text-soft); font-size: 0.67rem; }
.welcome strong { font-size: 0.88rem; }
.icon-button { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; background: #f1f5f9; color: var(--color-text); }
main { min-height: calc(100vh - 68px); }
@media (min-width: 900px) { header { padding-inline: max(28px, calc((100% - var(--content-max)) / 2)); } }
</style>

