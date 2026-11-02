import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createRealtimeToken } from '@/lib/realtime-token';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  return NextResponse.json({ token: createRealtimeToken(session.user.id) }, { headers: { 'Cache-Control': 'no-store' } });
}
