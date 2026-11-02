import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  reference: { type: String, required: true, unique: true, index: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  learnerId: { type: String, required: true },
  learnerIndex: { type: Number, required: true, min: 0 },
  subjectIndex: { type: Number, required: true, min: 0 },
  subject: { type: String, required: true },
  teacherIds: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  requestedStart: { type: Date, required: true },
  requestedEnd: { type: Date, required: true },
  requestedSlots: [{ start: { type: Date, required: true }, end: { type: Date, required: true } }],
  requestedTimezone: { type: String, required: true, maxlength: 80 },
  status: { type: String, enum: ['requested', 'confirmed', 'completed', 'cancelled'], default: 'requested', required: true },
  confirmation: {
    meetingLink: { type: String, maxlength: 2000 },
    start: Date,
    end: Date,
    confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    confirmedAt: Date,
  },
  completion: {
    participatingTeacherIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    completedAt: Date,
  },
  notification: {
    status: { type: String, enum: ['pending', 'sent', 'failed', 'not-configured'], default: 'pending', required: true },
    sentAt: Date,
    failures: [{ type: String }],
  },
  confirmationNotification: {
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    sentAt: Date,
    failures: [{ type: String }],
  },
}, { timestamps: true });

schema.index({ parentId: 1, learnerId: 1, subject: 1 }, { unique: true });

export const CoordinatedIntroductionRequest = mongoose.models.CoordinatedIntroductionRequest
  || mongoose.model('CoordinatedIntroductionRequest', schema);
