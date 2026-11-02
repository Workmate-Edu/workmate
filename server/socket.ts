import './env';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { secureSocketServer } from '../src/lib/socket/secure-server';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', methods: ['GET', 'POST'], credentials: true },
  maxHttpBufferSize: 100000,
});
secureSocketServer(io);
httpServer.listen(process.env.SOCKET_PORT || 3001);
