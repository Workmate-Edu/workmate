export interface AdminTableTeacher {
  id: string;
  name: string;
  email: string;
  rating?: number;
  subjects?: string[];
  assignedAt: Date;
  status: 'active' | 'inactive';
}

export interface AdminTableStudent {
  id: string;
  name: string;
  email?: string;
  type: 'independent' | 'child';
  grade?: string;
  parentName?: string;
  parentEmail?: string;
  subjects: string[];
  status: 'active' | 'inactive';
  assessmentStatus?: 'pending' | 'assigned';
  assessments?: Array<{
    id: string;
    subject: string;
    status: string;
    completedAt: string;
  }>;
  assignedTeacher?: {
    id: string;
    name: string;
    email: string;
    rating?: number;
    subjects?: string[];
    assignedAt: Date;
    status: 'active' | 'inactive';
  };
}

export interface AdminAssessment {
  id: string;
  studentType: 'independent' | 'child';
  studentName: string;
  studentEmail?: string;
  parentName?: string;
  grade?: string;
  subjects: {
    area: string;
    name: string;
  }[];
  status: 'pending' | 'assigned';
  createdAt: Date;
  completedAt?: Date;
  assignedTeacher?: AdminTableTeacher;
}
