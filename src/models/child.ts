import mongoose, { Schema } from 'mongoose';

const childSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  educationDetails: {
    grade: String,
    schoolName: String,
    studentId: String
  },
  subjects: [{
    name: String, // e.g. 'Algebra', 'Geometry'
    area: String, // e.g. 'Math', 'Science'
    progress: Number,
    teacher: { 
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  assessments: [{
    type: String,
    status: String,
    date: Date,
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

export const Child = mongoose.models.Child || mongoose.model('Child', childSchema);
