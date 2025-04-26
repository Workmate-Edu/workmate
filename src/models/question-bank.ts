import mongoose, { Schema } from 'mongoose';

const questionBankSchema = new Schema({
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  subject: {
    area: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'written', 'true_false', 'initial_assessment'],
    required: true
  },
  question: {
    text: String,
    media: [{
      type: String,
      url: String
    }],
    format: {
      type: String,
      enum: ['multiple_choice', 'written', 'true_false'],
      required: true
    }
  },
  options: [{
    text: String,
    isCorrect: Boolean,
    explanation: String
  }],
  metadata: {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    tags: [String],
    skillsTested: [String],
    estimatedTime: Number // in minutes
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    feedback: String
  },
  usage: {
    timesUsed: { type: Number, default: 0 },
    lastUsed: Date,
    assessments: [{
      assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment' },
      usedAt: Date,
      successRate: Number
    }]
  }
}, {
  timestamps: true
});

// Indexes
questionBankSchema.index({ 'subject.area': 1, 'subject.name': 1 });
questionBankSchema.index({ level: 1 });
questionBankSchema.index({ type: 1 });
questionBankSchema.index({ createdBy: 1 });
questionBankSchema.index({ 'verification.status': 1 });
questionBankSchema.index({ 'metadata.tags': 1 });

export const QuestionBank = mongoose.models.QuestionBank || 
  mongoose.model('QuestionBank', questionBankSchema);
