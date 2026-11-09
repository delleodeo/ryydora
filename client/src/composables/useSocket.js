import { onBeforeUnmount, onMounted } from 'vue';
import { connectSocket, getSocket } from '../services/socket.js';

export function useSocketListeners(listeners) {
  const socket = getSocket();
  onMounted(() => {
    connectSocket();
    for (const [event, handler] of Object.entries(listeners)) socket.on(event, handler);
  });
  onBeforeUnmount(() => {
    for (const [event, handler] of Object.entries(listeners)) socket.off(event, handler);
  });
  return socket;
}

