<script setup>
import { LockKeyhole, Mail, MoveLeft, Phone, UserRound } from '@lucide/vue';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import BrandLogo from '../../components/common/BrandLogo.vue';
import AppButton from '../../components/ui/AppButton.vue';
import AppInput from '../../components/ui/AppInput.vue';
import { useAuthStore } from '../../stores/auth.js';

const auth = useAuthStore();
const router = useRouter();
const form = reactive({ firstName: '', lastName: '', email: '', phone: '', password: '', accountType: 'commuter' });

async function submit() {
  try {
    const user = await auth.register({ ...form, email: form.email || undefined, phone: form.phone || undefined });
    router.replace(user.role === 'driver' ? '/driver/home' : '/app/home');
  } catch { /* Safe error is displayed from the store. */ }
}
</script>

<template>
  <section class="register-page">
    <div class="panel">
      <RouterLink to="/welcome" class="back"><MoveLeft :size="19" /> Back</RouterLink>
      <BrandLogo />
      <div><h1>Create your RYDORA account</h1><p class="muted">Join as a commuter or apply to drive.</p></div>
      <div class="role-picker" role="group" aria-label="Account type">
        <button type="button" :class="{ selected: form.accountType === 'commuter' }" @click="form.accountType = 'commuter'">Commuter<span>Book a ride</span></button>
        <button type="button" :class="{ selected: form.accountType === 'driver' }" @click="form.accountType = 'driver'">Driver<span>Apply to drive</span></button>
      </div>
      <form @submit.prevent="submit">
        <div v-if="auth.error" class="alert" role="alert">{{ auth.error.message }}</div>
        <div class="name-grid"><AppInput v-model="form.firstName" label="First name" autocomplete="given-name" required><template #icon><UserRound :size="18" /></template></AppInput><AppInput v-model="form.lastName" label="Last name" autocomplete="family-name" required /></div>
        <AppInput v-model="form.email" label="Email" type="email" placeholder="you@example.com" autocomplete="email"><template #icon><Mail :size="18" /></template></AppInput>
        <AppInput v-model="form.phone" label="Phone number" type="tel" placeholder="+639171234567" autocomplete="tel"><template #icon><Phone :size="18" /></template></AppInput>
        <AppInput v-model="form.password" label="Password" type="password" hint="Use at least 8 characters." autocomplete="new-password" minlength="8" required><template #icon><LockKeyhole :size="18" /></template></AppInput>
        <AppButton type="submit" size="lg" block :loading="auth.loading">{{ form.accountType === 'driver' ? 'Submit driver application' : 'Create account' }}</AppButton>
      </form>
      <p class="switch">Already registered? <RouterLink to="/login">Sign in</RouterLink></p>
    </div>
  </section>
</template>

<style scoped>
.register-page { min-height: 100vh; padding: 28px 20px; background: radial-gradient(circle at 90% 0%, #d1fae5, transparent 25rem), var(--color-background); }
.panel { position: relative; display: grid; width: min(100%, 650px); gap: 24px; margin-inline: auto; padding: 56px 0 30px; }
.back { position: absolute; top: 6px; display: inline-flex; align-items: center; gap: 7px; color: var(--color-text-soft); font-size: 0.8rem; font-weight: 700; }
h1 { margin-bottom: 8px; font-size: clamp(1.7rem, 6vw, 2.3rem); letter-spacing: -0.04em; }
.role-picker { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.role-picker button { display: grid; gap: 3px; min-height: 66px; padding: 10px; border: 1px solid var(--color-border); border-radius: 14px; background: white; color: var(--color-text); font-weight: 800; }
.role-picker button span { color: var(--color-text-soft); font-size: 0.7rem; font-weight: 600; }.role-picker .selected { border-color: var(--color-primary); background: #ecfdf5; color: var(--color-primary-dark); }
form { display: grid; gap: 17px; padding: 22px; border: 1px solid var(--color-border); border-radius: 20px; background: rgb(255 255 255 / 0.88); box-shadow: var(--shadow-md); }
.name-grid { display: grid; gap: 17px; }.alert { padding: 12px; border-radius: 12px; background: #fef2f2; color: #b91c1c; font-size: 0.82rem; }.switch { color: var(--color-text-soft); font-size: 0.84rem; text-align: center; }.switch a { color: var(--color-primary-dark); font-weight: 800; }
@media (min-width: 600px) { .name-grid { grid-template-columns: 1fr 1fr; } }
</style>

