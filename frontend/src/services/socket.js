import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';
let socket = null;
const notificationCallbacks = new Set();

export const connectSocket = (token) => {
  if (socket?.connected) return;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('[WS] Connected to WebSocket server');
  });

  socket.on('notification', (data) => {
    console.log('[WS] Received notification:', data);
    notificationCallbacks.forEach((cb) => cb(data));
  });

  socket.on('disconnect', () => {
    console.log('[WS] Disconnected from WebSocket server');
  });

  socket.on('connect_error', (err) => {
    console.error('[WS] Connection error:', err.message);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[WS] Socket disconnected manually');
  }
};

export const getSocket = () => socket;

export const subscribeToNotifications = (callback) => {
  notificationCallbacks.add(callback);
  return () => {
    notificationCallbacks.delete(callback);
  };
};
