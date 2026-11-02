import { freeLessonClaimKey, canClaimFreeLesson } from '@/lib/free-lesson-policy';
it('uses canonical subjects instead of teacher IDs or subject-list positions', () => {
  expect(freeLessonClaimKey('parent', 0, 'AI')).toBe(freeLessonClaimKey('parent', 0, 'Artificial Intelligence'));
  expect(freeLessonClaimKey('parent', 0, 'Yoruba')).not.toBe(freeLessonClaimKey('parent', 0, 'AI'));
  expect(freeLessonClaimKey('parent', 0, 'Yoruba')).not.toBe(freeLessonClaimKey('parent', 1, 'Yoruba'));
});
it.each(['unknown', '$.injected'])('rejects an invalid subject %s', subject => {
  expect(() => freeLessonClaimKey('parent', 0, subject)).toThrow('Invalid subject');
});
it('does not allow independent learners to invent additional learner indexes', () => {
  expect(() => freeLessonClaimKey('student', 1, 'Yoruba')).toThrow('Invalid learner');
});
it('honors known old claims for that subject only', () => {
  const account = { role: 'parent', freeLessonClaims: { account: { learner: 0, subject: 'Yoruba' } } };
  expect(() => canClaimFreeLesson(account, freeLessonClaimKey('parent', 0, 'Yoruba'))).toThrow('already reserved or used');
  expect(() => canClaimFreeLesson(account, freeLessonClaimKey('parent', 0, 'AI'))).not.toThrow();
});
