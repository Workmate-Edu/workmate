import type { Shortlist } from './teacher-shortlist';

export function learningProgress(match?: Shortlist) {
  if (!match) return { step: 1, label: 'Choose introduction teachers', detail: 'Browse teachers and choose up to three for this subject.' };
  if (match.freeLesson?.completed) return { step: 5, label: 'Free class completed', detail: 'Review a paid learning plan when you are ready to continue.' };
  if (match.freeLesson) return { step: 4, label: 'Free class booked', detail: 'Your class time and meeting link are below.' };
  if (match.selectedTeacherId) return { step: 4, label: 'Book your free class', detail: 'Choose a 60-minute slot with your selected teacher.' };
  if (match.coordinatedIntroduction?.status === 'completed') return { step: 3, label: 'Choose your teacher', detail: 'Your introduction is complete. Add private feedback and choose a participating teacher.' };
  if (match.coordinatedIntroduction) return { step: 2, label: match.coordinatedIntroduction.status === 'confirmed' ? 'Attend your introduction' : 'Introduction request pending', detail: match.coordinatedIntroduction.status === 'confirmed' ? 'Attend the coordinated meeting. Workmate will mark participating teachers complete afterwards.' : 'Workmate will coordinate the shortlisted teachers and confirm one meeting invitation.' };
  if (match.teachers.length > 0 && match.teachers.every(t => match.completedIntroductions.includes(t.id))) return { step: 3, label: 'Choose your teacher', detail: 'Your introductions are complete. Choose the teacher you want to continue with.' };
  const unbooked = match.teachers.some(t => !match.completedIntroductions.includes(t.id) && !match.bookings?.[t.id]);
  return { step: 2, label: unbooked ? 'Book your introductions' : 'Attend your introductions', detail: unbooked ? 'Choose a 15-minute slot with each teacher below.' : 'After each introduction, the teacher or team confirms completion here.' };
}
