import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { SupportRequest } from '@/models/support-request';

const submission = z.object({
  category: z.enum(['support', 'safeguarding', 'safeguarding-escalation', 'privacy-access', 'privacy-correction', 'privacy-deletion']),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = submission.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Check your contact details, request type and message' }, { status: 400 });
  const session = await getAuthSession();
  await connectDB();
  const item = await SupportRequest.create({
    category: parsed.data.category,
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    restricted: parsed.data.category === 'safeguarding-escalation',
    ...(session?.user?.id ? { submittedBy: session.user.id } : {}),
  });
  return NextResponse.json({ success: true, reference: String(item._id), message: 'Your request was recorded in Workmate’s support queue.' }, { status: 201 });
}

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  await connectDB();
  const requests = await SupportRequest.find({}).select('category name email message status restricted createdAt').sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ requests });
}
