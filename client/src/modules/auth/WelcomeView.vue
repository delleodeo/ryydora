<script setup>
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from '@lucide/vue';
import BrandLogo from '../../components/common/BrandLogo.vue';
</script>

<template>
  <section class="welcome-page">
    <div class="visual">
      <div class="ambient ambient-one"></div><div class="ambient ambient-two"></div>
      <div class="visual-top"><BrandLogo inverse /></div>
      <div class="map-lines" aria-hidden="true"></div>
      <div class="ride-pin pin-one"><MapPin :size="18" /> <span>Town center</span></div>
      <div class="ride-pin pin-two"><Sparkles :size="18" /> <span>Driver nearby</span></div>
      <div class="hero-copy">
        <span class="tag"><ShieldCheck :size="16" /> Built for Victoria</span>
        <h1>Your local ride,<br />right when you need it.</h1>
        <p>Book trusted tricycle drivers for shared or private trips around Victoria, Oriental Mindoro.</p>
      </div>
    </div>
    <div class="actions">
      <div><span class="eyebrow">Welcome to Rydora</span><h2>Let’s get you moving.</h2><p>Quick booking, live updates, and fares shown before you ride.</p></div>
      <div class="buttons">
        <RouterLink to="/register" class="primary">Create an account <ArrowRight :size="18" /></RouterLink>
        <RouterLink to="/login" class="secondary">I already have an account</RouterLink>
      </div>
      <small>By continuing, you agree to use RYDORA responsibly and follow local transport rules.</small>
    </div>
  </section>
</template>

<style scoped>
.welcome-page { display: grid; min-height: 100vh; background: white; }
.visual { position: relative; display: flex; min-height: 56vh; overflow: hidden; flex-direction: column; padding: 24px; color: white; background: linear-gradient(145deg, #052e2b, #065f46 56%, #059669); }
.visual::after { position: absolute; inset: auto -20% -40% 5%; width: 560px; height: 560px; border: 1px solid rgb(167 243 208 / 0.18); border-radius: 50%; content: ''; }
.visual-top, .hero-copy, .ride-pin { position: relative; z-index: 2; }
.map-lines { position: absolute; inset: 0; opacity: 0.22; background-image: linear-gradient(35deg, transparent 47%, #a7f3d0 48%, #a7f3d0 50%, transparent 51%), linear-gradient(-48deg, transparent 47%, #6ee7b7 48%, #6ee7b7 49%, transparent 50%); background-size: 160px 120px, 210px 170px; transform: scale(1.4) rotate(-8deg); }
.ambient { position: absolute; border-radius: 50%; filter: blur(2px); }
.ambient-one { top: -90px; right: -70px; width: 280px; height: 280px; background: rgb(52 211 153 / 0.22); }
.ambient-two { right: 34%; bottom: 18%; width: 120px; height: 120px; background: rgb(255 255 255 / 0.08); }
.ride-pin { position: absolute; display: none; align-items: center; gap: 8px; padding: 10px 13px; border: 1px solid rgb(255 255 255 / 0.2); border-radius: 13px; background: rgb(255 255 255 / 0.13); box-shadow: 0 16px 30px rgb(0 0 0 / 0.12); font-size: 0.75rem; font-weight: 700; backdrop-filter: blur(12px); }
.pin-one { top: 30%; right: 9%; }.pin-two { top: 46%; left: 12%; }
.hero-copy { max-width: 580px; margin-top: auto; padding-top: 100px; }
.tag { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 18px; padding: 8px 12px; border-radius: 999px; background: rgb(255 255 255 / 0.13); font-size: 0.73rem; font-weight: 750; }
h1 { margin-bottom: 16px; font-size: clamp(2.35rem, 10vw, 4.6rem); line-height: 0.98; letter-spacing: -0.055em; }
.hero-copy p { max-width: 490px; margin-bottom: 0; color: rgb(255 255 255 / 0.78); font-size: 0.95rem; line-height: 1.65; }
.actions { display: grid; align-content: center; gap: 24px; padding: 30px 24px max(24px, env(safe-area-inset-bottom)); }
.actions h2 { margin-bottom: 8px; font-size: 1.65rem; letter-spacing: -0.035em; }
.actions p { margin-bottom: 0; color: var(--color-text-soft); line-height: 1.55; }
.buttons { display: grid; gap: 11px; }
.buttons a { display: flex; min-height: 52px; align-items: center; justify-content: center; gap: 10px; border-radius: 14px; font-size: 0.9rem; font-weight: 800; }
.primary { color: white; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); box-shadow: var(--shadow-float); }
.secondary { border: 1px solid var(--color-border); background: white; }
.actions > small { color: #94a3b8; font-size: 0.68rem; line-height: 1.5; text-align: center; }
@media (min-width: 800px) { .welcome-page { grid-template-columns: minmax(0, 1.35fr) minmax(380px, 0.65fr); } .visual { min-height: 100vh; padding: 44px; } .actions { padding: 48px; } .ride-pin { display: flex; } }
</style>

