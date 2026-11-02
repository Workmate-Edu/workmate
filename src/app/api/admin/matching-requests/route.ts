import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { intakePath } from '@/lib/learning-workflow';
const changeSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i), role: z.enum(['parent', 'student']), from: z.enum(['pending', 'reviewing', 'contacting']), status: z.enum(['pending', 'reviewing', 'contacting']), note: z.string().trim().max(1000) });
export async function PATCH(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const result = changeSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: 'Check the request details' }, { status: 400 });
  const { id, role, from, status, note } = result.data;
  const path = intakePath(role);
  await connectDB();
  const updated = await User.updateOne({ _id: id, role, emailVerified: true, [`${path}.status`]: from }, { $set: {
    [`${path}.status`]: status, [`${path}.teamNote`]: note,
    [`${path}.updatedAt`]: new Date(), [`${path}.updatedBy`]: session.user.id,
  } });
  if (!updated.matchedCount) return NextResponse.json({ error: 'Request changed. Refresh before updating.' }, { status: 409 });
  return NextResponse.json({ success: true });
}
