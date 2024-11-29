import { MatchPreferences, TeacherScore, TeacherAvailability, LearningStyleAssessment } from "./types";

interface Teacher {
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

export class TeacherMatcher {
  private static readonly WEIGHTS = {
    subjectMatch: 0.25,
    availabilityMatch: 0.20,
    experienceScore: 0.15,
    ratingScore: 0.15,
    learningStyleMatch: 0.15,
    languageMatch: 0.05,
    priceMatch: 0.05,
  };

  static async findMatches(
    teachers: Teacher[],
    preferences: MatchPreferences,
    studentLearningStyle: LearningStyleAssessment
  ): Promise<TeacherScore[]> {
    const scores = teachers.map(teacher => this.scoreTeacher(teacher, preferences, studentLearningStyle));
    
    // Sort by score in descending order
    return scores.sort((a, b) => b.score - a.score);
  }

  private static scoreTeacher(
    teacher: Teacher,
    preferences: MatchPreferences,
    studentLearningStyle: LearningStyleAssessment
  ): TeacherScore {
    const matchFactors = {
      subjectMatch: this.calculateSubjectMatch(teacher.subjects, preferences.subjects),
      availabilityMatch: this.calculateAvailabilityMatch(teacher.availability, preferences),
      experienceScore: this.calculateExperienceScore(teacher.teachingExperience),
      ratingScore: this.calculateRatingScore(teacher.ratings),
      learningStyleMatch: this.calculateLearningStyleMatch(teacher.teachingStyle, studentLearningStyle),
      languageMatch: this.calculateLanguageMatch(teacher.languages, preferences.preferredLanguages),
      priceMatch: this.calculatePriceMatch(teacher.hourlyRate, preferences.maxPrice),
    };

    // Calculate weighted score
    const score = Object.entries(matchFactors).reduce(
      (total, [factor, value]) => total + value * this.WEIGHTS[factor as keyof typeof this.WEIGHTS],
      0
    );

    return {
      teacherId: teacher._id,
      score,
      matchFactors,
    };
  }

  private static calculateSubjectMatch(teacherSubjects: string[], preferredSubjects: string[]): number {
    const matches = teacherSubjects.filter(subject => preferredSubjects.includes(subject));
    return matches.length / preferredSubjects.length;
  }

  private static calculateAvailabilityMatch(
    teacherAvailability: TeacherAvailability[],
    preferences: MatchPreferences
  ): number {
    let matchingSlots = 0;
    let totalPreferredSlots = 0;

    preferences.preferredDays.forEach(day => {
      const teacherDay = teacherAvailability.find(a => a.day === day);
      if (teacherDay) {
        preferences.preferredTimes.forEach(preferredTime => {
          totalPreferredSlots++;
          const hasMatchingSlot = teacherDay.slots.some(slot => 
            !slot.isBooked &&
            this.isTimeInRange(preferredTime.start, preferredTime.end, slot.start, slot.end)
          );
          if (hasMatchingSlot) matchingSlots++;
        });
      }
    });

    return totalPreferredSlots > 0 ? matchingSlots / totalPreferredSlots : 0;
  }

  private static calculateExperienceScore(years: number): number {
    // Normalize experience score (max 20 years)
    return Math.min(years / 20, 1);
  }

  private static calculateRatingScore(ratings: number[]): number {
    if (ratings.length === 0) return 0.5; // Neutral score for new teachers
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return average / 5; // Assuming 5-star rating system
  }

  private static calculateLearningStyleMatch(
    teacherStyle: LearningStyleAssessment,
    studentStyle: LearningStyleAssessment
  ): number {
    // Calculate cosine similarity between teaching and learning styles
    const dotProduct = Object.keys(teacherStyle).reduce((sum, key) => {
      const k = key as keyof LearningStyleAssessment;
      return sum + teacherStyle[k] * studentStyle[k];
    }, 0);

    const teacherMagnitude = Math.sqrt(
      Object.values(teacherStyle).reduce((sum, val) => sum + val * val, 0)
    );
    const studentMagnitude = Math.sqrt(
      Object.values(studentStyle).reduce((sum, val) => sum + val * val, 0)
    );

    return dotProduct / (teacherMagnitude * studentMagnitude);
  }

  private static calculateLanguageMatch(
    teacherLanguages: string[],
    preferredLanguages?: string[]
  ): number {
    if (!preferredLanguages || preferredLanguages.length === 0) return 1;
    const matches = teacherLanguages.filter(lang => preferredLanguages.includes(lang));
    return matches.length / preferredLanguages.length;
  }

  private static calculatePriceMatch(teacherRate: number, maxPrice: number): number {
    if (teacherRate > maxPrice) return 0;
    // Higher score for prices well below max budget
    return 1 - (teacherRate / maxPrice);
  }

  private static isTimeInRange(
    prefStart: string,
    prefEnd: string,
    slotStart: string,
    slotEnd: string
  ): boolean {
    const pStart = new Date(`1970-01-01T${prefStart}`);
    const pEnd = new Date(`1970-01-01T${prefEnd}`);
    const sStart = new Date(`1970-01-01T${slotStart}`);
    const sEnd = new Date(`1970-01-01T${slotEnd}`);

    return (
      (sStart <= pStart && sEnd >= pEnd) || // Slot contains preference
      (pStart <= sStart && pEnd >= sEnd) || // Preference contains slot
      (sStart <= pStart && sEnd >= pStart) || // Slot overlaps start
      (sStart <= pEnd && sEnd >= pEnd) // Slot overlaps end
    );
  }
}
