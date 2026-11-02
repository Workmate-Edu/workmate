import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { CoordinatedIntroductionRequest } from '@/models/coordinated-introduction-request';
import { CoordinatedIntroductionRequests } from '@/components/admin/coordinated-introduction-requests';

export default async function IntroductionRequestsPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect('/sign-in');
  if (session.user.role !== 'admin') redirect('/dashboard');
  await connectDB();
  const admin = await User.findOne({ _id: session.user.id, role: 'admin', isActive: true, emailVerified: true }).select('_id').lean();
  if (!admin) redirect('/dashboard');

  const requests: any[] = await CoordinatedIntroductionRequest.find({ status: { $in: ['requested', 'confirmed'] } })
    .sort({ requestedStart: 1 }).limit(100).lean();
  requests.sort((a, b) => Number(a.status !== 'requested') - Number(b.status !== 'requested'));
  const parentIds = [...new Set(requests.map(request => String(request.parentId)))];
  const teacherIds = [...new Set(requests.flatMap(request => request.teacherIds.map((teacherId: any) => String(teacherId))))];
  const [parents, teachers] = await Promise.all([
    User.find({ _id: { $in: parentIds }, role: 'parent' }).select('name email').lean(),
    User.find({ _id: { $in: teacherIds }, role: 'teacher' }).select('name').lean(),
  ]);
  const parentById = new Map(parents.map((parent: any) => [String(parent._id), parent]));
  const teacherById = new Map(teachers.map((teacher: any) => [String(teacher._id), teacher]));
  const visibleRequests = requests.flatMap(request => {
    const parent = parentById.get(String(request.parentId));
    const selectedTeachers = request.teacherIds.map((teacherId: any) => {
      const id = String(teacherId);
      const teacher = teacherById.get(id);
      return teacher ? { id, name: teacher.name } : undefined;
    }).filter(Boolean);
    if (!parent || selectedTeachers.length !== request.teacherIds.length) return [];
    return [{
      id: String(request._id), reference: request.reference, parent: { name: parent.name || 'Parent', email: parent.email }, subject: request.subject,
      teachers: selectedTeachers, requestedStart: new Date(request.requestedStart).toISOString(), requestedSlots: (request.requestedSlots?.length ? request.requestedSlots : [{ start: request.requestedStart }]).map((slot: any) => new Date(slot.start).toISOString()), requestedEnd: new Date(request.requestedEnd).toISOString(), requestedTimezone: request.requestedTimezone,
      status: request.status, meetingLink: request.confirmation?.meetingLink, confirmedAt: request.confirmation?.confirmedAt ? new Date(request.confirmation.confirmedAt).toISOString() : undefined,
      notifications: {
        adminRequest: request.notification?.status || 'pending',
        confirmation: request.confirmationNotification?.status || (request.status === 'confirmed' ? 'pending' : undefined),
        failures: [...(request.notification?.failures || []), ...(request.confirmationNotification?.failures || [])],
      },
    }];
  });

  return <div className="mx-auto max-w-5xl space-y-6 p-6">
    <div><h1 className="text-3xl font-bold">Coordinated introduction requests</h1><p className="mt-1 text-muted-foreground">Confirm one 60-minute introduction per learner and subject after coordinating the shortlisted teachers. Child details are not displayed here.</p></div>
    <CoordinatedIntroductionRequests requests={visibleRequests as any} />
  </div>;
}
