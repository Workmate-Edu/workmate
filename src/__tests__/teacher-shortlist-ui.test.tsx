/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { TeacherShortlist } from '@/components/teacher-shortlist';
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }));
const teachers = ['One', 'Two', 'Three'].map((name, index) => ({ id: String(index), name, bio: '' }));
const props = { ownerId: 'owner', role: 'student', learner: 0, subjectIndex: 0, subject: 'Yoruba' };
it('keeps selection disabled until all introductions are recorded', () => {
  render(<TeacherShortlist {...props} match={{ subject: 'Yoruba', teachers, completedIntroductions: ['0'] }} />);
  expect(screen.getByRole('button', { name: 'Choose One' })).toBeDisabled();
  expect(screen.queryByText('Confirm introduction took place')).not.toBeInTheDocument();
});
it('allows choosing after three completed introductions', () => {
  render(<TeacherShortlist {...props} match={{ subject: 'Yoruba', teachers, completedIntroductions: ['0', '1', '2'] }} />);
  expect(screen.getByRole('button', { name: 'Choose One' })).toBeEnabled();
});
it('shows the selected teacher without claiming a booked lesson', () => {
  render(<TeacherShortlist {...props} match={{ subject: 'Yoruba', teachers, completedIntroductions: ['0', '1', '2'], selectedTeacherId: '0' }} />);
  expect(screen.getByText('Your selected teacher')).toBeInTheDocument();
  expect(screen.getByText(/this selection is not a booking/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Choose One' })).not.toBeInTheDocument();
});
