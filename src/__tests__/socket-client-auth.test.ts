import { socketAuth, restoreConversationRooms } from '@/lib/socket/client-auth';

it('refreshes credentials and fails closed when the session is unavailable', async () => {
  const originalFetch = global.fetch;
  const callback = jest.fn();
  global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'fresh-token' }) }).mockResolvedValueOnce({ ok: false });
  try {
    await socketAuth(callback);
    expect(callback).toHaveBeenLastCalledWith({ token: 'fresh-token' });
    await socketAuth(callback);
    expect(callback).toHaveBeenLastCalledWith({ token: '' });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  } finally { global.fetch = originalFetch; }
});

it('restores only active conversation rooms after reconnecting', () => {
  let outgoing: Function = () => {};
  let connect: Function = () => {};
  const socket = {
    onAnyOutgoing: (handler: Function) => { outgoing = handler; },
    on: (_: string, handler: Function) => { connect = handler; },
    emit: jest.fn(),
  };
  restoreConversationRooms(socket as any);
  outgoing('join_conversation', 'active');
  outgoing('join_conversation', 'left');
  outgoing('leave_conversation', 'left');
  connect();
  expect(socket.emit).toHaveBeenCalledTimes(1);
  expect(socket.emit).toHaveBeenCalledWith('join_conversation', 'active');
});
