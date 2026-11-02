jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/models/message', () => ({
  Conversation: { exists: jest.fn() }, NewMessage: { findOne: jest.fn() },
}));
jest.mock('@/lib/encryption', () => ({ decrypt: (s: string) => s }));
jest.mock('@/lib/pusher', () => ({ pusherServer: { authorizeChannel: jest.fn(() => ({ auth: 'signed' })) } }));

import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as client, Socket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { Conversation, NewMessage } from '@/models/message';
import { pusherServer } from '@/lib/pusher';
import { createRealtimeToken, verifyRealtimeToken } from '@/lib/realtime-token';
import { secureSocketServer } from '@/lib/socket/secure-server';
import { POST as authorizePusher } from '@/app/api/pusher/auth/route';
import { POST as issueToken } from '@/app/api/realtime/token/route';

const owner = '111111111111111111111111';
const outsider = '222222222222222222222222';
const conversationId = '333333333333333333333333';
const messageId = '444444444444444444444444';
const oldSecret = process.env.NEXTAUTH_SECRET;
beforeAll(() => { process.env.NEXTAUTH_SECRET = 'test-realtime-secret'; });
afterAll(() => { if (oldSecret === undefined) delete process.env.NEXTAUTH_SECRET; else process.env.NEXTAUTH_SECRET = oldSecret; });
beforeEach(() => {
  jest.clearAllMocks();
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: owner } });
  (Conversation.exists as jest.Mock).mockImplementation(async query => query['participants.userId'] === owner ? { _id: conversationId } : null);
});

it('issues non-cacheable credentials only for authenticated users', async () => {
  (getServerSession as jest.Mock).mockResolvedValue(null);
  expect((await issueToken()).status).toBe(401);
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: owner } });
  const response = await issueToken();
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(verifyRealtimeToken((await response.json()).token).userId).toBe(owner);
});

it('rejects expired, tampered, and wrong-purpose tokens', () => {
  expect(() => verifyRealtimeToken(createRealtimeToken(owner) + 'x')).toThrow();
  expect(() => verifyRealtimeToken(jwt.sign({}, process.env.NEXTAUTH_SECRET!, { subject: owner, audience: 'workmate-realtime', issuer: 'workmate', expiresIn: -1 }))).toThrow();
  expect(() => verifyRealtimeToken(jwt.sign({}, process.env.NEXTAUTH_SECRET!, { subject: owner, audience: 'other', expiresIn: 60 }))).toThrow();
});

it.each([
  [`private-user-${owner}`, 200], [`private-user-${outsider}`, 403],
  [`private-chat-${conversationId}`, 200], [`chat-${conversationId}`, 403], ['presence-admin', 403],
])('checks channel %s', async (channel, expected) => {
  const response = await authorizePusher(new Request('https://example.com/api/pusher/auth', {
    method: 'POST', body: new URLSearchParams({ channel_name: channel, socket_id: '123.456' }),
  }));
  expect(response.status).toBe(expected);
  expect(pusherServer.authorizeChannel).toHaveBeenCalledTimes(expected === 200 ? 1 : 0);
});

it('denies nonparticipant private chat subscriptions', async () => {
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: outsider } });
  expect((await authorizePusher(new Request('https://example.com', { method: 'POST', body: `socket_id=123.456&channel_name=private-chat-${conversationId}` }))).status).toBe(403);
  expect(pusherServer.authorizeChannel).not.toHaveBeenCalled();
});

it('enforces identity, room membership and saved-message ownership over real socket connections', async () => {
  const http = createServer();
  const io = new Server(http);
  secureSocketServer(io);
  await new Promise<void>(resolve => http.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${(http.address() as { port: number }).port}`;
  const sockets: Socket[] = [];
  const open = (auth: object) => { const socket = client(url, { auth, transports: ['websocket'], reconnection: false }); sockets.push(socket); return socket; };
  const event = (socket: Socket, name: string) => new Promise<any>(resolve => socket.once(name, resolve));
  try {
    const forged = open({ userId: owner });
    expect((await event(forged, 'connect_error')).message).toBe('Unauthorized');
    const stranger = open({ token: createRealtimeToken(outsider), userId: owner });
    await event(stranger, 'connect');
    const denied = event(stranger, 'error');
    stranger.emit('join_conversation', conversationId);
    expect(await denied).toBe('Conversation unavailable');
    const sender = open({ token: createRealtimeToken(owner), userId: outsider });
    await event(sender, 'connect');
    // Observe the adapter to confirm the client's authorized join completed.
    const joined = new Promise<void>(resolve => io.of('/').adapter.once('join-room', (room) => { if (room === conversationId) resolve(); }));
    sender.emit('join_conversation', conversationId);
    await joined;
    (NewMessage.findOne as jest.Mock).mockReturnValue({ lean: async () => ({ _id: messageId, content: 'Saved content', senderId: owner, conversationId }) });
    const delivered = event(sender, 'receive_message');
    sender.emit('send_message', { conversationId, messageId, message: { content: 'Forged', senderId: outsider } });
    expect(await delivered).toEqual(expect.objectContaining({ content: 'Saved content', senderId: owner }));
    expect(NewMessage.findOne).toHaveBeenCalledWith(expect.objectContaining({ senderId: owner, conversationId, _id: messageId }));
    const refused = event(stranger, 'error');
    stranger.emit('send_message', { conversationId, messageId });
    expect(await refused).toBe('Conversation unavailable');
    (Conversation.exists as jest.Mock).mockResolvedValue(null);
    const removed = event(sender, 'error');
    sender.emit('send_message', { conversationId, messageId });
    expect(await removed).toBe('Conversation unavailable');
  } finally {
    sockets.forEach(socket => socket.disconnect());
    await new Promise<void>(resolve => io.close(() => resolve()));
  }
});
