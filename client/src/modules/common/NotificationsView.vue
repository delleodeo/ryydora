<script setup>
import { Bell, CheckCheck } from '@lucide/vue';
import { onMounted, ref } from 'vue';
import { api } from '../../services/api.js';

const notifications = ref([]); const unreadCount = ref(0); const loading = ref(true);
async function load() { try { const response = await api.get('/notifications'); notifications.value = response.data.data.notifications; unreadCount.value = response.data.data.unreadCount; } finally { loading.value = false; } }
async function markRead(item) { if (item.readAt) return; const response = await api.patch(`/notifications/${item._id}/read`); item.readAt = response.data.data.notification.readAt; unreadCount.value = Math.max(0, unreadCount.value - 1); }
onMounted(load);
const format = (value) => new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round((new Date(value) - Date.now()) / 3600000), 'hour');
</script>

<template><section class="page notifications-page"><div class="page-header"><div><span class="eyebrow">Stay informed</span><h1 class="page-title">Notifications</h1><p class="muted">{{ unreadCount }} unread update{{ unreadCount === 1 ? '' : 's' }}</p></div></div><div v-if="loading" class="skeleton" style="height:300px"></div><div v-else-if="!notifications.length" class="card empty-state"><div><Bell :size="38" /><h2>You’re all caught up</h2><p>Important ride updates will appear here.</p></div></div><div v-else class="stack"><button v-for="item in notifications" :key="item._id" class="notification card" :class="{ unread: !item.readAt }" @click="markRead(item)"><span class="icon"><Bell :size="19" /></span><span class="copy"><strong>{{ item.title }}</strong><span>{{ item.message }}</span><small>{{ format(item.createdAt) }}</small></span><CheckCheck v-if="item.readAt" :size="18" class="read" /></button></div></section></template>
<style scoped>.notifications-page{max-width:760px}.notification{display:grid;width:100%;grid-template-columns:auto 1fr auto;align-items:start;gap:12px;padding:15px;color:var(--color-text);text-align:left}.notification.unread{border-color:#a7f3d0;background:#f0fdf4}.icon{display:grid;width:40px;height:40px;place-items:center;border-radius:12px;background:#d1fae5;color:var(--color-primary-dark)}.copy{display:grid;gap:4px}.copy strong{font-size:.83rem}.copy>span{color:var(--color-text-soft);font-size:.75rem;line-height:1.45}.copy small{color:#94a3b8;font-size:.65rem}.read{color:var(--color-primary)}.empty-state svg{margin:auto auto 12px;color:var(--color-primary)}.empty-state h2{font-size:1rem}.empty-state p{font-size:.78rem}</style>

