import mongoose, { Schema } from 'mongoose';

const subscriptionSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['monthly', 'term', 'annual'],
    required: true
  },
  subjects: [{
    name: String,    // e.g. 'Algebra', 'Geometry'
    area: String,    // e.g. 'Math', 'Science'
    sessionsPerWeek: Number,
    totalSessions: Number,
    completedSessions: { type: Number, default: 0 }
  }],
  schedule: {
    startDate: Date,
    endDate: Date,
    recurringDays: [{
      day: String,
      time: String
    }]
  },
  payment: {
    amount: Number,
    currency: { type: String, default: 'NGN' },
    interval: String,
    status: {
      type: String,
      enum: ['active', 'past_due', 'cancelled', 'completed'],
      default: 'active'
    },
    history: [{
      paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
      date: Date,
      amount: Number
    }]
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'completed'],
    default: 'active'
  },
  learningPath: {
    initialAssessmentId: { type: Schema.Types.ObjectId, ref: 'InitialAssessment' },
    goals: [{
      subject: String,
      initialLevel: String,
      targetLevel: String,
      progress: {
        currentLevel: String,
        milestones: [{
          description: String,
          achievedAt: Date,
          verified: Boolean
        }],
        completionPercentage: Number
      },
      status: {
        type: String,
        enum: ['in_progress', 'achieved', 'revised'],
        default: 'in_progress'
      }
    }],
    monthlyReviews: [{
      date: Date,
      progressSummary: String,
      adjustments: [{
        goal: String,
        reason: String,
        newTarget: String
      }],
      nextSteps: [String]
    }]
  },
  sessions: {
    frequency: {
      perWeek: Number,
      flexible: Boolean,
      preferredDays: [{
        day: String,
        slots: [String]
      }]
    },
    upcoming: [{
      sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
      date: Date,
      goals: [String]
    }],
    completed: {
      count: { type: Number, default: 0 },
      lastSession: Date
    }
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ studentId: 1, teacherId: 1 });
subscriptionSchema.index({ 'payment.status': 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ 'learningPath.initialAssessmentId': 1 });
subscriptionSchema.index({ 'learningPath.goals.status': 1 });
