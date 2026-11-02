/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { DashboardGuide, DASHBOARD_GUIDE_VERSION } from '@/components/dashboard/dashboard-guide';

beforeEach(() => localStorage.clear());
it('lets a parent jump to a numbered step and follow its destination', () => {
  render(<DashboardGuide userId="parent-one" role="parent" />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Dashboard guide' }));
  fireEvent.click(screen.getByRole('button', { name: 'Step 4: Book your free class' }));
  expect(screen.getByText('Step 4 of 5')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Step 4: Book your free class' })).toHaveAttribute('aria-current', 'step');
  expect(screen.getByRole('link', { name: 'Manage free classes' })).toHaveAttribute('href', '/dashboard/learning-plan');
  fireEvent.click(screen.getByRole('button', { name: 'Close guide' }));
  fireEvent.click(screen.getByRole('button', { name: 'Dashboard guide' }));
  expect(screen.getByText('Step 4 of 5')).toBeInTheDocument();
});
it('remembers dismissal for this user and version but invites a different user', () => {
  const { unmount } = render(<DashboardGuide userId="one" role="parent" />);
  fireEvent.click(screen.getByRole('button', { name: 'Maybe later' }));
  unmount();
  const second = render(<DashboardGuide userId="one" role="parent" />);
  expect(screen.queryByRole('button', { name: 'Maybe later' })).not.toBeInTheDocument();
  second.unmount();
  render(<DashboardGuide userId="two" role="parent" />);
  expect(screen.getByRole('button', { name: 'Maybe later' })).toBeInTheDocument();
});
it('handles invalid saved progress and shows teacher-specific routes', () => {
  localStorage.setItem(`workmate.dashboard-guide.teacher.teacher.${DASHBOARD_GUIDE_VERSION}`, JSON.stringify({ seen: true, step: 99 }));
  render(<DashboardGuide userId="teacher" role="teacher" />);
  fireEvent.click(screen.getByRole('button', { name: 'Dashboard guide' }));
  expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Open introductions' })).toHaveAttribute('href', '/dashboard/teacher/introductions');
  expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
});
it('offers the current update even if an earlier version was dismissed', () => {
  localStorage.setItem('workmate.dashboard-guide.one.parent.old-version', JSON.stringify({ seen: true }));
  render(<DashboardGuide userId="one" role="parent" />);
  expect(screen.getByRole('button', { name: 'Maybe later' })).toBeInTheDocument();
});
