<script setup>
import { LogOut, Mail, Phone, Save, ShieldCheck, UserRound } from '@lucide/vue';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppButton from '../../components/ui/AppButton.vue';
import AppInput from '../../components/ui/AppInput.vue';
import { api, getApiError } from '../../services/api.js';
import { useAuthStore } from '../../stores/auth.js';
import { useUiStore } from '../../stores/ui.js';

const auth = useAuthStore(); const ui = useUiStore(); const router = useRouter(); const saving = ref(false);
const form = reactive({ firstName: auth.user?.firstName ?? '', lastName: auth.user?.lastName ?? '', phone: auth.user?.phone ?? '' });
async function save() { saving.value = true; try { const response = await api.patch('/users/me', { firstName: form.firstName, lastName: form.lastName, ...(form.phone ? { phone: form.phone } : {}) }); auth.user = response.data.data.user; ui.notify('Profile updated.', 'success'); } catch (error) { ui.notify(getApiError(error).message, 'error'); } finally { saving.value = false; } }
async function logout() { await auth.logout(); router.replace('/login'); }
</script>

<template><section class="page profile-page"><div class="profile-hero"><div class="avatar"><UserRound :size="34" /></div><h1>{{ auth.user?.firstName }} {{ auth.user?.lastName }}</h1><span><ShieldCheck :size="16" /> {{ auth.user?.role }}</span><p>{{ auth.user?.email || auth.user?.phone }}</p></div><form class="card" @submit.prevent="save"><h2>Personal information</h2><div class="name-grid"><AppInput v-model="form.firstName" label="First name" required /><AppInput v-model="form.lastName" label="Last name" required /></div><AppInput :model-value="auth.user?.email || 'Not provided'" label="Email" disabled><template #icon><Mail :size="18" /></template></AppInput><AppInput v-model="form.phone" label="Phone number"><template #icon><Phone :size="18" /></template></AppInput><AppButton type="submit" :loading="saving"><template #icon><Save :size="18" /></template>Save changes</AppButton></form><AppButton variant="danger" block @click="logout"><template #icon><LogOut :size="18" /></template>Sign out</AppButton></section></template>
<style scoped>.profile-page{display:grid;max-width:720px;gap:18px}.profile-hero{display:grid;justify-items:center;padding:22px;text-align:center}.avatar{display:grid;width:78px;height:78px;place-items:center;margin-bottom:12px;border-radius:25px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);color:var(--color-primary-dark)}.profile-hero h1{margin-bottom:7px;font-size:1.4rem}.profile-hero>span{display:inline-flex;align-items:center;gap:6px;color:var(--color-primary-dark);font-size:.72rem;font-weight:800;text-transform:capitalize}.profile-hero p{margin:8px 0 0;color:var(--color-text-soft);font-size:.75rem}form{display:grid;gap:17px;padding:20px}form h2{margin:0;font-size:1rem}.name-grid{display:grid;gap:17px}@media(min-width:600px){.name-grid{grid-template-columns:1fr 1fr}}</style>

