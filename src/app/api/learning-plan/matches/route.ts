import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { intakePath } from '@/lib/learning-workflow';
import { LEARNING_SUBJECTS, parentOnboardingSchema } from '@/lib/parent-onboarding';
import { approvedTeacherFilter, teachesSubject, type Shortlist } from '@/lib/teacher-shortlist';
import { parentalVerificationAllowsLearning } from '@/lib/legal-consent';
import { publicHttpsUrl } from '@/lib/safe-url';
const id = z.string().regex(/^[a-f\d]{24}$/i).transform(value => value.toLowerCase());
const target = z.object({ ownerId: id, role: z.enum(['parent', 'student']), learner: z.number().int().min(0).max(9), subjectIndex: z.number().int().min(0).max(11) });
const create = target.extend({ teacherIds: z.array(id).min(1).max(3).refine(ids => new Set(ids).size === ids.length, 'Choose different teachers') });
const feedbackTag = z.enum(['communication', 'teaching-approach', 'learner-comfort', 'subject-fit']);
const action = target.extend({
  action: z.enum(['complete-introduction', 'select', 'save-introduction-feedback']),
  teacherId: id,
  suggestedFeedback: z.array(feedbackTag).max(4).refine(tags => new Set(tags).size === tags.length, 'Choose each suggestion once').optional(),
  comment: z.string().trim().max(1000).optional(),
});
const teacherFields = 'name image bio teacherProfile.bio teacherProfile.subjects teacherProfile.availability teacherProfile.introductionVideoUrl';
const publicVideoUrl = (value: unknown) => publicHttpsUrl(value) || undefined;

export async function GET(req: Request) {
  const session = await getAuthSession();
  if (!session?.user || !['admin', 'parent', 'student'].includes(session.user.role)) return NextResponse.json({ error: 'Sign in with a learner or parent account' }, { status: 403 });
  const subject = z.enum(LEARNING_SUBJECTS).safeParse(new URL(req.url).searchParams.get('subject'));
  if (!subject.success) return NextResponse.json({ error: 'Choose a subject' }, { status: 400 });
  await connectDB();
  if (session.user.role === 'parent') {
    const current = await User.findById(session.user.id).select('role emailVerified isActive legalAcknowledgements safeguarding').lean();
    if (!parentalVerificationAllowsLearning(current)) return NextResponse.json({ error: 'Parental verification is required before browsing teachers' }, { status: 403 });
  }
  const teachers = await User.find(approvedTeacherFilter).select(teacherFields).lean();
  return NextResponse.json({ teachers: teachers.filter(teacher => teachesSubject(teacher, subject.data)).map((teacher: any) => ({ id: String(teacher._id), name: teacher.name, image: teacher.image || undefined, bio: teacher.teacherProfile?.bio || teacher.bio || '', introductionVideoUrl: publicVideoUrl(teacher.teacherProfile?.introductionVideoUrl), availability: (teacher.teacherProfile?.availability || []).map((day: any) => ({ day: day.day, slots: (day.slots || []).map((slot: any) => ({ startTime: slot.startTime, endTime: slot.endTime })) })) })) });
}

async function mutate(req: Request, publishing: boolean) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const parsed = (publishing ? create : action).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Check the teacher and learner details' }, { status: 400 });
  const data = parsed.data;
  const isAdmin = session.user.role === 'admin';
  if (!publishing && body.action === 'complete-introduction') {
    if (!isAdmin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  } else if (!(publishing && isAdmin) && (session.user.id !== data.ownerId || session.user.role !== data.role)) {
    return NextResponse.json({ error: 'You can only choose teachers for your own learning request' }, { status: 403 });
  }
  await connectDB();
  const path = intakePath(data.role);
  const owner: any = await User.findOne({ _id: data.ownerId, role: data.role, emailVerified: true }).select(`${path} role emailVerified isActive legalAcknowledgements safeguarding`).lean();
  const intake = data.role === 'parent' ? owner?.parentProfile?.onboarding : owner?.studentProfile?.onboarding;
  if (!parentalVerificationAllowsLearning(owner)) return NextResponse.json({ error: 'Parental verification is required before teacher matching' }, { status: 403 });
  const validated = parentOnboardingSchema.safeParse(intake);
  const subject = validated.success ? validated.data.learners[data.learner]?.subjects[data.subjectIndex] : undefined;
  if (!subject) return NextResponse.json({ error: 'Learning request not found' }, { status: 404 });
  const key = `${data.learner}_${data.subjectIndex}`;
  const matchPath = `${path}.matches.${key}`;
  const match: Shortlist | undefined = intake.matches?.[key];
  const filter: any = { _id: data.ownerId, role: data.role, emailVerified: true, [`${path}.learners`]: intake.learners };
  let update: any;
  if (publishing) {
    const teacherIds = (data as z.infer<typeof create>).teacherIds;
    const teachers = await User.find({ ...approvedTeacherFilter, _id: { $in: teacherIds } }).select(teacherFields).lean();
    if (teachers.length !== teacherIds.length || teachers.some(teacher => !teachesSubject(teacher, subject))) return NextResponse.json({ error: 'Choose up to three active, verified teachers who teach this subject' }, { status: 400 });
    filter[matchPath] = { $exists: false };
    update = { $set: { [`${path}.status`]: 'contacting', [matchPath]: {
      subject, teachers: teachers.map((teacher: any) => ({ id: String(teacher._id), name: teacher.name, image: teacher.image || undefined, bio: teacher.teacherProfile?.bio || teacher.bio || '', introductionVideoUrl: publicVideoUrl(teacher.teacherProfile?.introductionVideoUrl) })),
      completedIntroductions: [], createdAt: new Date(), createdBy: session.user.id,
    } } };
  } else {
    const { action: operation, teacherId } = data as z.infer<typeof action>;
    if (!match || match.subject !== subject || !match.teachers.some(teacher => teacher.id === teacherId)) return NextResponse.json({ error: 'Teacher is not in this shortlist' }, { status: 400 });
    filter[`${matchPath}.selectedTeacherId`] = { $exists: false };
    if (operation === 'complete-introduction') {
      return NextResponse.json({ error: 'Confirm completion through the booked introduction after it has ended' }, { status: 409 });
    } else if (operation === 'save-introduction-feedback') {
      if (session.user.role !== 'parent' || data.role !== 'parent') return NextResponse.json({ error: 'Parent feedback is required' }, { status: 403 });
      const suggestedFeedback = data.suggestedFeedback || [];
      const comment = data.comment || '';
      if (!suggestedFeedback.length && !comment) return NextResponse.json({ error: 'Choose feedback or add a comment' }, { status: 400 });
      filter[`${matchPath}.completedIntroductions`] = teacherId;
      filter[`${matchPath}.teachers.id`] = teacherId;
      update = { $set: { [`${matchPath}.introductionFeedback.${teacherId}`]: { suggestedFeedback, ...(comment ? { comment } : {}), updatedAt: new Date() } } };
    } else {
      const coordinatedCompletion = match.coordinatedIntroduction?.status === 'completed';
      if (coordinatedCompletion ? !match.completedIntroductions.includes(teacherId) : !match.teachers.every(teacher => match.completedIntroductions.includes(teacher.id))) return NextResponse.json({ error: 'Complete your selected introductions before choosing your teacher' }, { status: 409 });
      const teacher: any = await User.findOne({ ...approvedTeacherFilter, _id: teacherId }).select(teacherFields).lean();
      if (!teacher || !teachesSubject(teacher, subject)) return NextResponse.json({ error: 'This teacher is no longer available for matching. Contact the team.' }, { status: 409 });
      filter[`${matchPath}.completedIntroductions`] = coordinatedCompletion ? teacherId : { $all: match.teachers.map(teacher => teacher.id) };
      update = { $set: { [`${matchPath}.selectedTeacherId`]: teacherId, [`${matchPath}.selectedAt`]: new Date() } };
    }
  }
  const result = await User.updateOne(filter, update);
  if (!result.matchedCount) return NextResponse.json({ error: 'This request has changed. Refresh before continuing.' }, { status: 409 });
  return NextResponse.json({ success: true });
}
export const POST = (req: Request) => mutate(req, true);
export const PATCH = (req: Request) => mutate(req, false);
