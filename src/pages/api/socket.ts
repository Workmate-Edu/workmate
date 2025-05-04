import { Server } from 'socket.io'
import { NextApiRequest } from 'next'
import { NextApiResponseServerIO } from '@/types/next'
import { createHash } from 'crypto'

// Constants
const CONNECTIONS_PER_IP = 3
const MAX_ROOMS_PER_USER = 5
const RATE_WINDOW = 60 * 1000 // 1 minute
const MAX_EVENTS_PER_WINDOW = 50
const CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes

// In-memory storage with timestamps
const connectionsByIp = new Map<string, { count: number; lastAccess: number }>()
const userRooms = new Map<string, { rooms: Set<string>; lastAccess: number }>()
const eventCounts = new Map<string, { count: number; timestamp: number }>()

// Cleanup old data periodically
const cleanup = () => {
  const now = Date.now()
  const expiry = now - CLEANUP_INTERVAL

  for (const [key, value] of connectionsByIp.entries()) {
    if (value.lastAccess < expiry) connectionsByIp.delete(key)
  }
  
  for (const [key, value] of userRooms.entries()) {
    if (value.lastAccess < expiry) userRooms.delete(key)
  }
  
  for (const [key, value] of eventCounts.entries()) {
    if (value.timestamp < expiry) eventCounts.delete(key)
  }
}

setInterval(cleanup, CLEANUP_INTERVAL)

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('Initializing new socket server')

    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      transports: ['websocket'],
      connectTimeout: Number(process.env.SOCKET_PING_TIMEOUT) || 5000,
      pingTimeout: Number(process.env.SOCKET_PING_TIMEOUT) || 5000,
      pingInterval: Number(process.env.SOCKET_PING_INTERVAL) || 10000,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST']
      },
      connectionStateRecovery: {
        maxDisconnectionDuration: 2000
      }
    })

    // Connection management
    io.use((socket, next) => {
      try {
        const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address
        const ipHash = createHash('sha256').update(clientIp.toString()).digest('hex')
        
        const now = Date.now()
        const ipData = connectionsByIp.get(ipHash) || { count: 0, lastAccess: now }
        
        if (ipData.count >= CONNECTIONS_PER_IP) {
          return next(new Error('Too many connections from this IP'))
        }
        
        ipData.count++
        ipData.lastAccess = now
        connectionsByIp.set(ipHash, ipData)
        
        socket.on('disconnect', () => {
          const data = connectionsByIp.get(ipHash)
          if (data) {
            data.count = Math.max(0, data.count - 1)
            if (data.count === 0) connectionsByIp.delete(ipHash)
          }
        })
        
        next()
      } catch (error) {
        next(new Error('Authentication error'))
      }
    })

    io.on('connection', (socket) => {
      const userId = socket.handshake.auth.userId
      if (!userId) {
        socket.disconnect(true)
        return
      }

      let userRoomCount = 0
      const lastActivity = Date.now()

      // Rate limiting per socket
      const checkRateLimit = () => {
        const now = Date.now()
        const userEvents = eventCounts.get(socket.id) || { count: 0, timestamp: now }
        
        if (now - userEvents.timestamp > RATE_WINDOW) {
          // Reset counter for new window
          userEvents.count = 1
          userEvents.timestamp = now
        } else if (userEvents.count >= MAX_EVENTS_PER_WINDOW) {
          return false
        } else {
          userEvents.count++
        }
        
        eventCounts.set(socket.id, userEvents)
        return true
      }

      // Efficient room management
      socket.on('join_conversation', (conversationId: string) => {
        if (!checkRateLimit()) {
          socket.emit('error', 'Rate limit exceeded')
          return
        }

        if (userRoomCount >= MAX_ROOMS_PER_USER) {
          socket.emit('error', 'Max room limit reached')
          return
        }

        const userRoomSet = userRooms.get(userId) || { rooms: new Set(), lastAccess: Date.now() }
        userRoomSet.rooms.add(conversationId)
        userRoomSet.lastAccess = Date.now()
        userRooms.set(userId, userRoomSet)
        userRoomCount++
        
        socket.join(conversationId)
      })

      socket.on('leave_conversation', (conversationId: string) => {
        if (!checkRateLimit()) return
        
        const userRoomSet = userRooms.get(userId)
        if (userRoomSet?.rooms.has(conversationId)) {
          userRoomSet.rooms.delete(conversationId)
          userRoomCount--
          socket.leave(conversationId)
        }
      })

      // Auto disconnect inactive sockets
      const inactivityTimeout = setTimeout(() => {
        socket.disconnect(true)
      }, Number(process.env.SOCKET_INACTIVE_TIMEOUT) || 300000)

      socket.on('disconnect', () => {
        clearTimeout(inactivityTimeout)
        eventCounts.delete(socket.id)
        userRooms.delete(userId)
      })

      // Essential events only
      const activityEvents = ['send_message', 'typing']
      activityEvents.forEach(event => {
        socket.on(event, () => {
          if (!checkRateLimit()) {
            socket.emit('error', 'Rate limit exceeded')
            return
          }
        })
      })
    })

    res.socket.server.io = io
  }

  res.end()
}

export default SocketHandler

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
}
