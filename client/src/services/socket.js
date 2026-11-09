import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket() {
  const instance = getSocket();
  if (!instance.connected) instance.connect();
  return instance;
}

export function reconnectSocket() {
  const instance = getSocket();
  instance.disconnect();
  instance.connect();
  return instance;
}

export function disconnectSocket() {
  socket?.disconnect();
}

