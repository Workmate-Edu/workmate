import mongoose, { Schema } from 'mongoose';
const schema = new Schema({
  // Fixed 15-minute UTC grid and deterministic ID give collision protection via MongoDB's built-in _id index.
  _id: { type: String, required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  meetingLink: { type: String, required: true },
  kind: { type: String, enum: ['introduction', 'free-lesson'], default: 'introduction' },
  freeClaimKey: String,
  status: { type: String, enum: ['available', 'booked', 'completed', 'cancelled'], default: 'available' },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  ownerRole: String,
  learner: Number,
  matchKey: String,
  learnerName: String,
  subject: String,
  bookedBy: String,
  bookedAt: Date,
  completedBy: String,
  completedAt: Date,
  history: [{ type: Schema.Types.Mixed }],
}, { timestamps: true });
export const IntroductionSlot = mongoose.models.IntroductionSlot || mongoose.model('IntroductionSlot', schema);
