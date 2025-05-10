import mongoose from 'mongoose';

const childAssessmentSchema = new mongoose.Schema({
  // Add your schema fields here
  title: String,
  description: String,
  // ... other fields
}, {
  timestamps: true
});

export const ChildAssessment = mongoose.models.ChildAssessment || mongoose.model('ChildAssessment', childAssessmentSchema);
