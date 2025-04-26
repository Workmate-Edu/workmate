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
  questions?: Array<{
    id: string
    type: QuestionType
    question: string
    options?: string[]
    points: number
  }>
  points: number
  attachment?: string
  createdAt: string
  updatedAt: string
}
