export const MATCHING_STATES = {
  pending: 'Request received',
  reviewing: 'Finding suitable teachers',
  contacting: 'Arranging introductions with you',
} as const;
export type MatchingState = keyof typeof MATCHING_STATES;
export function intakePath(role: string) {
  if (role === 'parent') return 'parentProfile.onboarding';
  if (role === 'student') return 'studentProfile.onboarding';
  throw new Error('This account cannot request lessons');
}
