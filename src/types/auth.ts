import type { DefaultSession } from "next-auth";

export type UserRole = "admin" | "teacher" | "student" | "parent";

export interface AuthError {
  message: string;
  code?: string;
}

// Base user interface used across NextAuth and app context
export interface WorkmateUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  image?: string | null;
  username?: string | null;
}

// ---------- ⬇️ NEXTAUTH EXTENSIONS ----------

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    emailVerified: boolean;
    image?: string | null;
    username?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      emailVerified: boolean;
      image?: string | null;
      username?: string | null;
    };
    expires: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    emailVerified: boolean;
    image?: string | null;
    username?: string | null;
  }
}

// ---------- ⬇️ SHARED UTILS ----------

export interface AuthTokenPayload extends WorkmateUser {}

export interface SignInCredentials {
  email: string;
  password: string;
}

// ---------- ⬇️ STUDENT SIGNUP ----------

export interface StudentSubject {
  name: string;
  area: string;
}

export interface StudentProfileData {
  registeredAs: "independent" | "child";
  grade: string;
  subjects: StudentSubject[];
}

export interface StudentFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  gender: string;
  grade: string;
  subjects: StudentSubject[];
}

// ---------- ⬇️ TEACHER SIGNUP ----------

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
}

export interface TeacherSubjectArea {
  area: string;
  subjects: string[];
}

export interface TeacherFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  gender: string;
  subjectAreas: string[];
  subjects: TeacherSubjectArea[];
  experience: string;
  education: string;
  bio: string;
}

// ---------- ⬇️ PARENT & CHILD SIGNUP ----------

export interface ChildInfo {
  name: string;
  username: string;
  password: string;
  gender: string;
  educationLevel: string;
  grade: string;
  ageGroup: string;
  subjects: {
    area: string;
    name: string;
  }[];
}

export interface ParentFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  gender: string;
  interestedInLearning: boolean;
  educationLevel?: string;
  subjectAreas?: string[];
  subjects?: string[];
  children: ChildInfo[];
  residenceCountry: string;
  termsAccepted: boolean;
  privacyAcknowledged: boolean;
  parentalAuthority: boolean;
  marketingOptIn: boolean;
}

// ---------- ⬇️ ADMIN / SYSTEM LEVEL ----------

export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  username?: string;
  additionalInfo?: {
    grade?: string;
    subjects?: string[];
    qualifications?: Qualification[];
    experience?: number;
    preferences?: Record<string, any>;
  };
}

// ---------- ⬇️ SUBSCRIPTION & CLASSES (OPTIONAL) ----------

export interface SubscriptionTier {
  individual: {
    basic: {
      price: 29.99;
      description: string;
      features: {
        liveClassesPerMonth: number;
        studentLimit: number;
        subjectLimit: number | string;
        classRecordings: boolean;
        teacherConsultation: number;
      };
    };
    premium: {
      price: 49.99;
      description: string;
      features: {
        liveClassesPerMonth: number;
        studentLimit: number;
        subjectLimit: string;
        classRecordings: boolean;
        teacherConsultation: number;
        priorityBooking: boolean;
        studyGroupAccess: boolean;
      };
    };
  };
  family: {
    standard: {
      price: 79.99;
      baseChildren: number;
      additionalChildPrice: number;
      description: string;
      features: {
        liveClassesPerChildPerMonth: number;
        subjectsPerChild: string;
        classRecordings: boolean;
        teacherConsultationPerChild: number;
        parentDashboard: boolean;
        progressTracking: boolean;
      };
    };
    premium: {
      price: 119.99;
      baseChildren: number;
      additionalChildPrice: number;
      description: string;
      features: {
        liveClassesPerChildPerMonth: number;
        subjectsPerChild: string;
        classRecordings: boolean;
        teacherConsultationPerChild: number;
        priorityBooking: boolean;
        studyGroupAccess: boolean;
        parentDashboard: boolean;
        progressTracking: boolean;
        familyLearningReport: boolean;
      };
    };
  };
}

export interface ClassSession {
  duration: "45 minutes";
  maxStudents: number;
  bookingWindow: {
    regular: string;
    priority: string;
  };
  cancellation: string;
  makeupClass: {
    basic: number;
    premium: number;
  };
}

export interface AddOnServices {
  privateClass: {
    price: number;
    duration: string;
    description: string;
  };
  extraClasses: {
    price: number;
    quantity: number;
    description: string;
  };
  intensiveWeek: {
    price: number;
    classes: number;
    description: string;
  };
}
