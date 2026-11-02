import { firstSignupErrorMessage } from '@/lib/signup-validation';

it('returns the first validation message in visible field order', () => {
  const errors: Record<string, string> = {
    email: 'Email is required',
    username: 'Username is required',
  };

  expect(firstSignupErrorMessage(
    field => ({ error: errors[field] ? { message: errors[field] } : undefined }),
    ['name', 'username', 'email'],
    'Review the highlighted fields'
  )).toBe('Username is required');
});

it('uses the fallback only when no field has a validation message', () => {
  expect(firstSignupErrorMessage(() => ({}), ['name'], 'Review the highlighted fields'))
    .toBe('Review the highlighted fields');
});
