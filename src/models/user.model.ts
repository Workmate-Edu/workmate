import mongoose, { Model, Types } from 'mongoose';
import { UserRole } from '@/types';

interface IUser {
  name: string;
  email: string;
  username?: string;
  password?: string;
  role?: string;
  emailVerified: boolean;
  image?: string;
  provider?: 'google' | 'credentials';
  subjects?: string[];
  bio?: string;
  requirePasswordChange?: boolean;
  parentId?: Types.ObjectId;
  pendingParentInvite?: boolean;
  qualifications?: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  teachingExperience?: number;
  hourlyRate?: number;
  ratings?: number[];
  teachingStyle?: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    readingWriting: number;
  };
  languages?: string[];
  specializations?: string[];
  availability?: Array<{
    day: string;
    slots: Array<{
      start: string;
      end: string;
      isBooked: boolean;
    }>;
  }>;
  grade?: string;
  studentId?: string;
  schoolName?: string;
  studentSubjects?: Array<{
    name: string;
    progress: number;
    teacher: mongoose.Types.ObjectId;
  }>;
  children?: mongoose.Types.ObjectId[];
  reviews?: Array<{
    from: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  notifications?: Array<{
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
  }>;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    index: true // Remove duplicate index declaration
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    index: true, // Remove duplicate index declaration
    minlength: [3, 'Username must be at least 3 characters long'],
  },
  password: {
    type: String,
    select: false,  // Ensure password is not included in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'parent', 'admin', ''],
    default: 'student',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  image: String,
  provider: {
    type: String,
    enum: ['google', 'credentials'],
  },
  subjects: [{
    type: String,
    enum: ['stem', 'art', 'arabic'],
  }],
  bio: String,
  requirePasswordChange: Boolean,
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
  }],
  teachingExperience: Number,
  hourlyRate: Number,
  ratings: [Number],
  teachingStyle: {
    visual: Number,
    auditory: Number,
    kinesthetic: Number,
    readingWriting: Number,
  },
  languages: [String],
  specializations: [String],
  availability: [{
    day: String,
    slots: [{
      start: String,
      end: String,
      isBooked: Boolean,
    }],
  }],
  grade: String,
  studentId: String,
  schoolName: String,
  studentSubjects: [{
    name: String,
    progress: Number,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  reviews: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['message', 'assignment', 'grade', 'event'],
    },
    title: String,
    message: String,
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null means no parent (regular student)
  },
  pendingParentInvite: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      return ret;
    },
  },
});

let User: Model<IUser>;

try {
  // Try to get the existing model
  User = mongoose.model<IUser>('User');
} catch {
  // If the model doesn't exist, create it
  User = mongoose.model<IUser>('User', userSchema);
}

export default User;
