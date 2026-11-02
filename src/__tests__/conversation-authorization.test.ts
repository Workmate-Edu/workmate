jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/models/message', () => ({
  Conversation: { exists: jest.fn(), findByIdAndUpdate: jest.fn() },
  NewMessage: { create: jest.fn(), find: jest.fn(), findOne: jest.fn(), findOneAndUpdate: jest.fn(), findByIdAndUpdate: jest.fn(), updateMany: jest.fn() },
}));
jest.mock('@/lib/pusher', () => ({ pusherServer: { trigger: jest.fn() } }));
jest.mock('@/lib/encryption', () => ({ encrypt: (s: string) => s, decrypt: (s: string) => s }));
jest.mock('cloudinary', () => ({ v2: {} }));

import { getServerSession } from 'next-auth';
import { Conversation, NewMessage } from '@/models/message';
import { pusherServer } from '@/lib/pusher';
import { isConversationParticipant } from '@/lib/conversation-access';
import { GET, POST } from '@/app/api/conversations/[conversationId]/messages/route';
import { POST as read } from '@/app/api/conversations/[conversationId]/read/route';
import { POST as typing } from '@/app/api/conversations/[conversationId]/typing/route';
import { PATCH, DELETE } from '@/app/api/conversations/[conversationId]/messages/[messageId]/route';

const userId = '111111111111111111111111';
const conversationId = '222222222222222222222222';
const messageId = '333333333333333333333333';
const context = { params: { conversationId, messageId } };
const request = () => new Request('https://example.com/api/messages', {
  method: 'POST', body: JSON.stringify({ content: 'Hello', isTyping: true }),
});
const handlers = [['read messages', GET], ['send message', POST], ['read receipts', read], ['typing', typing], ['edit', PATCH], ['delete', DELETE]] as const;

beforeEach(() => {
  jest.clearAllMocks();
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: userId, role: 'parent' } });
  (Conversation.exists as jest.Mock).mockResolvedValue(null);
});

it.each(handlers)('requires login to %s', async (_, handler) => {
  (getServerSession as jest.Mock).mockResolvedValue(null);
  expect((await handler(request(), context)).status).toBe(401);
  expect(Conversation.exists).not.toHaveBeenCalled();
});

it.each(handlers)('denies nonparticipants attempting to %s without side effects', async (_, handler) => {
  expect((await handler(request(), context)).status).toBe(404);
  for (const method of Object.values(NewMessage)) expect(method).not.toHaveBeenCalled();
  expect(Conversation.findByIdAndUpdate).not.toHaveBeenCalled();
  expect(pusherServer.trigger).not.toHaveBeenCalled();
  expect(Conversation.exists).toHaveBeenCalledWith({ _id: conversationId, 'participants.userId': userId });
});

it('allows a participant to send a typing notification using the authenticated identity', async () => {
  (Conversation.exists as jest.Mock).mockResolvedValue({ _id: conversationId });
  expect((await typing(request(), context)).status).toBe(200);
  expect(pusherServer.trigger).toHaveBeenCalledWith(`private-chat-${conversationId}`, 'typing-status', expect.objectContaining({ userId, isTyping: true }));
});

it('scopes message edits to the conversation and sender before updating', async () => {
  (Conversation.exists as jest.Mock).mockResolvedValue({ _id: conversationId });
  (NewMessage.findOne as jest.Mock).mockResolvedValue(null);
  expect((await PATCH(request(), context)).status).toBe(404);
  expect(NewMessage.findOne).toHaveBeenCalledWith({ _id: messageId, conversationId, senderId: userId, isDeleted: { $ne: true } });
  expect(NewMessage.findOneAndUpdate).not.toHaveBeenCalled();
});

it('rejects malformed identifiers without querying the database', async () => {
  expect(await isConversationParticipant('invalid', userId)).toBe(false);
  expect(await isConversationParticipant(conversationId, '')).toBe(false);
  expect(Conversation.exists).not.toHaveBeenCalled();
});
