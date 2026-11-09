import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api, getApiError } from '../services/api.js';
import { connectSocket, disconnectSocket } from '../services/socket.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const initialized = ref(false);
  const loading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => Boolean(user.value));
  const role = computed(() => user.value?.role);

  async function initialize() {
    if (initialized.value) return;
    loading.value = true;
    try {
      const response = await api.get('/auth/me');
      user.value = response.data.data.user;
      connectSocket();
    } catch {
      user.value = null;
    } finally {
      initialized.value = true;
      loading.value = false;
    }
  }

  async function login(credentials) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post('/auth/login', credentials);
      user.value = response.data.data.user;
      initialized.value = true;
      connectSocket();
      return user.value;
    } catch (caught) {
      error.value = getApiError(caught, 'Unable to sign in.');
      throw caught;
    } finally {
      loading.value = false;
    }
  }

  async function register(account) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post('/auth/register', account);
      user.value = response.data.data.user;
      initialized.value = true;
      connectSocket();
      return user.value;
    } catch (caught) {
      error.value = getApiError(caught, 'Unable to create the account.');
      throw caught;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      disconnectSocket();
      user.value = null;
      initialized.value = true;
    }
  }

  function clearSession() {
    disconnectSocket();
    user.value = null;
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('rydora:session-expired', clearSession);
  }

  return {
    user,
    role,
    loading,
    error,
    initialized,
    isAuthenticated,
    initialize,
    login,
    register,
    logout,
    clearSession,
  };
});

