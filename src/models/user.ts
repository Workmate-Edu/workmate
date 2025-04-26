import mongoose, { Schema } from 'mongoose';
import { IUser } from '@/types/user';

const teacherProfileSchema = new Schema({
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  subjects: [{
    area: String,
    subjects: [String]
  }],
  rating: {
    type: Number,
    default: 0
  },
  assignedStudents: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
    document: String // URL to credential document
  }],
  adminVerified: {
    type: Boolean,
    default: false
  },
  adminVerificationDate: Date,
  verificationHistory: [{
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected']
    },
    date: Date,
    adminId: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    feedback: String,
    canReapplyAfter: Date
  }],
  reapplicationCount: {
    type: Number,
    default: 0
  },
  availability: [{
    day: String,
    slots: [{
      startTime: String,
      endTime: String
    }]
  }],
  reviews: [{
    student: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
    helpful: { type: Number, default: 0 },
    parentEndorsed: Boolean
  }],
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  parents: [{
    parentId: { type: Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending'
    },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  }],
  groupSessions: [{
    name: String,
    description: String,
    subject: {
      area: String,
      name: String
    },
    schedule: {
      startDate: Date,
      endDate: Date,
      recurringDays: [String],
      time: {
        start: String,
        end: String
      }
    },
    maxStudents: Number,
    enrolledStudents: [{
      studentId: { type: Schema.Types.ObjectId, ref: 'User' },
      joinedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
      }
    }],
    level: String,
    price: Number,
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    materials: [{
      title: String,
      type: {
        type: String,
        enum: ['document', 'video', 'link']
      },
      url: String
    }]
  }]
});

const progressSchema = new Schema({
  understanding: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  participation: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  homework: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  notes: String,
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

const studentProfileSchema = new Schema({
  registeredAs: {
    type: String,
    enum: ['independent', 'child'],
    default: 'independent'
  },
  parent: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: function() {
      return this.role === 'student' && this.registeredAs === 'child';
    }
  },
  grade: String,
  subjects: [{
    name: String, // e.g. 'Algebra', 'Geometry'
    area: String, // e.g. 'Math', 'Science'
    progress: {
      type: Number,
      default: 0
    }
  }],
  assignedTeachers: [{
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    subjects: [{
      name: String,
      area: String
    }]
  }],
  learningPreferences: {
    preferredLanguage: String,
    studySchedule: String,
    learningStyle: [String]
  },
  achievements: [{
    type: { type: String },
    name: String,
    date: Date,
    description: String
  }],
  teachers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  assessments: [{
    type: {
      type: String,
      enum: ['initial', 'parent_questionnaire'],
      required: true
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      refPath: 'studentProfile.assessments.assessmentModel'
    },
    assessmentModel: {
      type: String,
      required: true,
      enum: ['InitialAssessment', 'ChildAssessment']
    },
    status: {
      type: String,
      enum: ['pending',  'assigned', ],
      default: 'pending'
    },
    submittedAt: Date
  }],
  courses: [{
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    courseId: String,
    startDate: Date,
    status: String
  }]
});

const parentProfileSchema = new Schema({
  phone: String,
  interestedInLearning: Boolean,
  educationLevel: String,
  subjects: [String],
  // Update children to reference User model instead of Child model
  children: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  assignedTeachers: [{
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: Date
  }]
});

const userSchema = new Schema<IUser>(
  {
    // Base User Fields
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      required: true, // Make username required
      sparse: false, // Change to false since it's required
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^[a-zA-Z0-9_-]{3,20}$/.test(v); // Username between 3-20 chars
        },
        message: 'Username must be 3-20 characters and can only contain letters, numbers, underscores and hyphens'
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't include password by default
      minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student', 'parent'],
      required: true, // Make required
      default: 'student',
    },
    gender: {
      type: String,
      required: true,
    },
    // Add phone to base user fields
    phone: {
      type: String,
      trim: true,
    },
    // Authentication & Verification
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false
    },
    verificationTokenExpiry: {
      type: Date,
      select: true, // Make it selectable
    },
    lastVerificationSent: {
      type: Date,
      select: true,
    },
    resetPasswordToken: {
      type: String,
      select: true // Change to true to make it queryable
    },
    resetPasswordTokenExpiry: {
      type: Date,
      select: true // Change to true to make it queryable
    },
    lastLogin: Date,

    // Profile & Preferences
    image: String,
    bio: String,
    language: {
      type: String,
      default: 'en',
    },
    timezone: String,

    // Role-specific Fields
    // Teacher Fields
    teacherProfile: {
      type: teacherProfileSchema,
      required: false
    },

    // Student Fields
    studentProfile: {
      type: studentProfileSchema,
      required: false
    },

    // Parent Fields
    parentProfile: {
      type: parentProfileSchema,
      required: false
    },

    // Add these fields to track relationships
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // System Fields
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        mobile: { type: Boolean, default: true },
        type: {
          lessons: { type: Boolean, default: true },
          progress: { type: Boolean, default: true },
          system: { type: Boolean, default: true }
        }
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      accessibility: {
        fontSize: { type: String, default: 'medium' },
        contrast: { type: String, default: 'normal' },
        reduceMotion: { type: Boolean, default: false }
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;  // Changed from passwordHash to password
        delete ret.verificationToken;
        delete ret.verificationTokenExpiry;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordTokenExpiry;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 }, { sparse: true });
userSchema.index({ 'teacherProfile.subjects.name': 1 });
userSchema.index({ 'studentProfile.subjects.name': 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'teacherProfile.students.studentId': 1 });
userSchema.index({ 'teacherProfile.parents.parentId': 1 });
userSchema.index({ 'studentProfile.teachers.teacherId': 1 });
userSchema.index({ 'parentProfile.childrenProgress.childId': 1 });
userSchema.index({ 'parentProfile.notifications.childId': 1 });
userSchema.index({ 'parentProfile.notifications.read': 1 });
userSchema.index({ 'teacherProfile.reviews.student': 1 });
userSchema.index({ 'teacherProfile.students.performanceReviews.date': 1 });
userSchema.index({ 'studentProfile.teachers.reviews.createdAt': 1 });
userSchema.index({ 'teacherProfile.groupSessions.enrolledStudents.studentId': 1 });
userSchema.index({ 'teacherProfile.groupSessions.status': 1 });
userSchema.index({ 'parentProfile.learningProfile.teachers.teacherId': 1 });
userSchema.index({ 'parentProfile.familyLearning.childId': 1 });

// Create or retrieve the User model
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export type UserModel = typeof User;
