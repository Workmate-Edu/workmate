import mongoose, { Schema } from 'mongoose';
import { InitialAssessmentStatus } from '@/types/assessment';

const childAssessmentSchema = new Schema({
  type: {
    type: String,
    enum: ['parent_questionnaire'],
    required: true
  },
  childId: {
    type: Schema.Types.ObjectId,
    ref: 'Child',
    required: true,
    index: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  responses: [{
    category: String,
    questions: [{
      questionId: String,
      question: String,
      answer: Schema.Types.Mixed,
      notes: String
    }]
  }],
  learningStyle: {
    visual: Number,
    auditory: Number,
    kinesthetic: Number,
    readingWriting: Number
  },
  familyBackground: {
    primaryLanguage: String,
    otherLanguages: [String],
    learningEnvironment: String
  },
  preferredSubjects: [{
    area: String,
    subjects: [String]
  }],
  challengeAreas: [String],
  goals: [String],
  additionalNotes: String,
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed'],
    default: 'pending'
  },
  adminReview: {
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    notes: String,
    recommendedTeachers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
childAssessmentSchema.index({ childId: 1, parentId: 1 });
childAssessmentSchema.index({ status: 1 });
childAssessmentSchema.index({ 'adminReview.reviewedBy': 1 });

export const ChildAssessment = mongoose.models.ChildAssessment || 
  mongoose.model('ChildAssessment', childAssessmentSchema);
