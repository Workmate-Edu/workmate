import { User } from '@/models/user';
import { createNotification } from '@/lib/notification-service';
import sendEmail from '@/lib/email';

export async function notifyActiveAdmins({ type, title, message, data }: { type: 'teacher_review' | 'introduction_request'; title: string; message: string; data?: Record<string, unknown> }) {
  try {
    const admins: any[] = await User.find({ role: 'admin', isActive: true, emailVerified: true }).select('_id').lean();
    const results = await Promise.allSettled(admins.map(admin => createNotification({ userId: String(admin._id), type, title, message, priority: 'high', data })));
    results.forEach((result, index) => {
      if (result.status === 'rejected') console.error(`[ADMIN_NOTIFICATION_ERROR] Notification ${index + 1} failed`, result.reason);
    });
  } catch (error) {
    console.error('[ADMIN_NOTIFICATION_ERROR] Unable to notify admins', error);
  }
}

export async function notifyAdminsOfTeacherReview(teacher: { id: string; name: string; email: string }, event: 'application' | 'profile_update') {
  try {
    const admins: any[] = await User.find({ role: 'admin', isActive: true, emailVerified: true }).select('_id email').lean();
    const message = event === 'application'
      ? `${teacher.name} submitted a teacher application for review.`
      : `${teacher.name} updated their teacher profile and needs re-verification.`;
    const adminDashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard/admin/teachers`;
    const deliveries = admins.flatMap(admin => [
      createNotification({ userId: String(admin._id), type: 'teacher_review', title: 'Teacher review needed', message, priority: 'high', data: { teacherId: teacher.id, actionUrl: '/dashboard/admin/teachers' } }),
      sendEmail({
        to: admin.email,
        subject: `Teacher review needed - ${teacher.name}`,
        template: 'teacher-profile-review',
        replacements: { teacherName: teacher.name, teacherEmail: teacher.email, adminDashboardUrl },
      }),
    ]);
    const results = await Promise.allSettled(deliveries);
    results.forEach((result, index) => {
      if (result.status === 'rejected') console.error(`[ADMIN_TEACHER_REVIEW_NOTIFICATION_ERROR] Delivery ${index + 1} failed`, result.reason);
    });
  } catch (error) {
    console.error('[ADMIN_TEACHER_REVIEW_NOTIFICATION_ERROR] Unable to notify admins', error);
  }
}
