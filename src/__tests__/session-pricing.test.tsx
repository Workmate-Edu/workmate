/** @jest-environment jsdom */
import '@testing-library/jest-dom';
jest.mock('next-auth/react', () => ({ useSession: jest.fn(() => ({ data: null })) }));
import { render, screen, fireEvent } from '@testing-library/react';
import { PRICING_DRAFT_KEY } from '@/lib/parent-onboarding';
import { SessionPricing } from '@/components/session-pricing';

beforeAll(() => { Element.prototype.scrollIntoView = jest.fn(); });
beforeEach(() => sessionStorage.clear());
function choose(label: string, option: string) {
  fireEvent.keyDown(screen.getByRole('combobox', { name: label }), { key: 'ArrowDown' });
  fireEvent.click(screen.getByRole('option', { name: option }));
}

it.each([['USD', 'US$7.97'], ['GBP', '£6.90'], ['CAD', 'CA$12.90'], ['NGN', '₦12,000']])('displays the agreed %s lesson price', (currency, display) => {
  render(<SessionPricing />);
  choose('Select your currency', { USD: 'USD - US dollars', GBP: 'GBP - British pounds', CAD: 'CAD - Canadian dollars', NGN: 'NGN - Nigerian naira' }[currency]!);
  expect(screen.getByText(display)).toBeInTheDocument();
  expect(screen.getByText('base rate per student per hour')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Get started for free' })).toHaveAttribute('href', '/sign-up');
});

it('calculates selected subjects, frequency and period in the chosen currency', () => {
  render(<SessionPricing />);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Mathematics' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Yoruba' }));
  choose('Mathematics Sessions/week', '2');
  fireEvent.click(screen.getByRole('radio', { name: /Monthly/ }));
  expect(screen.getByRole('status')).toHaveTextContent('Monthly total: US$81.29');
  expect(screen.getByRole('status')).toHaveTextContent('12 student-hours');
  choose('Select your currency', 'NGN - Nigerian naira');
  expect(screen.getByRole('status')).toHaveTextContent('Monthly total: \u20a6122,400');
  fireEvent.click(screen.getByRole('checkbox', { name: 'Yoruba' }));
  expect(screen.getByRole('status')).toHaveTextContent('Monthly total: \u20a681,600');
});

it('includes students and longer sessions and applies the quarterly discount', () => {
  render(<SessionPricing />);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Mathematics' }));
  choose('Mathematics Students', '2');
  choose('Mathematics Hours/session', '2');
  expect(screen.getByRole('status')).toHaveTextContent('Weekly total: US$31.88');
  fireEvent.click(screen.getByRole('radio', { name: /Quarterly/ }));
  expect(screen.getByRole('status')).toHaveTextContent('Quarterly total: US$306.05');
  expect(screen.getByRole('status')).toHaveTextContent('Savings (20%): US$76.51');
});

it('carries selected plan into registration without trusting amounts', () => {
  render(<SessionPricing />);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Mathematics' }));
  choose('Mathematics Students', '2');
  const link = screen.getByRole('link', { name: 'Get started for free' });
  link.addEventListener('click', event => event.preventDefault());
  fireEvent.click(link);
  expect(JSON.parse(sessionStorage.getItem(PRICING_DRAFT_KEY)!)).toEqual({ currency: 'USD', plan: 'weekly', subjects: [{ subject: 'Mathematics', students: 2, hours: 1, sessions: 1 }] });
});

 it.each(['parent', 'student'])('continues the signed-in %s to their learning plan', role => {
   const { useSession } = require('next-auth/react');
   useSession.mockReturnValueOnce({ data: { user: { role } } });
   render(<SessionPricing />);
   expect(screen.getByRole('link', { name: 'Continue your learning plan' })).toHaveAttribute('href', '/dashboard/learning-plan');
 });
