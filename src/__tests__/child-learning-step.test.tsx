/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { ChildLearningStep } from '@/components/auth/child-learning-step';
import type { ParentOnboarding } from '@/lib/parent-onboarding';

const value: ParentOnboarding = {
  learners: [{
    name: 'Ada',
    age: 8,
    ageGroup: '6-8',
    level: 'beginner',
    subjects: ['Yoruba', 'Artificial Intelligence'],
    prioritySubject: 'Yoruba',
    goals: 'Speak Yoruba and learn how AI works',
  }],
  timezone: 'Africa/Lagos',
  preferredDays: ['Saturday'],
  preferredTime: 'morning',
};

it('keeps every selected child subject without asking for a priority subject', () => {
  const onChange = jest.fn();
  render(<ChildLearningStep value={value} onChange={onChange} disabled={false} />);

  expect(screen.getByText(/browse teachers for every selected subject/i)).toBeInTheDocument();
  expect(screen.getByText(/Each selected subject has its own teacher introductions/i)).toBeInTheDocument();
  expect(screen.queryByText(/priority subject/i)).not.toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: 'Yoruba' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Artificial Intelligence' })).toBeChecked();

  fireEvent.click(screen.getByRole('checkbox', { name: 'Artificial Intelligence' }));
  expect(onChange.mock.calls[0][0].learners[0].subjects).toEqual(['Yoruba']);
});

it('marks the children learning area when its validation fails', () => {
  render(<ChildLearningStep value={value} onChange={() => {}} disabled={false} hasError />);
  expect(screen.getByText(/review required/i)).toHaveClass('text-destructive');
});

it('marks the exact learner inputs and uses their visible titles in error messages', () => {
  render(<ChildLearningStep
    value={{ ...value, learners: [{ ...value.learners[0], name: '', subjects: [], goals: '' }] }}
    onChange={() => {}}
    disabled={false}
    hasError
    learnerErrors={{
      0: {
        name: 'First name or nickname is required',
        subjects: 'Subjects: select at least one',
        goals: 'What would you like help with? Please enter at least 3 characters',
      },
    }}
  />);

  expect(screen.getByRole('textbox', { name: /First name or nickname/i })).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('textbox', { name: /What would you like help with/i })).toHaveClass('border-destructive');
  expect(screen.getByRole('group', { name: 'Subjects' })).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('First name or nickname is required')).toBeInTheDocument();
  expect(screen.getByText('What would you like help with? Please enter at least 3 characters')).toBeInTheDocument();
});
