"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSocketContext } from './socket-context'

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  setUnreadCount: () => {}
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const { socket } = useSocketContext()
  const { data: session } = useSession()

  useEffect(() => {
    if (!socket || !session?.user?.id) return

    socket.on('notification:read', (data) => {
      setUnreadCount(data.unreadCount)
    })

    socket.on('notification', (data) => {
      if (data.type === 'new_notification') {
        setUnreadCount(prev => prev + 1)
      }
    })

    return () => {
      socket.off('notification:read')
      socket.off('notification')
    }
  }, [socket, session?.user?.id])

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
