export type QuestionType = 'multiple_choice' | 'text' | 'file';
export type SubjectArea = 'stem' | 'languages' | 'arts' | 'other';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuestionBank {
  id: string;
  subject: {
    area: string;
    name: string;
  };
  level: 'beginner' | 'intermediate' | 'advanced';
  type: QuestionType;
  question: {
    text: string;
    format: QuestionType;
    media?: {
      type: string;
      url: string;
    }[];
  };
  verification: {
    status: 'pending' | 'approved' | 'rejected';
  };
  metadata: {
    difficulty: DifficultyLevel;
    tags: string[];
    estimatedTime: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuestionFormData {
  subject: {
    area: string;
    name: string;
  };
  level: string;
  type: string;
  question: {
    text: string;
    format: string;
  };
}
