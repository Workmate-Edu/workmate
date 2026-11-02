import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { CoordinatedIntroductionRequest } from '@/models/coordinated-introduction-request';
import { parentOnboardingSchema } from '@/lib/parent-onboarding';
import { parentalVerificationAllowsLearning } from '@/lib/legal-consent';

const completionSchema = z.object({
  participatingTeacherIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1).max(3)
    .refine(ids => new Set(ids).size === ids.length, 'Choose each participating teacher once'),
});

export async function PATCH(req: Request, { params }: { params: { requestId: string } }) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== 'admin') return NextResponse.json({ error: 'Admin account required' }, { status: 403 });
  const { requestId } = params;
  if (!mongoose.isValidObjectId(requestId)) return NextResponse.json({ error: 'Introduction request not found' }, { status: 404 });
  const parsed = completionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Choose one or more participating shortlisted teachers' }, { status: 400 });

  await connectDB();
  const admin: any = await User.findOne({ _id: session.user.id, role: 'admin', isActive: true, emailVerified: true }).select('_id').lean();
  if (!admin) return NextResponse.json({ error: 'Active verified admin account required' }, { status: 403 });
  const request: any = await CoordinatedIntroductionRequest.findOne({ _id: requestId, status: 'confirmed' }).lean();
  if (!request) return NextResponse.json({ error: 'Only confirmed introductions can be marked complete' }, { status: 409 });
  const participatingTeacherIds = parsed.data.participatingTeacherIds.map(id => id.toLowerCase());
  const shortlistedTeacherIds = request.teacherIds.map((teacherId: any) => String(teacherId));
  if (participatingTeacherIds.some(teacherId => !shortlistedTeacherIds.includes(teacherId))) {
    return NextResponse.json({ error: 'Participating teachers must be from this introduction shortlist' }, { status: 400 });
  }

  const parent: any = await User.findOne({ _id: request.parentId, role: 'parent', emailVerified: true })
    .select('role emailVerified isActive legalAcknowledgements safeguarding parentProfile.onboarding').lean();
  if (!parent || !parentalVerificationAllowsLearning(parent)) return NextResponse.json({ error: 'The parent account is not eligible for completion' }, { status: 409 });
  const intake = parent.parentProfile?.onboarding;
  const onboarding = parentOnboardingSchema.safeParse(intake);
  const learner = onboarding.success ? onboarding.data.learners[request.learnerIndex] : undefined;
  const storedSubjectIndex = Number.isInteger(request.subjectIndex) ? request.subjectIndex : learner?.subjects.indexOf(request.subject);
  const subjectIndex = typeof storedSubjectIndex === 'number' ? storedSubjectIndex : -1;
  const key = `${request.learnerIndex}_${subjectIndex}`;
  const match = intake?.matches?.[key];
  if (!learner || learner.learnerId !== request.learnerId || learner.subjects[subjectIndex] !== request.subject || !match || String(match.coordinatedIntroduction?.requestId) !== String(request._id)) {
    return NextResponse.json({ error: 'The learning plan no longer matches this introduction request' }, { status: 409 });
  }
  if (participatingTeacherIds.some(teacherId => !match.teachers.some((teacher: any) => teacher.id === teacherId))) {
    return NextResponse.json({ error: 'The learning plan shortlist changed before completion' }, { status: 409 });
  }

  const completedAt = new Date();
  const matchPath = `parentProfile.onboarding.matches.${key}.coordinatedIntroduction`;
  const transaction = await mongoose.startSession();
  try {
    await transaction.withTransaction(async () => {
      const updatedRequest = await CoordinatedIntroductionRequest.updateOne({ _id: request._id, status: 'confirmed' }, { $set: {
        status: 'completed',
        completion: { participatingTeacherIds, completedBy: admin._id, completedAt },
      } }, { session: transaction });
      if (!updatedRequest.matchedCount) throw new Error('This introduction request has already been updated');
      const updatedPlan = await User.updateOne({
        _id: parent._id,
        role: 'parent',
        emailVerified: true,
        [`${matchPath}.requestId`]: String(request._id),
        [`${matchPath}.status`]: 'confirmed',
      }, {
        $set: { [`${matchPath}.status`]: 'completed', [`${matchPath}.completedAt`]: completedAt },
        $addToSet: { [`parentProfile.onboarding.matches.${key}.completedIntroductions`]: { $each: participatingTeacherIds } },
      }, { session: transaction });
      if (!updatedPlan.matchedCount) throw new Error('The learning plan changed before completion');
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to complete this introduction request' }, { status: 409 });
  } finally {
    await transaction.endSession();
  }

  return NextResponse.json({ success: true, reference: request.reference, status: 'completed' });
}
