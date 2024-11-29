import mongoose, { Model } from 'mongoose';
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
  qualifications?: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  teachingExperience?: number;
  hourlyRate?: number;
  availability?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  grade?: string;
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
  parentId?: mongoose.Types.ObjectId;
  pendingParentInvite?: boolean;
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
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
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
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
  }],
  teachingExperience: Number,
  hourlyRate: Number,
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    startTime: String,
    endTime: String,
  }],
  grade: String,
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
