import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useRouter } from 'next/navigation'

const MAX_RECONNECTION_ATTEMPTS = 3
const RECONNECTION_DELAY = 5000

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
  const router = useRouter()
  const currentPath = useRef<string>('')

  const connect = useCallback((auth: any) => {
    // Only connect for messaging/live session pages
    const isMessagingPage = currentPath.current.includes('/messages')
    const isLiveSessionPage = currentPath.current.includes('/session/')
    
    if (!isMessagingPage && !isLiveSessionPage) {
      return
    }

    if (socketRef.current?.connected) {
      return
    }

    const newSocket = io({
      path: '/api/socket',
      transports: ['websocket'],
      auth
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    // Handle browser window/tab events
    const handleVisibilityChange = () => {
      if (document.hidden && socketRef.current?.connected) {
        socketRef.current.disconnect()
      } else if (!document.hidden && !socketRef.current?.connected) {
        socketRef.current?.connect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [])

  // Track page changes for conditional socket connection
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      currentPath.current = url
      
      // Disconnect if moving away from messaging/live session pages
      if (!url.includes('/messages') && !url.includes('/session/')) {
        disconnect()
      }
    }

    router.events?.on('routeChangeStart', handleRouteChange)

    return () => {
      router.events?.off('routeChangeStart', handleRouteChange)
      disconnect()
    }
  }, [router, disconnect])

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
