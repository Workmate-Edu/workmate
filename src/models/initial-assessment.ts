import mongoose, { Schema } from 'mongoose';
import { InitialAssessmentStatus } from '@/types/assessment';

const initialAssessmentSchema = new Schema({
  type: {
    type: String,
    enum: ['initial'],
    required: true,
    default: 'initial'
  },
  studentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  subject: {
    name: String, // e.g. 'Math', 'Physics'
    area: String, // e.g. 'stem', 'languages'
    level: String // e.g. 'Beginner', 'Intermediate'
  },
  responses: [{
    category: String,
    questions: [{
      questionId: String,
      question: String,
      answer: Schema.Types.Mixed
    }]
  }],
  previousExperience: {
    level: String,
    duration: String,
    certificates: [String]
  },
  studyPreferences: {
    preferredTimes: [String],
    weeklyCommitment: Number,
    learningGoals: [String]
  },
  results: {
    proficiencyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    recommendedLevel: String,
    suggestedTeachers: [{
      teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
      matchScore: Number,
      availability: Boolean
    }],
    adminNotes: String
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed'],
    default: 'pending'
  },
  assignedTeacher: {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt: Date,
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }
}, {
  timestamps: true
});

// Update indexes
initialAssessmentSchema.index({ studentId: 1, 'subject.area': 1, 'subject.name': 1 });
initialAssessmentSchema.index({ status: 1 });
initialAssessmentSchema.index({ 'results.suggestedTeachers.teacherId': 1 });

export const InitialAssessment = mongoose.models.InitialAssessment || 
  mongoose.model('InitialAssessment', initialAssessmentSchema);
