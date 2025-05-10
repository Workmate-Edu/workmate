import mongoose, { Schema } from 'mongoose';

const initialAssessmentSchema = new Schema({
  type: { type: String, required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: Schema.Types.Mixed,
  responses: [Schema.Types.Mixed],
  previousExperience: Schema.Types.Mixed,
  studyPreferences: Schema.Types.Mixed,
  results: Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export const InitialAssessment = mongoose.models.InitialAssessment || 
  mongoose.model('InitialAssessment', initialAssessmentSchema);
