import mongoose, { Schema } from 'mongoose';

const lineSchema = new Schema({
  subject: { type: String, required: true },
  childId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  numberOfStudents: { type: Number, required: true },
  hoursPerSession: { type: Number, required: true },
  sessionsPerWeek: { type: Number, required: true },
}, { _id: false });

const schema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'User', immutable: true },
  reference: { type: String, required: true, unique: true, immutable: true },
  priceVersion: { type: String, required: true, immutable: true },
  amountCents: { type: Number, required: true, min: 1, immutable: true, validate: Number.isSafeInteger },
  currency: { type: String, required: true, enum: ['USD'], immutable: true },
  plan: { type: String, required: true, enum: ['weekly', 'monthly', 'quarterly'], immutable: true },
  durationDays: { type: Number, required: true, immutable: true },
  subjects: { type: [lineSchema], required: true, immutable: true },
  state: { type: String, enum: ['pending', 'fulfilled', 'needs-review'], default: 'pending', required: true },
  providerTransactionId: { type: String },
  fulfilledAt: Date,
}, { timestamps: true });
schema.index({ providerTransactionId: 1 }, { unique: true, partialFilterExpression: { providerTransactionId: { $type: 'string' } } });

export const PaymentOrder = mongoose.models.PaymentOrder || mongoose.model('PaymentOrder', schema);
