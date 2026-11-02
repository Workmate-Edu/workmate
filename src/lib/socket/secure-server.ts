import type { Server } from 'socket.io';
import { verifyRealtimeToken } from '../realtime-token';
import { connectDB } from '../mongodb';
import { isConversationParticipant } from '../conversation-access';
import { NewMessage } from '../../models/message';
import { decrypt } from '../encryption';

export function secureSocketServer(io: Server) {
  io.use((socket, next) => {
    try {
      Object.assign(socket.data, verifyRealtimeToken(socket.handshake.auth?.token));
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', socket => {
    const expiry = setTimeout(() => socket.disconnect(true), Math.max(0, socket.data.expiresAt - Date.now()));
    socket.on('disconnect', () => clearTimeout(expiry));
    let count = 0;
    let windowStart = Date.now();
    const authorize = async (id: unknown) => {
      if (Date.now() - windowStart > 60000) { count = 0; windowStart = Date.now(); }
      if (++count > 50 || Date.now() >= socket.data.expiresAt || typeof id !== 'string') return false;
      await connectDB();
      return isConversationParticipant(id, socket.data.userId);
    };
    const deny = () => socket.emit('error', 'Conversation unavailable');
    socket.on('join_conversation', async (id: unknown) => {
      try {
        if (!await authorize(id) || (!socket.rooms.has(id as string) && socket.rooms.size >= 6)) return deny();
        await socket.join(id as string);
      } catch { deny(); }
    });
    socket.on('leave_conversation', (id: unknown) => {
      if (typeof id === 'string' && id !== socket.id) void socket.leave(id);
    });
    socket.on('send_message', async (data: { conversationId?: string; messageId?: string } = {}) => {
      try {
        if (!await authorize(data?.conversationId) || !/^[a-f\d]{24}$/i.test(data?.messageId || '')) return deny();
        const message = await NewMessage.findOne({ _id: data.messageId, conversationId: data.conversationId, senderId: socket.data.userId, isDeleted: { $ne: true } }).lean();
        if (!message) return deny();
        // Recheck recipients so removed participants cannot receive subsequent messages.
        const recipients = await io.in(data.conversationId!).fetchSockets();
        for (const recipient of recipients) {
          if (Date.now() >= recipient.data.expiresAt || !await isConversationParticipant(data.conversationId!, recipient.data.userId)) {
            await recipient.leave(data.conversationId!);
            continue;
          }
          recipient.emit('receive_message', { ...message, content: decrypt(message.content) });
        }
      } catch { deny(); }
    });
  });
}
