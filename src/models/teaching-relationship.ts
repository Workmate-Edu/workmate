import mongoose, { Schema } from 'mongoose';

const teachingRelationshipSchema = new Schema({
  teacherId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  studentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  assessmentId: { type: Schema.Types.ObjectId, refPath: 'assessmentType' },
  assessmentType: {
    type: String,
    enum: ['InitialAssessment', 'ChildAssessment']
  },
  subjects: [{
    name: String, // e.g. 'Math', 'Physics'
    area: String, // e.g. 'stem', 'languages'
    progress: { type: Number, default: 0 },
    startDate: Date,
    lastSessionDate: Date
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  history: [{
    action: String,
    date: Date,
    by: { type: Schema.Types.ObjectId, ref: 'User' }
  }]
});

export const TeachingRelationship = mongoose.models.TeachingRelationship || 
  mongoose.model('TeachingRelationship', teachingRelationshipSchema);
