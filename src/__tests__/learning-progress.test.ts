import { learningProgress } from '@/lib/learning-progress';
import type { Shortlist } from '@/lib/teacher-shortlist';
const match: Shortlist = { subject: 'Yoruba', teachers: [{ id: 'one', name: 'One', bio: '' }], completedIntroductions: [] };
const booking = { slotId: 'slot', startTime: '2026-11-01T10:00:00Z', endTime: '2026-11-01T11:00:00Z', meetingLink: 'https://example.com/room' };
it('distinguishes choosing, booking and attending introductions', () => {
  expect(learningProgress().step).toBe(1);
  expect(learningProgress(match).label).toBe('Book your introductions');
  expect(learningProgress({ ...match, bookings: { one: booking } }).label).toBe('Attend your introductions');
});
it('requires completion before showing teacher selection and distinguishes booked from completed free classes', () => {
  const attended = { ...match, completedIntroductions: ['one'] };
  expect(learningProgress(attended).step).toBe(3);
  const selected = { ...attended, selectedTeacherId: 'one' };
  expect(learningProgress(selected).label).toBe('Book your free class');
  expect(learningProgress({ ...selected, freeLesson: booking }).label).toBe('Free class booked');
  expect(learningProgress({ ...selected, freeLesson: { ...booking, completed: true } }).step).toBe(5);
  expect(learningProgress(match).step).toBe(2);
});
