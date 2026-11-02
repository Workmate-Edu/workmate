import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'session_reminder',
      'session_created',
      'session_updated',
      'session_cancelled',
      'payment_success',
      'payment_failed',
      'new_message',
      'assessment_graded',
      'course_update',
      'system_alert',
      'teacher_assigned',
      'teacher_unassigned',
      'subject_assigned',
      'teacher_review',
      'introduction_request',
    ],
    required: true
  },
  title: String,
  message: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  data: {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    actionUrl: String,
  },
  status: {
    read: { type: Boolean, default: false },
    readAt: Date,
    actioned: { type: Boolean, default: false }
  },
  delivery: {
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true }
  },
  expiresAt: Date
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ 'status.read': 1 });
notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ expiresAt: 1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
