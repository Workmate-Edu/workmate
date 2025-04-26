import mongoose, { Schema } from 'mongoose';

const sessionSchema = new Schema({
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['one-on-one', 'group'],
    required: true
  },
  subject: {
    area: String,    // e.g. 'Math', 'Science'
    name: String,    // e.g. 'Algebra', 'Geometry'
    level: String    // e.g. 'Beginner', 'Intermediate'
  },
  schedule: {
    startTime: Date,
    endTime: Date,
    isRecurring: Boolean,
    recurringDays: [String],
    timeSlot: {
      start: String,
      end: String
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  participants: [{
    studentId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'pending'
    },
    attendance: {
      present: Boolean,
      note: String
    }
  }],
  materials: [{
    title: String,
    type: String,
    url: String,
    uploadedAt: Date
  }],
  notes: {
    teacherNotes: String,
    studentNotes: [{
      studentId: { type: Schema.Types.ObjectId, ref: 'User' },
      content: String
    }]
  },
  familyGroup: {
    parentId: { type: Schema.Types.ObjectId, ref: 'User' },
    children: [{
      studentId: { type: Schema.Types.ObjectId, ref: 'User' },
      attendance: {
        present: Boolean,
        note: String
      }
    }]
  },
  sessionType: {
    type: String,
    enum: ['individual', 'group', 'family'],
    required: true
  }
}, {
  timestamps: true
});

// Indexes
sessionSchema.index({ teacherId: 1 });
sessionSchema.index({ 'participants.studentId': 1 });
sessionSchema.index({ 'schedule.startTime': 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ 'familyGroup.parentId': 1 });

export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
