"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      console.log('🔴 Socket: Waiting for session...', { status, userId: session?.user?.id });
      return;
    }

    console.log('🟡 Socket: Initializing...', {
      userId: session.user.id,
      role: session.user.role,
      attempts: connectionAttempts
    });

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        userId: session.user.id,
        role: session.user.role
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'], // Allow fallback to polling
      forceNew: true,
      withCredentials: true
    });

    socketInstance.on('connect', () => {
      console.log('🟢 Socket: Connected!', {
        id: socketInstance.id,
        userId: session.user.id
      });
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔴 Socket: Disconnected!', { reason });
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔴 Socket: Connection Error!', {
        message: error.message,
        userId: session.user.id,
        attempt: connectionAttempts + 1
      });
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);

      // If multiple failures, try fallback to polling
      if (connectionAttempts > 2) {
        socketInstance.io.opts.transports = ['polling', 'websocket'];
      }
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('🟡 Socket: Reconnected!', { attemptNumber });
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log('🟡 Socket: Reconnecting...', { attemptNumber });
    });

    setSocket(socketInstance);

    return () => {
      console.log('🔴 Socket: Cleaning up...', { id: socketInstance.id });
      socketInstance.disconnect();
      setConnectionAttempts(0);
    };
  }, [session?.user?.id, status, connectionAttempts]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocketContext = () => useContext(SocketContext);
