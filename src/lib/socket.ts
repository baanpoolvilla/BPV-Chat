import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export interface SocketEvents {
  'message:new': (data: { conversationId: string; message: any }) => void;
  'conversation:status-change': (data: { conversationId: string; status: string }) => void;
  'notification:unread': (data: { count: number }) => void;
  'connection': () => void;
  'disconnect': () => void;
  'error': (error: any) => void;
}

export const initSocket = (token?: string): Socket => {
  if (socketInstance) {
    return socketInstance;
  }

  socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
    auth: {
      token: token || localStorage.getItem('auth_token'),
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socketInstance.on('connect', () => {
    console.log('Socket connected');
  });

  socketInstance.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socketInstance.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socketInstance;
};

export const getSocket = (): Socket | null => {
  return socketInstance;
};

export const connectSocket = (): void => {
  if (socketInstance) {
    socketInstance.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const subscribeToConversation = (
  conversationId: string,
  callback: (message: any) => void
): (() => void) => {
  const socket = getSocket();
  if (!socket) return () => {};

  const eventName = `conversation:${conversationId}`;
  socket.on(eventName, callback);

  return () => {
    socket.off(eventName, callback);
  };
};

export const subscribeToConversations = (
  callback: (data: any) => void
): (() => void) => {
  const socket = getSocket();
  if (!socket) return () => {};

  socket.on('conversations:update', callback);

  return () => {
    socket.off('conversations:update', callback);
  };
};

export const emitMessage = (
  conversationId: string,
  message: any
): void => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit('message:send', {
    conversationId,
    message,
  });
};

export const emitStatusChange = (
  conversationId: string,
  status: string
): void => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit('conversation:status-change', {
    conversationId,
    status,
  });
};
