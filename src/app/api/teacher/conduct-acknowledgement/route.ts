import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { TEACHER_CONDUCT_VERSION } from '@/lib/legal-consent';

export async function POST() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== 'teacher') return NextResponse.json({ error: 'Teacher access required' }, { status: 403 });
  await connectDB();
  const updated = await User.updateOne(
    { _id: session.user.id, role: 'teacher', emailVerified: true },
    { $set: { 'legalAcknowledgements.teacherConduct': { version: TEACHER_CONDUCT_VERSION, acceptedAt: new Date() } } },
  );
  if (!updated.matchedCount) return NextResponse.json({ error: 'Verify your teacher account first' }, { status: 409 });
  return NextResponse.json({ success: true, version: TEACHER_CONDUCT_VERSION });
}
