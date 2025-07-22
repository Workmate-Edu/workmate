import mongoose, { Schema } from 'mongoose';
import { IUser } from '@/types/user';

// -----------------------------
// Teacher-specific profile
// -----------------------------
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
  }],
  accountDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    accountName: { type: String },
    bvn: { type: String }
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
});

// -----------------------------
// Progress tracking schema
// -----------------------------
const progressSchema = new Schema({
  understanding:  { type: Number, required: true, min: 1, max: 10 },
  participation: { type: Number, required: true, min: 1, max: 10 },
  homework:      { type: Number, required: true, min: 1, max: 10 },
  notes:         String,
  teacherId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt:     { type: Date, default: Date.now }
});

// -----------------------------
// Student-specific profile
// -----------------------------
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
      return this.registeredAs === 'child';
    }
  },
  grade: String,
  subjects: [{
    name: String,
    area: String,
    progress: { type: Number, default: 0 }
  }],
  
  assignedTeachers: [{
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    subjects: [{ name: String, area: String }]
  }],

  learningPreferences: {
    preferredLanguage: String,
    studySchedule: String,
    learningStyle: [String]
  },
  achievements: [{ type: { type: String }, name: String, date: Date, description: String }],
  teachers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  assessments: [{
    type: {
      type: String,
      enum: ['initial','parent_questionnaire'],
      required: true
    },
    assessmentId:   { type: Schema.Types.ObjectId, refPath: 'studentProfile.assessments.assessmentModel' },
    assessmentModel:{ type: String, enum: ['InitialAssessment','ChildAssessment'], required: true },
    status:         { type: String, enum: ['pending','assigned'], default: 'pending' },
    submittedAt:    Date
  }],
  courses: [{
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    courseId:  String,
    startDate: Date,
    status:    String
  }]
});

// -----------------------------
// Parent-specific profile
// -----------------------------
const parentProfileSchema = new Schema({
  phone:                 String,
  interestedInLearning:  { type: Boolean, default: false }, // <-- already present, ensure this is set
  educationLevel:        String,
  subjects:             [String],
  children: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  assignedTeachers: [{
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    studentId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt:{ type: Date, default: Date.now }
  }]
});

// -----------------------------
// Main User schema
// -----------------------------
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate: {
      validator: (v: string) => /^[a-zA-Z0-9_-]{3,20}$/.test(v),
      message: 'Username must be 3-20 chars and only letters, numbers, underscores, hyphens'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['admin','teacher','student','parent'],
    required: true,
    default: 'student'
  },
  gender: { type: String, required: true },
  phone: { type: String, trim: true },
  emailVerified:    { type: Boolean, default: false },
  verificationToken: { type: String, select: false },
  verificationTokenExpiry: { type: Date, select: true },
  lastVerificationSent:    { type: Date, select: true },
  resetPasswordToken:      { type: String, select: true },
  resetPasswordTokenExpiry:{ type: Date, select: true },
  lastLogin: Date,
  image: String,
  bio:   String,
  language: { type: String, default: 'en' },
  timezone: String,

  teacherProfile: { type: teacherProfileSchema, required: false },
  studentProfile: { type: studentProfileSchema, required: false },
  parentProfile:  { type: parentProfileSchema, required: false },

  teachers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  isActive: { type: Boolean, default: true },
  preferences: {
    notifications: {
      email:  { type: Boolean, default: true },
      mobile: { type: Boolean, default: true },
      type: {
        lessons: { type: Boolean, default: true },
        progress:{ type: Boolean, default: true },
        system:  { type: Boolean, default: true }
      }
    },
    theme: { type: String, enum: ['light','dark','system'], default: 'system' },
    accessibility: {
      fontSize: { type: String, default: 'medium' },
      contrast: { type: String, default: 'normal' },
      reduceMotion: { type: Boolean, default: false }
    }
  },
  subscription: {
    status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'inactive' },
    lastPayment: Date,
    lastTransactionId: String,
    amount: Number,
    currency: String
  },
  blogger: { type: Boolean, default: false } // <-- Add this line
}, {
  timestamps: true,
  toJSON: {
    transform(_, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.verificationToken;
      delete ret.verificationTokenExpiry;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordTokenExpiry;
    }
  }
});

// -----------------------------
// Indexes
// -----------------------------
userSchema.index({ email: 1 });
userSchema.index({ username: 1 }, { sparse: true });
userSchema.index({ role: 1 });

// Export model
export const User =
  mongoose.models.User ||
  mongoose.model<IUser>('User', userSchema);

export type UserModel = typeof User;
