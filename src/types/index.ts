export type UserRole = 'student' | 'teacher' | 'admin';

export type Subject = 'stem' | 'art' | 'arabic';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  image?: string;
  subjects?: Subject[];
  bio?: string;
  qualifications?: {
    degree: string;
    institution: string;
    year: number;
  }[];
  teachingExperience?: number;
  hourlyRate?: number;
  availability?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  reviews?: {
    student: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: UserRole;
}
