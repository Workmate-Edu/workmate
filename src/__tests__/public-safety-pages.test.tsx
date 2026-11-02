/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import PrivacyPage from '@/app/privacy/page';
import TermsPage from '@/app/terms/page';
import SafetyPage from '@/app/safety/page';
import AboutPage from '@/app/about/page';
import ContactPage from '@/app/contact/page';

beforeAll(() => { Element.prototype.scrollIntoView = jest.fn(); });

it.each([
  [PrivacyPage, 'Privacy Policy'],
  [TermsPage, 'Terms of Service'],
  [SafetyPage, 'Safety and safeguarding'],
  [AboutPage, 'Come, Gather Under Our Digital Baobab'],
] as const)('renders one accessible primary heading for %p', (Page, heading) => {
  const { unmount } = render(<Page />);
  expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  unmount();
});

it('explains the child safeguarding journey without overstating external controls', () => {
  render(<AboutPage />);
  expect(screen.getByRole('heading', { name: 'Safeguarding is part of the journey' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'A guardian-managed journey' })).toBeInTheDocument();
  expect(screen.getByText(/matching and trial booking stay paused/i)).toBeInTheDocument();
  expect(screen.getByText(/teachers remain responsible for the controls/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Report a safeguarding concern' })).toHaveAttribute('href', '/contact');
});

it('allows a guardian to attend without allowing meeting-link sharing', () => {
  render(<SafetyPage />);
  expect(screen.getByText(/parent or guardian managing the child.*may join an introduction or class/i)).toBeInTheDocument();
  expect(screen.getByText(/do not share the meeting link/i)).toBeInTheDocument();
});

it('keeps monetary prices out of the Terms and directs users to Pricing', () => {
  render(<TermsPage />);
  expect(screen.getByRole('link', { name: 'Pricing page' })).toHaveAttribute('href', '/pricing');
  expect(screen.queryByText(/USD 7\.97|GBP 6\.90|CAD 12\.90|NGN 12,000/)).not.toBeInTheDocument();
});

it('provides labelled support fields, escalation guidance and an announced result area', () => {
  render(<ContactPage />);
  expect(screen.getByRole('heading', { level: 1, name: /Support, safeguarding and data requests/ })).toBeInTheDocument();
  expect(screen.getByLabelText('Name')).toBeRequired();
  expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  const requestType = screen.getByRole('combobox', { name: 'Request type' });
  expect(requestType).toHaveTextContent('General support');
  expect(screen.getByLabelText('Message')).toBeRequired();
  expect(screen.getByRole('button', { name: 'Submit securely' })).toBeEnabled();
  fireEvent.keyDown(requestType, { key: 'ArrowDown' });
  expect(screen.getByRole('option', { name: /involving the usual contact/ })).toBeInTheDocument();
});
