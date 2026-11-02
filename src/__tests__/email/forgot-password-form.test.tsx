/** @jest-environment jsdom */
import '@testing-library/jest-dom';

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
const originalFetch = global.fetch;
beforeEach(() => { global.fetch = jest.fn().mockResolvedValue({ ok: true }); });
afterEach(() => { global.fetch = originalFetch; jest.useRealTimers(); });

async function submitEmail() {
  render(<ForgotPasswordForm />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'parent@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));
  await screen.findByRole('button', { name: 'Resend in 30s' });
}

it('resends to the original email after the cooldown and confirms success', async () => {
  jest.useFakeTimers();
  await submitEmail();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Check your email');
  expect(screen.queryByText(/Enter your email address/)).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent("We've sent a password reset link to parent@example.com");
  expect(screen.getByRole('button', { name: 'Resend in 30s' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Resend in 30s' }));
  expect(global.fetch).toHaveBeenCalledTimes(1);
  act(() => { jest.advanceTimersByTime(30_000); });
  fireEvent.click(screen.getByRole('button', { name: 'Resend reset link' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent("We've sent another reset link to parent@example.com"));
  expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/auth/forgot-password', expect.objectContaining({
    method: 'POST', body: JSON.stringify({ email: 'parent@example.com' }),
  }));
  expect(screen.getByRole('button', { name: 'Resend in 30s' })).toBeDisabled();
});

it('keeps resend available after failure and prevents duplicate in-flight requests', async () => {
  jest.useFakeTimers();
  await submitEmail();
  act(() => { jest.advanceTimersByTime(30_000); });
  let complete: (value: { ok: boolean }) => void;
  (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
  fireEvent.click(screen.getByRole('button', { name: 'Resend reset link' }));
  expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Sending...' }));
  expect(global.fetch).toHaveBeenCalledTimes(2);
  await act(async () => { complete({ ok: false }); });
  expect(screen.getByRole('alert')).toHaveTextContent("We couldn't send the email");
  expect(screen.getByRole('button', { name: 'Resend reset link' })).toBeEnabled();
  expect(screen.getByRole('status')).not.toHaveTextContent("We've sent another");
});
