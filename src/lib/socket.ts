import { socketAuth, restoreConversationRooms } from '@/lib/socket/client-auth';
import { io, Socket } from 'socket.io-client'

export const initSocket = (auth: any): Socket => {
  console.log('Initializing socket connection...')
  
  const socket = io({
    path: '/api/socket',
    addTrailingSlash: false,
    auth: socketAuth,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  })

  restoreConversationRooms(socket);
  // Debug events
  socket.on('connect', () => {
    console.log('Socket connected successfully', socket.id)
  })

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err)
  })

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason)
    if (reason === 'io server disconnect') socket.connect()
  })

  return socket
}

let socket: Socket | null = null

export const getSocket = (): Socket | null => socket
