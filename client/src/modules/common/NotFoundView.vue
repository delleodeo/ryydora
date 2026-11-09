<script setup>
import { MapPinned } from '@lucide/vue';
</script>
<template><main class="error-page"><MapPinned :size="52" /><span class="eyebrow">404 · Route not found</span><h1>Looks like this ride took a wrong turn.</h1><p>The page you’re looking for doesn’t exist or has moved.</p><RouterLink to="/">Return to RYDORA</RouterLink></main></template>
<style scoped>.error-page{display:grid;min-height:100vh;justify-items:center;align-content:center;padding:24px;text-align:center}.error-page>svg{margin-bottom:18px;color:var(--color-primary)}h1{max-width:600px;font-size:clamp(1.9rem,7vw,3.5rem);letter-spacing:-.05em}p{color:var(--color-text-soft)}a{margin-top:16px;padding:14px 18px;border-radius:13px;color:white;background:var(--color-primary);font-weight:800}</style>

