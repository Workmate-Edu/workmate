export interface TeacherScore {
  teacherId: string;
  score: number;
  matchFactors: {
    subjectMatch: number;
    availabilityMatch: number;
    experienceScore: number;
    ratingScore: number;
    learningStyleMatch: number;
    languageMatch: number;
    priceMatch: number;
  };
}

export interface MatchPreferences {
  subjects: string[];
  preferredDays: string[];
  preferredTimes: {
    start: string;
    end: string;
  }[];
  maxPrice: number;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading/writing';
  preferredLanguages?: string[];
  specialRequirements?: string[];
}

export interface TeacherAvailability {
  day: string;
  slots: {
    start: string;
    end: string;
    isBooked: boolean;
  }[];
}

export interface LearningStyleAssessment {
  visual: number;
  auditory: number;
  kinesthetic: number;
  readingWriting: number;
}

export interface Teacher {
  _id: string;
  subjects: string[];
  availability: TeacherAvailability[];
  teachingExperience: number;
  ratings: number[];
  hourlyRate: number;
  teachingStyle: LearningStyleAssessment;
  languages: string[];
  specializations: string[];
}
