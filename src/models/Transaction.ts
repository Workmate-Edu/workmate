import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  paymentMethod: { type: String },
  // Update: meta now supports per-subject subscription periods
  meta: { 
    type: Object 
    // Optionally, you can add a comment:
    // // Example: { subjects: [{ subject, childId, startDate, endDate, ... }], ... }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export const Transaction = mongoose.models.Transaction || 
  mongoose.model('Transaction', transactionSchema)
