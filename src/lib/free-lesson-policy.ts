import { SchedulingError } from '@/lib/scheduling';
import { LEARNING_SUBJECTS } from '@/lib/parent-onboarding';
import { subjectAliases } from '@/lib/teacher-shortlist';
export function freeLessonClaimKey(role: string, learner: number, subject: string) {
  if (!['parent', 'student'].includes(role) || !Number.isInteger(learner) || learner < 0 || learner > 9 || (role === 'student' && learner !== 0)) throw new SchedulingError('Invalid learner');
  const canonical = LEARNING_SUBJECTS.find(name => subjectAliases(name).includes(subject.trim().toLowerCase()));
  if (!canonical) throw new SchedulingError('Invalid subject');
  // Intake indexes cannot be changed after matching begins. Subject names, not list
  // positions or teacher IDs, identify the allowance so duplicates cannot reset it.
  return `learner_${learner}_${canonical.toLowerCase().replaceAll(' ', '_')}`;
}
export function canClaimFreeLesson(account: any, key: string) {
  const claims = Object.values(account.freeLessonClaims || {}) as any[];
  const previouslyClaimed = claims.some(claim => {
    // Preserve known older reservations without treating them as a whole-family cap.
    if (claim.learner === undefined || !claim.subject) throw new SchedulingError('An earlier free lesson needs review. Please contact the team.');
    return freeLessonClaimKey(account.role, claim.learner, claim.subject) === key;
  });
  if (account.freeLessonClaims?.[key] || previouslyClaimed) throw new SchedulingError('This learner has already reserved or used the free lesson for this subject');
  // Once a new family qualifies, starting paid lessons in one subject must not
  // remove their unused trial allowances in other subjects.
  const enrolled = account.freeLessonEligible === true || claims.length > 0;
  if (!enrolled && (account.subscription?.lastPayment || account.subscription?.status === 'active')) throw new SchedulingError('This introductory offer is for first-time learners');
}
