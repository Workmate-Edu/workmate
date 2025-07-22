import mongoose, { Schema } from 'mongoose';

const recurrenceSchema = new Schema({
  isRecurring: { type: Boolean, default: false },
  pattern: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'multiple-days', 'bi-weekly'],
    default: 'none'
  },
  daysOfWeek: [Number], // Store days as numbers (0-6)
  startDate: Date,
  endDate: Date,
  totalSessions: Number
}, { _id: false });  // Prevent MongoDB from creating _id for subdocuments

const teachingSessionSchema = new Schema({
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: {
    name: { type: String, required: true },
    area: { type: String, required: true }
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  meetingLink: { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled', 'teacher-completed'],
    default: 'scheduled'
  },
  teacherCompletedAt: { type: Date },
  adminCompletedAt: { type: Date },
  recurrence: { 
    type: recurrenceSchema,
    required: false
  }
}, {
  timestamps: true
});

export const TeachingSession = mongoose.models.TeachingSession || 
  mongoose.model('TeachingSession', teachingSessionSchema);
