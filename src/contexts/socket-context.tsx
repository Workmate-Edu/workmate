import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { initSocket } from '@/lib/socket'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connect: (auth: any) => void
  disconnect: () => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {}
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback((auth: any) => {
    // Don't create new socket if one already exists
    if (socketRef.current?.connected) {
      console.log('Socket already connected, skipping...')
      return
    }

    console.log('Initializing socket connection...')
    const newSocket = initSocket(auth)
    socketRef.current = newSocket

    newSocket.on('connect', () => {
      console.log('Socket connected with ID:', newSocket.id)
      setIsConnected(true)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    setSocket(newSocket)
  }, [])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting socket:', socketRef.current.id)
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [])

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection')
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocketContext = () => useContext(SocketContext)
