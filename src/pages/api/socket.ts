import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/next';
import { secureSocketServer } from '@/lib/socket/secure-server';

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socket', addTrailingSlash: false,
      cors: { origin: process.env.NEXT_PUBLIC_APP_URL, methods: ['GET', 'POST'], credentials: true },
      maxHttpBufferSize: 100000,
    });
    secureSocketServer(io);
    res.socket.server.io = io;
  }
  res.end();
}
export const config = { api: { bodyParser: false, externalResolver: true } };
