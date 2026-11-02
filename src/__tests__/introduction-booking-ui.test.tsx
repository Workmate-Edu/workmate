/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { IntroductionBookingPicker } from '@/components/introduction-booking';
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }));
const booking = { slotId: 'original', startTime: '2090-01-01T10:00:00Z', endTime: '2090-01-01T10:15:00Z', meetingLink: 'https://example.com/original' };
const props = { teacherId: 'teacher', ownerId: 'owner', role: 'parent', learner: 0, subjectIndex: 0, booking };
beforeEach(() => { global.fetch = jest.fn(); });
it('cancels through the authenticated booking API', async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
  render(<IntroductionBookingPicker {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel introduction' }));
  await screen.findByText('Booking cancelled.');
  expect(JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)).toMatchObject({ slotId: 'original', action: 'cancel' });
});
it('uses one atomic reschedule request and preserves the old booking on failure', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ slots: [{ _id: 'replacement', startTime: '2090-01-02T10:00:00Z', endTime: '2090-01-02T10:15:00Z' }] }) });
  (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Time no longer available' }) });
  render(<IntroductionBookingPicker {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Reschedule' }));
  await waitFor(() => expect(screen.getAllByRole('button')).toHaveLength(3));
  fireEvent.click(screen.getAllByRole('button')[2]);
  await screen.findByText('Time no longer available');
  expect(JSON.parse((fetch as jest.Mock).mock.calls[1][1].body)).toMatchObject({ slotId: 'original', action: 'reschedule', replacementSlotId: 'replacement' });
  expect(screen.getByRole('link', { name: 'Open introduction meeting' })).toHaveAttribute('href', booking.meetingLink);
});
