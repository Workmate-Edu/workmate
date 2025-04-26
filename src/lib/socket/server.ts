import { Server } from 'socket.io'
import { createServer } from 'http'

let io: Server;

if (!global.io) {
  const httpServer = createServer();
  io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
  });
  global.io = io;
} else {
  io = global.io;
}

export { io };
