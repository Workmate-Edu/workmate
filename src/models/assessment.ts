import mongoose from 'mongoose'

const fileAttachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true }
}, { _id: false }) // 👈 prevents nested _id clutter

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
  options: {
    type: [String],
    default: []
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed
  },
  attachment: {
    type: fileAttachmentSchema,
    required: function() {
      return this.type === 'file'
    }
  }
})


// Submission schema
const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionId: { type: String, required: true },
    answer: String,
    attachments: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      size: { type: Number, required: true },
      url: { type: String, required: true },
      publicId: { type: String, required: true }
    }]
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  }
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
