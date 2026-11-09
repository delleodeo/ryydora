<script setup>
import { Eye, EyeOff, LockKeyhole, Mail, MoveLeft } from '@lucide/vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BrandLogo from '../../components/common/BrandLogo.vue';
import AppButton from '../../components/ui/AppButton.vue';
import AppInput from '../../components/ui/AppInput.vue';
import { useAuthStore } from '../../stores/auth.js';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const identifier = ref('');
const password = ref('');
const showPassword = ref(false);

function roleHome(role) { return role === 'admin' ? '/admin' : role === 'driver' ? '/driver/home' : '/app/home'; }
async function submit() {
  try {
    const user = await auth.login({ identifier: identifier.value, password: password.value });
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : roleHome(user.role);
    router.replace(redirect);
  } catch { /* Store exposes the safe API error. */ }
}
</script>

<template>
  <section class="auth-page">
    <div class="panel">
      <RouterLink to="/welcome" class="back"><MoveLeft :size="19" /> Back</RouterLink>
      <BrandLogo />
      <div class="heading"><h1>Welcome back</h1><p>Sign in to continue your journey with RYDORA.</p></div>
      <form class="form" @submit.prevent="submit">
        <div v-if="auth.error" class="alert" role="alert">{{ auth.error.message }}</div>
        <AppInput v-model="identifier" label="Email or phone number" placeholder="you@example.com" autocomplete="username" required>
          <template #icon><Mail :size="18" /></template>
        </AppInput>
        <AppInput v-model="password" label="Password" :type="showPassword ? 'text' : 'password'" placeholder="Enter your password" autocomplete="current-password" required>
          <template #icon><LockKeyhole :size="18" /></template>
          <template #suffix><button class="eye" type="button" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" :size="18" /><Eye v-else :size="18" /></button></template>
        </AppInput>
        <AppButton type="submit" size="lg" block :loading="auth.loading">Sign in</AppButton>
      </form>
      <p class="switch">New to RYDORA? <RouterLink to="/register">Create an account</RouterLink></p>
    </div>
    <aside><span class="eyebrow">Victoria, Oriental Mindoro</span><h2>A safer way to find your next tricycle ride.</h2><p>Real-time status, transparent estimates, and verified drivers in one simple app.</p></aside>
  </section>
</template>

<style scoped>
.auth-page { display: grid; min-height: 100vh; background: white; }
.panel { display: grid; width: min(100%, 480px); align-content: center; gap: 30px; margin-inline: auto; padding: 28px 24px; }
.back { position: absolute; top: 24px; display: inline-flex; align-items: center; gap: 7px; color: var(--color-text-soft); font-size: 0.8rem; font-weight: 700; }
.heading h1 { margin-bottom: 8px; font-size: 2rem; letter-spacing: -0.04em; }.heading p { margin: 0; color: var(--color-text-soft); }
.form { display: grid; gap: 18px; }
.alert { padding: 12px 14px; border: 1px solid #fecaca; border-radius: 12px; background: #fef2f2; color: #b91c1c; font-size: 0.82rem; }
.eye { display: grid; padding: 3px; border: 0; background: transparent; color: var(--color-text-soft); }
.switch { margin: 0; color: var(--color-text-soft); font-size: 0.84rem; text-align: center; }.switch a { color: var(--color-primary-dark); font-weight: 800; }
aside { display: none; align-content: end; padding: 70px; color: white; background: linear-gradient(145deg, rgb(4 78 59 / 0.92), rgb(5 150 105 / 0.88)), radial-gradient(circle, #10b981, #064e3b); }
aside h2 { max-width: 550px; margin-bottom: 18px; font-size: clamp(2.3rem, 4vw, 4.4rem); line-height: 1.02; letter-spacing: -0.05em; }aside p { max-width: 470px; color: rgb(255 255 255 / 0.75); line-height: 1.7; }
@media (min-width: 900px) { .auth-page { grid-template-columns: minmax(480px, 0.8fr) minmax(0, 1.2fr); } aside { display: grid; } }
</style>

