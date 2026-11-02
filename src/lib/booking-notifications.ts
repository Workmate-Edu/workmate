import type { ClientSession } from 'mongoose';
import { Notification } from '@/models/notification';

// Persist with the booking transaction: failed bookings must never leave a
// confirmation behind. This only creates in-app notices; it sends no email.
export async function recordBookingNotifications(slot: {
  ownerId: unknown; teacherId: unknown; learnerName: string; subject: string;
  kind?: string; startTime: Date | string;
}, action: 'booked' | 'rescheduled' | 'cancelled' | 'completed', transaction: ClientSession) {
  const lesson = slot.kind === 'free-lesson' ? 'Free 60-minute class' : '15-minute introduction';
  const when = new Date(slot.startTime).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const type = action === 'booked' ? 'session_created' : action === 'cancelled' ? 'session_cancelled' : 'session_updated';
  await Notification.create([
    { userId: slot.ownerId, type, title: `${lesson} ${action}`, message: `${slot.learnerName}: ${slot.subject}, ${when}. Open Your Learning Plan to view details and next steps.`, delivery: { inApp: true, email: false, push: false } },
    { userId: slot.teacherId, type, title: `${lesson} ${action}`, message: `${slot.learnerName}: ${slot.subject}, ${when}. Open Introductions to view booking details.`, delivery: { inApp: true, email: false, push: false } },
  ], { session: transaction });
}
