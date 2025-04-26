import { Schema, model, models } from 'mongoose';

const studentProgressSchema = new Schema({
  studentId: String,
  teacherId: String,
  subjectId: String,
  scores: {
    understanding: Number,
    participation: Number,
    homework: Number,
    notes: String
  },
  weekNumber: Number,
  averageScore: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const StudentProgress = models.StudentProgress || model('StudentProgress', studentProgressSchema);
