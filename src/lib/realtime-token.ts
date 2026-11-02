import jwt from 'jsonwebtoken';

function secret() {
  if (!process.env.NEXTAUTH_SECRET) throw new Error('Missing authentication secret');
  return process.env.NEXTAUTH_SECRET;
}

export function createRealtimeToken(userId: string) {
  return jwt.sign({}, secret(), { algorithm: 'HS256', subject: userId, audience: 'workmate-realtime', issuer: 'workmate', expiresIn: '5m' });
}

export function verifyRealtimeToken(token: unknown) {
  if (typeof token !== 'string') throw new Error('Unauthorized');
  const payload = jwt.verify(token, secret(), { algorithms: ['HS256'], audience: 'workmate-realtime', issuer: 'workmate' });
  if (typeof payload === 'string' || !payload.sub || !/^[a-f\d]{24}$/i.test(payload.sub) || !payload.exp) throw new Error('Unauthorized');
  return { userId: payload.sub, expiresAt: payload.exp * 1000 };
}
