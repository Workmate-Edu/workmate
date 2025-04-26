import mongoose, { Schema } from 'mongoose';

const courseSchema = new Schema({
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  
  courseType: {
    type: String,
    enum: ['regular', 'intensive', 'structured', 'flexible'],
    required: true
  },
  
  subject: {
    area: { type: String, required: true }, // e.g. 'Math', 'Science', 'Languages'
    name: { type: String, required: true }, // e.g. 'Algebra', 'Geometry', 'Calculus'
    level: { type: String, required: true }, // e.g. 'Beginner', 'Intermediate', 'Advanced'
    category: { type: String }, // Optional subcategory
  },

  structure: {
    duration: {
      weeks: Number,
      totalHours: Number,
      sessionsPerWeek: Number
    },
    format: {
      type: String,
      enum: ['weekly', 'intensive', 'self-paced', 'hybrid'],
      default: 'weekly'
    },
    sessionTypes: [{
      type: {
        type: String,
        enum: ['theory', 'practice', 'lab', 'assessment', 'discussion']
      },
      duration: Number, // minutes
      frequency: String // e.g., "weekly", "bi-weekly"
    }]
  },

  curriculum: [{
    week: Number,
    theme: String,
    sessions: [{
      type: String,
      topic: String,
      objectives: [String],
      activities: [String],
      resources: [{
        type: { type: String, enum: ['required', 'optional'] },
        materialId: { type: Schema.Types.ObjectId, ref: 'Material' }
      }]
    }]
  }],

  schedule: {
    startDate: Date,
    endDate: Date,
    sessions: [{
      day: String,
      time: {
        start: String,
        end: String
      }
    }]
  },
  pricing: {
    amount: Number,
    currency: { type: String, default: 'NGN' },
    type: {
      type: String,
      enum: ['per_session', 'full_course'],
      default: 'full_course'
    }
  },
  enrollment: {
    maxStudents: Number,
    currentCount: { type: Number, default: 0 },
    waitlist: [{
      studentId: { type: Schema.Types.ObjectId, ref: 'User' },
      requestDate: Date
    }],
    students: [{
      studentId: { type: Schema.Types.ObjectId, ref: 'User' },
      enrollmentDate: Date,
      status: {
        type: String,
        enum: ['active', 'completed', 'dropped'],
        default: 'active'
      },
      progress: {
        completed: Number,
        lastActivity: Date
      }
    }]
  },
  content: [{
    title: String,
    type: {
      type: String,
      enum: ['lesson', 'assignment', 'quiz', 'resource']
    },
    materials: [{ type: Schema.Types.ObjectId, ref: 'Material' }],
    assessment: { type: Schema.Types.ObjectId, ref: 'Assessment' }
  }],
  learningOutcomes: [{
    category: String,
    skills: [String],
    assessmentMethods: [String]
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  }
}, {
  timestamps: true
});

courseSchema.index({ teacherId: 1 });
courseSchema.index({ 'subject.area': 1, 'subject.name': 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ 'enrollment.students.studentId': 1 });
courseSchema.index({ 'subject.category': 1 });
courseSchema.index({ 'structure.format': 1 });
courseSchema.index({ courseType: 1 });

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
