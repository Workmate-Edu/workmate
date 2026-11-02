import type { Socket } from 'socket.io-client';

export function restoreConversationRooms(socket: Socket) {
  const rooms = new Set<string>();
  socket.onAnyOutgoing((event, id) => {
    if (event === 'join_conversation' && typeof id === 'string') rooms.add(id);
    if (event === 'leave_conversation') rooms.delete(id);
  });
  socket.on('connect', () => {
    rooms.forEach(id => socket.emit('join_conversation', id));
  });
}

// Refresh credentials on every connection/reconnection, including token expiry.
export async function socketAuth(callback: (data: { token: string }) => void) {
  try {
    const response = await fetch('/api/realtime/token', { method: 'POST', credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error('Unauthorized');
    const { token } = await response.json();
    callback({ token });
  } catch {
    callback({ token: '' });
  }
}
