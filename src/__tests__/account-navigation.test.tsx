/** @jest-environment jsdom */
import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import { UserNav } from '@/components/user-nav';
import ProfilePage from '@/app/profile/page';
import SettingsPage from '@/app/settings/page';
import { getAuthSession } from '@/lib/auth';
import { useTheme } from 'next-themes';

jest.mock('@/lib/auth', () => ({ getAuthSession: jest.fn() }));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  redirect: (url: string) => { throw new Error(`Redirect: ${url}`); },
}));
jest.mock('@/components/notifications/notification-menu', () => ({ NotificationMenu: () => null }));
jest.mock('next-themes', () => ({ useTheme: jest.fn() }));

const session = { user: { id: 'admin', name: 'Chief Admin', email: 'admin@example.com', role: 'admin' }, expires: '2099-01-01' } as any;
const setTheme = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  (useTheme as jest.Mock).mockReturnValue({ theme: 'light', setTheme });
});

it('opens the initials dropdown with the keyboard and exposes profile, settings and sign out', async () => {
  const onNavigate = jest.fn();
  render(<UserNav session={session} onNavigate={onNavigate} />);
  const trigger = screen.getByRole('button', { name: 'Open account menu' });
  expect(trigger).toHaveTextContent('CA');
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  expect(await screen.findByRole('menuitem', { name: 'Profile' })).toHaveAttribute('href', '/profile');
  expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  fireEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));
  expect(onNavigate).toHaveBeenCalledTimes(1);
  expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
});

it('does not show an account menu for signed-out visitors', () => {
  render(<UserNav session={null} />);
  expect(screen.queryByRole('button', { name: 'Open account menu' })).not.toBeInTheDocument();
});

it.each(['parent', 'teacher', 'student'])('routes %s to the existing profile', async role => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { ...session.user, role } });
  await expect(ProfilePage()).rejects.toThrow(`Redirect: /dashboard/${role}/profile`);
});

it('provides a real admin profile and settings link', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue(session);
  render(await ProfilePage());
  expect(screen.getByText('Chief Admin')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Account settings' })).toHaveAttribute('href', '/settings');
});

it('provides settings with appearance and password navigation', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue(session);
  render(await SettingsPage());
  expect(screen.getByRole('combobox', { name: 'Colour theme' })).toBeEnabled();
  fireEvent.change(screen.getByRole('combobox', { name: 'Colour theme' }), { target: { value: 'dark' } });
  expect(setTheme).toHaveBeenCalledWith('dark');
  expect(screen.getByRole('link', { name: 'Change password' })).toHaveAttribute('href', '/change-password');
});

it('requires a session on both account pages', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue(null);
  await expect(ProfilePage()).rejects.toThrow('Redirect: /sign-in');
  await expect(SettingsPage()).rejects.toThrow('Redirect: /sign-in');
});
