import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  category: { type: String, enum: ['support', 'safeguarding', 'safeguarding-escalation', 'privacy-access', 'privacy-correction', 'privacy-deletion'], required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['received', 'in-review', 'closed'], default: 'received' },
  restricted: { type: Boolean, default: false },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

schema.index({ createdAt: -1 });
schema.index({ category: 1, status: 1 });
export const SupportRequest = mongoose.models.SupportRequest || mongoose.model('SupportRequest', schema);
