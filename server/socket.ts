import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  const role = socket.handshake.auth.role;
  
  if (!userId) {
    return next(new Error("Invalid credentials"));
  }
  
  socket.data.userId = userId;
  socket.data.role = role;
  next();
});

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.data.userId);

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.data.userId} joined conversation ${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.data.userId} left conversation ${conversationId}`);
  });

  socket.on('send_message', async (data) => {
    io.to(data.conversationId).emit('receive_message', data.message);
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.data.userId);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
});
