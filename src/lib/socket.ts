import { io, Socket } from 'socket.io-client'

export const initSocket = (auth: any): Socket => {
  console.log('Initializing socket connection...')
  
  const socket = io({
    path: '/api/socket',
    addTrailingSlash: false,
    auth,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  })

  // Debug events
  socket.on('connect', () => {
    console.log('Socket connected successfully', socket.id)
  })

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err)
  })

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason)
  })

  return socket
}

let socket: Socket | null = null

export const getSocket = (): Socket | null => socket
