import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';

const decision = z.object({ status: z.enum(['verified', 'rejected']), note: z.string().trim().min(3).max(500) });
export async function PATCH(req: Request, { params }: { params: { ownerId: string } }) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  if (!/^[a-f\d]{24}$/i.test(params.ownerId)) return NextResponse.json({ error: 'Invalid parent account' }, { status: 400 });
  const parsed = decision.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Record a decision and review note' }, { status: 400 });
  await connectDB();
  const result = await User.updateOne(
    { _id: params.ownerId, role: 'parent', 'legalAcknowledgements.parentalAuthority.acknowledgedAt': { $exists: true } },
    { $set: { 'safeguarding.parentalVerification': { ...parsed.data, reviewedAt: new Date(), reviewedBy: session.user.id } } },
  );
  if (!result.matchedCount) return NextResponse.json({ error: 'Parent acknowledgement not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
