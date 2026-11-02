// Existing teacher documents use both display names and signup codes.
export function subjectAliases(subject: string): string[] {
  const names: Record<string, string[]> = {
    Mathematics: ['mathematics', 'math', 'maths'],
    'Computer Science': ['computer science', 'cs'],
    'Artificial Intelligence': ['artificial intelligence', 'ai'],
  };
  return names[subject] || [subject.toLowerCase()];
}
export function teachesSubject(teacher: any, subject: string) {
  const aliases = subjectAliases(subject);
  return teacher.teacherProfile?.subjects?.some((group: any) =>
    group.subjects?.some((name: string) => aliases.includes(name.trim().toLowerCase()))) === true;
}
export const approvedTeacherFilter = {
  role: 'teacher', isActive: true, 'teacherProfile.verificationStatus': 'verified',
};
export type Shortlist = {
  subject: string;
  teachers: Array<{ id: string; name: string; bio: string; image?: string; introductionVideoUrl?: string }>;
  completedIntroductions: string[];
  introductionFeedback?: Record<string, { suggestedFeedback: string[]; comment?: string; updatedAt: string }>;
  coordinatedIntroduction?: { requestId: string; reference: string; status: 'requested' | 'confirmed' | 'completed' | 'cancelled'; requestedStart: string; requestedEnd: string; requestedStarts?: string[]; requestedTimezone: string; meetingLink?: string; confirmedAt?: string; completedAt?: string };
  selectedTeacherId?: string;
  freeLesson?: { slotId: string; startTime: string; endTime: string; meetingLink: string; completed?: boolean };
  bookings?: Record<string, { slotId: string; startTime: string; endTime: string; meetingLink: string }>;
};

export function publicShortlist(match: any): Shortlist | undefined {
  if (!match) return undefined;
  return {
    subject: match.subject, teachers: match.teachers, completedIntroductions: match.completedIntroductions,
    ...(match.introductionFeedback ? { introductionFeedback: Object.fromEntries(Object.entries(match.introductionFeedback).map(([teacherId, feedback]: [string, any]) => [teacherId, {
      suggestedFeedback: Array.isArray(feedback.suggestedFeedback) ? feedback.suggestedFeedback : [],
      ...(feedback.comment ? { comment: feedback.comment } : {}),
      updatedAt: new Date(feedback.updatedAt).toISOString(),
    }])) } : {}),
    ...(match.coordinatedIntroduction ? { coordinatedIntroduction: {
      requestId: String(match.coordinatedIntroduction.requestId), reference: String(match.coordinatedIntroduction.reference), status: match.coordinatedIntroduction.status,
      requestedStart: new Date(match.coordinatedIntroduction.requestedStart).toISOString(), requestedEnd: new Date(match.coordinatedIntroduction.requestedEnd).toISOString(),
      ...(Array.isArray(match.coordinatedIntroduction.requestedStarts) ? { requestedStarts: match.coordinatedIntroduction.requestedStarts.map((start: any) => new Date(start).toISOString()) } : {}),
      requestedTimezone: String(match.coordinatedIntroduction.requestedTimezone),
      ...(match.coordinatedIntroduction.meetingLink ? { meetingLink: String(match.coordinatedIntroduction.meetingLink) } : {}),
      ...(match.coordinatedIntroduction.confirmedAt ? { confirmedAt: new Date(match.coordinatedIntroduction.confirmedAt).toISOString() } : {}),
      ...(match.coordinatedIntroduction.completedAt ? { completedAt: new Date(match.coordinatedIntroduction.completedAt).toISOString() } : {}),
    } } : {}),
    selectedTeacherId: match.selectedTeacherId,
    ...(match.freeLesson ? { freeLesson: { slotId: match.freeLesson.slotId, startTime: new Date(match.freeLesson.startTime).toISOString(), endTime: new Date(match.freeLesson.endTime).toISOString(), meetingLink: match.freeLesson.meetingLink, completed: match.freeLesson.completed || false } } : {}),
    bookings: Object.fromEntries(Object.entries(match.bookings || {}).map(([id, booking]: [string, any]) => [id, {
      slotId: booking.slotId, startTime: new Date(booking.startTime).toISOString(), endTime: new Date(booking.endTime).toISOString(), meetingLink: booking.meetingLink,
    }])),
  };
}
