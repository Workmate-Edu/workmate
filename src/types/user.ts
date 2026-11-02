import { Document } from 'mongoose';
import type { UserRole } from './auth';

// Core user type that represents the essential user data
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole; // Make role required' | 'student' | 'parent'
  emailVerified: boolean;
  image?: string | null;
}

// Extended user type with additional fields for the database
export interface DatabaseUser {
  _id?: string;
  email: string;
  name: string;
  username?: string;
  password?: string;
  role: UserRole; // Required, not optional
  emailVerified: boolean; // Common for all users
  image?: string;
  bio?: string;
  language?: string;
  timezone?: string;
  isActive?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Role-specific profiles
  teacherProfile?: TeacherProfile;
  studentProfile?: StudentProfile;
  parentProfile?: ParentProfile;
  preferences?: UserPreferences;

  // Auth & Verification Fields
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
}

// Extended interface for Mongoose Document
export interface IUser extends Omit<DatabaseUser, '_id'>, Document {
  schedulingRevision?: number;
  freeLessonClaims?: Record<string, any>;
  freeLessonEligible?: boolean;
  role: UserRole; // Explicitly required
  verificationTokenExpiry?: Date;
  lastVerificationSent?: Date;
  phone?: string;  // Add phone field
}

export interface TeacherProfile {
  qualifications: Qualification[];
  subjects: SubjectExpertise[];
  adminVerified: boolean; // Additional verification for teachers only
  adminVerificationDate?: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  availability: Availability[];
  rating: number;
  reviews: TeacherReview[];
  students: {
    studentId: string; // Reference to student user
    startDate: Date;
    status: 'active' | 'inactive' | 'pending';
    subjects: string[];
    performanceReviews: StudentPerformanceReview[];
  }[];
  parents: {
    parentId: string; // Reference to parent user
    startDate: Date;
    status: 'active' | 'inactive' | 'pending';
    students: string[]; // References to students under this parent
  }[];
  groupSessions: GroupSession[];
}

export interface StudentSubject {
  name: string;
  area: string;
  progress: number;
}

export interface StudentProfile {
  registeredAs: 'independent' | 'child';
  grade: string;
  subjects: StudentSubject[];
  learningPreferences: LearningPreferences;
  achievements: Achievement[];
  parent?: string; // Reference to parent user ID
  teachers: {
    teacherId: string;
    startDate: Date;
    status: 'active' | 'inactive' | 'pending';
    subjects: {
      name: string;
      area: string;
      level: string;
      progress: number;
      lastSessionDate?: Date;
    }[];
    reviews: TeacherReview[];
    performanceReviews: StudentPerformanceReview[];
  }[];
}

export interface ParentProfile {
  children: string[]; // Array of student user IDs
  consentProvided: boolean;
  consentDate?: Date;
  relationshipToChildren: string;
  childrenSubjects: {
    childId: string;
    subjects: {
      name: string;
      area: string;
      teacherId: string;
      startDate: Date;
      status: 'active' | 'paused' | 'completed';
      progress: number;
    }[];
  }[];
  childrenProgress: {
    childId: string;
    subjects: {
      name: string;
      area: string;
      teacherId: string;
      startDate: Date;
      status: 'active' | 'paused' | 'completed';
      progress: number;
      recentActivities: {
        date: Date;
        type: 'lesson' | 'homework' | 'assessment';
        description: string;
        score?: number;
        teacherNotes?: string;
      }[];
      upcomingSessions: {
        date: Date;
        teacherId: string;
        topic: string;
        type: 'regular' | 'revision' | 'assessment';
      }[];
      monthlyProgress: {
        month: Date;
        attendance: number;
        completedLessons: number;
        averageScore: number;
        teacherFeedback: string;
      }[];
    }[];
    teacherReviews: TeacherReview[];
    performanceReviews: StudentPerformanceReview[];
  }[];
  notifications: {
    type: 'progress' | 'attendance' | 'assessment' | 'behavior';
    childId: string;
    message: string;
    date: Date;
    read: boolean;
  }[];
  
  // Add learning capabilities for parent
  learningProfile?: {
    subjects: {
      name: string;
      area: string;
      level: string;
      progress: number;
      lastSessionDate?: Date;
    }[];
    teachers: {
      teacherId: string;
      startDate: Date;
      status: 'active' | 'inactive' | 'pending';
      subjects: string[];
    }[];
    familyLearning: {
      childId: string;
      subjects: string[];
      jointSessions: {
        sessionId: string;
        date: Date;
        progress: number;
      }[];
    }[];
  };
}

// Supporting interfaces
interface Qualification {
  degree: string;
  institution: string;
  year: number;
  document?: string;
}

export interface TeacherSubject {
  area: string;
  subjects: string[];
}

interface SubjectExpertise {
  area: string;  
  subjects: string[];
  level: string;
  yearsOfExperience: number;
}

interface Availability {
  day: string;
  slots: TimeSlot[];
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface Review {
  student: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface StudentSubject {
  name: string;
  level: string;
  progress: number;
  startDate: Date;
}

interface LearningPreferences {
  preferredLanguage: string;
  studySchedule: string;
  learningStyle: string[];
}

interface Achievement {
  type: string;
  name: string;
  date: Date;
  description: string;
}

interface UserPreferences {
  notifications: {
    email: boolean;
    mobile: boolean;
    type: {
      lessons: boolean;
      progress: boolean;
      system: boolean;
    }
  };
  theme: 'light' | 'dark' | 'system';
  accessibility: {
    fontSize: string;
    contrast: string;
    reduceMotion: boolean;
  };
}

interface TeacherReview {
  student: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
  parentEndorsed?: boolean;
}

interface StudentPerformanceReview {
  date: Date;
  teacherId: string;
  subjectId: string;
  rating: number; // 1-5 scale
  strengths: string[];
  areasToImprove: string[];
  comments: string;
  recommendations: string;
  parent: {
    seen: boolean;
    acknowledged: boolean;
    feedback?: string;
  }
}

interface GroupSession {
  name: string;
  description: string;
  subject: {
    area: string;
    name: string;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    recurringDays: string[];
    time: {
      start: string;
      end: string;
    };
  };
  maxStudents: number;
  enrolledStudents: {
    studentId: string;
    joinedAt: Date;
    status: 'active' | 'inactive';
  }[];
  level: string;
  price?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  materials: {
    title: string;
    type: 'document' | 'video' | 'link';
    url: string;
  }[];
}

// Session user type for client-side use
export interface SessionUser extends BaseUser {
  isAuthenticated: boolean;
}
