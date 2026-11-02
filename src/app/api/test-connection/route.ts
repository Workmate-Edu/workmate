import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export async function GET() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  try {
    await connectDB();
    return NextResponse.json({ status: 'Connected', connectionState: mongoose.connection.readyState });
  } catch {
    return NextResponse.json({ error: 'Database connection check failed' }, { status: 500 });
  }
}
