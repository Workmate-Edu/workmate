import { Server } from 'socket.io'
import { createServer } from 'http'
import { secureSocketServer } from './secure-server'

let io: Server;

if (!global.io) {
  const httpServer = createServer();
  io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
  });
  secureSocketServer(io);
  global.io = io;
} else {
  io = global.io;
}

export { io };
