import mongoose, { Schema } from 'mongoose';

const paymentSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
  amount: {
    value: { type: Number, required: true },
    currency: { type: String, default: 'NGN' }
  },
  type: {
    type: String,
    enum: ['session', 'subscription', 'course', 'materials'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'wallet'],
    required: true
  },
  reference: { type: String, unique: true },
  metadata: {
    transactionId: String,
    provider: String,
    providerReference: String
  },
  refund: {
    amount: Number,
    reason: String,
    date: Date,
    status: String
  }
}, {
  timestamps: true
});

paymentSchema.index({ studentId: 1, teacherId: 1 });
paymentSchema.index({ sessionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ reference: 1 }, { unique: true });

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
