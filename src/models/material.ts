import mongoose, { Schema } from 'mongoose';

const materialSchema = new Schema({
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  type: {
    type: String,
    enum: ['document', 'video', 'link', 'assignment'],
    required: true
  },
  subject: {
    area: String,    // e.g. 'Math', 'Science'
    name: String,    // e.g. 'Algebra', 'Geometry'
    level: String    // e.g. 'Beginner', 'Intermediate'
  },
  url: String,
  accessibility: {
    type: String,
    enum: ['public', 'private', 'session'],
    default: 'private'
  },
  sessions: [{ type: Schema.Types.ObjectId, ref: 'Session' }],
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  views: [{
    studentId: { type: Schema.Types.ObjectId, ref: 'User' },
    viewedAt: Date
  }]
}, {
  timestamps: true
});

materialSchema.index({ teacherId: 1 });
materialSchema.index({ 'subject.area': 1 });
materialSchema.index({ accessibility: 1 });

export const Material = mongoose.models.Material || mongoose.model('Material', materialSchema);
