import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { publicHttpsUrl } from '@/lib/safe-url';

export async function PATCH(req: Request, { params }: { params: { teacherId: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let introductionVideoUrl: string;
  try {
    const body = await req.json();
    const rawVideoUrl = typeof body.introductionVideoUrl === 'string' ? body.introductionVideoUrl.trim() : '';
    introductionVideoUrl = rawVideoUrl ? publicHttpsUrl(rawVideoUrl) || '' : '';
    if (rawVideoUrl && !introductionVideoUrl) throw new Error('Unsafe URL');
  } catch {
    return NextResponse.json({ error: 'Enter a public HTTPS introduction video link without embedded credentials' }, { status: 400 });
  }

  await connectDB();
  const update = introductionVideoUrl
    ? { $set: { 'teacherProfile.introductionVideoUrl': introductionVideoUrl } }
    : { $unset: { 'teacherProfile.introductionVideoUrl': 1 } };
  const teacher = await User.findOneAndUpdate(
    { _id: params.teacherId, role: 'teacher' },
    update,
    { new: true }
  ).select('name teacherProfile.introductionVideoUrl').lean();

  if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
  return NextResponse.json({ success: true, introductionVideoUrl: teacher.teacherProfile?.introductionVideoUrl || '' });
}
