<script setup>
import { RouterView } from 'vue-router';
import BrandLogo from '../components/common/BrandLogo.vue';
import BottomNav from '../components/navigation/BottomNav.vue';
import { useAuthStore } from '../stores/auth.js';
const auth = useAuthStore();
</script>

<template>
  <div class="driver-layout">
    <header><BrandLogo compact /><div><small>Driver workspace</small><strong>{{ auth.user?.firstName }} {{ auth.user?.lastName }}</strong></div></header>
    <main><RouterView /></main>
    <BottomNav role="driver" />
  </div>
</template>

<style scoped>
.driver-layout { min-height: 100vh; }
header { position: sticky; z-index: 800; top: 0; display: flex; min-height: 68px; align-items: center; gap: 12px; padding-inline: max(18px, calc((100% - var(--content-max)) / 2)); border-bottom: 1px solid var(--color-border); background: rgb(255 255 255 / 0.92); backdrop-filter: blur(15px); }
header div:last-child { display: grid; gap: 2px; }
header small { color: var(--color-text-soft); font-size: 0.67rem; }
header strong { font-size: 0.88rem; }
</style>

