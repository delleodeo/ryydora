<script setup>
import { ShieldAlert } from '@lucide/vue';
import { useAuthStore } from '../../stores/auth.js';
const auth = useAuthStore();
const home = auth.role === 'admin' ? '/admin' : auth.role === 'driver' ? '/driver/home' : '/app/home';
</script>
<template><main class="error-page"><ShieldAlert :size="52" /><span class="eyebrow">Access denied</span><h1>This area isn’t available to your account.</h1><p>RYDORA keeps commuter, driver, and administrator tools separated for safety.</p><RouterLink :to="home">Return to your dashboard</RouterLink></main></template>
<style scoped>.error-page{display:grid;min-height:100vh;justify-items:center;align-content:center;padding:24px;text-align:center}.error-page>svg{margin-bottom:18px;color:var(--color-danger)}h1{max-width:560px;font-size:clamp(1.8rem,6vw,3rem);letter-spacing:-.04em}p{max-width:500px;color:var(--color-text-soft);line-height:1.6}a{margin-top:12px;padding:14px 18px;border-radius:13px;color:white;background:var(--color-primary);font-weight:800}</style>

