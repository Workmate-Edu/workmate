import mongoose from 'mongoose';

// Question schema
const questionSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['multiple_choice', 'text', 'file'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [String],
  points: {
    type: Number,
    required: true
  }
});

// Submission schema
const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionId: String,
    answer: mongoose.Schema.Types.Mixed,
    grade: Number
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedAt: Date,
  totalPoints: Number,
  feedback: String
});

// TeacherAssessment schema
const teacherAssessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['quiz', 'assignment', 'file_upload'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for better query performance
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'submitted', 'graded'],
    default: 'draft'
  },
  dueDate: {
    type: Date,
    required: true
  },
  questions: [questionSchema],
  submissions: [submissionSchema],
  points: {
    type: Number,
    default: 0
  },
  attachment: {
    type: String // URL to attachment if any
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  gradedAt: Date,
  feedback: String
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // Enable virtuals in JSON
  toObject: { virtuals: true } // Enable virtuals in Object
});

// Add transform to always include studentId
teacherAssessmentSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    ret.studentId = ret.studentId.toString()
    delete ret._id
    delete ret.__v
    return ret
  }
})

// Add an index for faster queries
teacherAssessmentSchema.index({ studentId: 1, status: 1 });

const TeacherAssessment = mongoose.models.TeacherAssessment || mongoose.model('TeacherAssessment', teacherAssessmentSchema);

export { TeacherAssessment, TeacherAssessment as Assessment };
