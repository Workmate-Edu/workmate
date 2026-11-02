/** @jest-environment jsdom */
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LegalConsentFields } from '@/components/auth/legal-consent-fields';

function CountryField() {
  const [country, setCountry] = useState('');
  return <LegalConsentFields
    register={() => ({})}
    role="parent"
    residenceCountry={country}
    onResidenceCountryChange={setCountry}
  />;
}

beforeAll(() => {
  class TestPointerEvent extends MouseEvent {
    pointerType: string;

    constructor(type: string, properties: MouseEventInit & { pointerType?: string }) {
      super(type, properties);
      this.pointerType = properties.pointerType || '';
    }
  }
  Object.defineProperty(window, 'PointerEvent', { configurable: true, value: TestPointerEvent });
  Element.prototype.scrollIntoView = jest.fn();
  HTMLElement.prototype.hasPointerCapture = jest.fn(() => false);
  HTMLElement.prototype.setPointerCapture = jest.fn();
  HTMLElement.prototype.releasePointerCapture = jest.fn();
});

it('opens the standard country dropdown and selects a country', () => {
  render(<CountryField />);
  const dropdown = screen.getByRole('combobox', { name: 'Country of residence' });
  expect(dropdown).toBeEnabled();
  expect(dropdown).toHaveClass('cursor-pointer', 'border-input', 'bg-background');
  fireEvent.pointerDown(dropdown, { button: 0, pointerType: 'mouse' });
  expect(screen.queryByPlaceholderText('Search countries...')).not.toBeInTheDocument();
  const japan = screen.getByRole('option', { name: 'Japan' });
  expect(japan.querySelector('[data-country-flag="JP"]')).toHaveClass('flag', 'jp');
  fireEvent.click(japan);
  expect(dropdown).toHaveTextContent('Japan');
  expect(dropdown.querySelector('[data-country-flag="JP"]')).toBeInTheDocument();
});

it('uses an image flag for territories missing from the bundled sprite', () => {
  render(<CountryField />);
  fireEvent.keyDown(screen.getByRole('combobox', { name: 'Country of residence' }), { key: 'ArrowDown' });
  const antarctica = screen.getByRole('option', { name: 'Antarctica' });
  const flag = antarctica.querySelector<HTMLImageElement>('[data-country-flag="AQ"]');
  expect(flag).toHaveAttribute('src', expect.stringContaining('emoji-datasource-twitter'));
});

it('highlights the permissions section and exact consent with an error', () => {
  render(<LegalConsentFields
    register={() => ({})}
    errors={{ termsAccepted: { message: 'Accept the Terms of Service' } }}
    role="parent"
    residenceCountry="NG"
    onResidenceCountryChange={() => {}}
  />);
  expect(screen.getByRole('group', { name: 'Privacy and permissions' })).toHaveClass('border-destructive');
  const terms = screen.getByRole('checkbox', { name: /I accept the/i });
  expect(terms).toHaveAttribute('aria-invalid', 'true');
  expect(terms.closest('label')).toHaveClass('border-destructive', 'text-destructive');
});
