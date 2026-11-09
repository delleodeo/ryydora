<script setup>
import { Banknote, ReceiptText, ShieldCheck, WalletCards } from '@lucide/vue';
</script>

<template>
  <section class="page wallet-page">
    <div class="page-header"><div><span class="eyebrow">Payments</span><h1 class="page-title">Wallet</h1><p class="muted">Manage how you pay for RYDORA trips.</p></div></div>
    <div class="wallet-card">
      <span class="wallet-icon"><WalletCards :size="26" /></span>
      <span><small>Current payment method</small><strong>Cash</strong><span>Pay the driver after your ride</span></span>
      <Banknote :size="24" />
    </div>
    <div class="card wallet-note"><ShieldCheck :size="21" /><span><strong>No stored balance</strong><small>RYDORA does not hold your funds or card details in this version.</small></span></div>
    <RouterLink class="history-link card" to="/app/history"><ReceiptText :size="21" /><span><strong>Ride receipts</strong><small>See fares from your booking history</small></span></RouterLink>
  </section>
</template>

<style scoped>
.wallet-page { display: grid; max-width: 720px; align-content: start; gap: 16px; }
.wallet-card { display: grid; min-height: 180px; grid-template-columns: auto 1fr auto; align-items: end; gap: 16px; padding: 22px; border-radius: 23px; background: linear-gradient(145deg, #047857, #059669 55%, #10b981); box-shadow: var(--shadow-float); color: white; }
.wallet-icon { display: grid; width: 50px; height: 50px; place-items: center; border-radius: 16px; background: rgb(255 255 255 / 0.16); }
.wallet-card > span:nth-child(2) { display: grid; gap: 4px; }.wallet-card small, .wallet-card span span { color: rgb(255 255 255 / 0.76); font-size: 0.7rem; }.wallet-card strong { font-size: 1.5rem; }
.wallet-note, .history-link { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 13px; padding: 17px; }.wallet-note > span, .history-link > span { display: grid; gap: 4px; }.wallet-note svg, .history-link svg { color: var(--color-primary); }.wallet-note strong, .history-link strong { font-size: 0.84rem; }.wallet-note small, .history-link small { color: var(--color-text-soft); font-size: 0.7rem; line-height: 1.4; }
</style>
