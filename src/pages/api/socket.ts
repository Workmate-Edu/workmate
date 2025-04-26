import { Server } from 'socket.io'
import { NextApiRequest } from 'next'
import { NextApiResponseServerIO } from '@/types/next'

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('Initializing socket server...')
    
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST']
      }
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    res.socket.server.io = io
  }

  res.end()
}

export default SocketHandler

export const config = {
  api: {
    bodyParser: false
  }
}
