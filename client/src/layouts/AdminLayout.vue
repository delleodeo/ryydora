<script setup>
import { Menu, X } from '@lucide/vue';
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import AdminSidebar from '../components/navigation/AdminSidebar.vue';
const drawer = ref(false);
</script>

<template>
  <div class="admin-layout">
    <div class="desktop-sidebar"><AdminSidebar /></div>
    <header><button aria-label="Open navigation" @click="drawer = true"><Menu /></button><strong>RYDORA Admin</strong></header>
    <Transition name="drawer">
      <div v-if="drawer" class="drawer-backdrop" @click.self="drawer = false">
        <div class="drawer"><button class="close" aria-label="Close navigation" @click="drawer = false"><X /></button><AdminSidebar @navigate="drawer = false" /></div>
      </div>
    </Transition>
    <main><RouterView /></main>
  </div>
</template>

<style scoped>
.admin-layout { min-height: 100vh; }
.desktop-sidebar { position: fixed; z-index: 900; inset: 0 auto 0 0; display: none; width: 250px; }
header { position: sticky; z-index: 800; top: 0; display: flex; min-height: 64px; align-items: center; gap: 14px; padding: 0 18px; border-bottom: 1px solid var(--color-border); background: rgb(255 255 255 / 0.94); }
header button, .close { display: grid; width: 42px; height: 42px; place-items: center; border: 0; border-radius: 12px; background: #f1f5f9; }
.drawer-backdrop { position: fixed; z-index: 1100; inset: 0; background: rgb(15 23 42 / 0.5); }
.drawer { position: relative; width: min(84vw, 280px); height: 100%; }
.close { position: absolute; z-index: 2; top: 12px; right: -54px; color: white; background: rgb(255 255 255 / 0.15); }
.drawer-enter-active, .drawer-leave-active { transition: opacity 180ms ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
@media (min-width: 960px) { .desktop-sidebar { display: block; } header { display: none; } main { margin-left: 250px; } }
</style>

