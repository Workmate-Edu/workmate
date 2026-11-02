/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { LoadingLinkButton } from '@/components/ui/loading-link-button';
import { Button } from '@/components/ui/button';

jest.mock('next/navigation', () => ({ usePathname: () => '/' }));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));

it('disables repeat navigation and displays loading feedback after activation', () => {
  const onNavigate = jest.fn();
  render(<LoadingLinkButton href="/sign-up" onNavigate={onNavigate}>Get started for free</LoadingLinkButton>);

  const link = screen.getByRole('link', { name: 'Get started for free' });
  fireEvent.click(link);

  expect(screen.getByRole('link', { name: 'Loading...' })).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(screen.getByRole('link', { name: 'Loading...' }));
  expect(onNavigate).toHaveBeenCalledTimes(1);
});

it('disables a standard async button while displaying its loading label', () => {
  render(<Button loading loadingText="Saving...">Save</Button>);
  const button = screen.getByRole('button', { name: 'Saving...' });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
});
