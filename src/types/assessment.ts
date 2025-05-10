import { QuestionType } from './questions';

// Shared status types
export type InitialAssessmentStatus = 'pending' | 'assigned' | 'completed';
export type TeacherAssessmentStatus = 'draft' | 'active' | 'completed';

// Initial assessment for matching students with teachers
export interface InitialAssessment {
  id: string
  studentId: {
    id: string
    name: string
    email: string
  }
  subject: {
    area: 'languages' | 'stem'
    name: string
  }
  responses: {
    questionId: string
    answer: string | string[]
    timestamp: Date
  }[]
  results?: {
    proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced'
    recommendedLevel?: string
    suggestedTeachers?: {
      teacherId: string
      matchScore: number
      availability: boolean
    }[]
    adminNotes?: string
  }
  status: InitialAssessmentStatus
  assignedTeacher?: {
    teacherId: string
    assignedAt: Date
    assignedBy: string
  }
  createdAt: Date
  updatedAt: Date
}

// Assessment given by teachers to students
export type TeacherAssessmentType = 'quiz' | 'assignment' | 'file_upload';

export interface TeacherAssessmentSubmission {
  studentId: string
  submittedAt: string
  status: "submitted" | "graded"
  grade?: number
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
  publicId?: string;
}

export interface Question {
  id: string;
  type: 'text' | 'multiple_choice' | 'file';
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  attachment?: FileAttachment;
}

export interface TeacherAssessment {
  id: string
  title: string
  description: string
  type: TeacherAssessmentType
  subject: string
  teacherId: string
  status: TeacherAssessmentStatus
  dueDate: string
  submissions: TeacherAssessmentSubmission[]
  questions: Question[]
  points: number
  attachment?: string
  createdAt: string
  updatedAt: string
}

export const FILE_UPLOAD_LIMITS = {
  maxSize: 5 * 1024 * 1024, // 5MB in bytes
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
} as const;
