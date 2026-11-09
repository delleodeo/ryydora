import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const toasts = ref([]);

  function notify(message, type = 'info', duration = 4000) {
    const id = crypto.randomUUID();
    toasts.value.push({ id, message, type });
    window.setTimeout(() => dismiss(id), duration);
    return id;
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }

  return { toasts, notify, dismiss };
});

