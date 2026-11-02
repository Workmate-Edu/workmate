import { quotePaidLessons, RELAUNCH_OFFER } from '@/lib/payments/relaunch-offer';
const lesson = { subject: 'Mathematics', durationMinutes: 60 };
it.each([['USD', 797], ['GBP', 690], ['CAD', 1290], ['NGN', 1200000]] as const)('quotes the approved fixed %s price', (currency, amount) => {
  const quote = quotePaidLessons({ currency, lessons: [lesson, lesson] });
  expect(quote.unitAmountMinor).toBe(amount);
  expect(quote.amountMinor).toBe(amount * 2);
  expect(quote.currency).toBe(currency);
});
it('removes the five-lesson discount', () => {
  const quote = quotePaidLessons({ currency: 'USD', lessons: Array.from({ length: 6 }, () => lesson) });
  expect(quote.amountMinor).toBe(4782);
  expect(quote.lessons.every(value => value.amountMinor === 797)).toBe(true);
});
it('ignores client prices and free-lesson flags', () => {
  const quote = quotePaidLessons({ currency: 'NGN', amountMinor: 1, free: true, lessons: [{ ...lesson, amountMinor: 0, free: true }] } as any);
  expect(quote.amountMinor).toBe(1200000);
  expect(quote.lessons[0]).not.toHaveProperty('free');
});
it.each([15, 30, 45, 90])('rejects %s-minute paid sessions', durationMinutes => {
  expect(() => quotePaidLessons({ currency: 'USD', lessons: [{ ...lesson, durationMinutes }] })).toThrow();
});
it('rejects unsupported currencies and empty orders', () => {
  expect(() => quotePaidLessons({ currency: 'EUR', lessons: [lesson] } as any)).toThrow();
  expect(() => quotePaidLessons({ currency: 'USD', lessons: [] })).toThrow();
});
it('records the confirmed trial structure separately', () => {
  expect(RELAUNCH_OFFER).toMatchObject({ trialTeachersPerSubject: 3, introductionMinutesPerTeacher: 15, freeLessonsAfterSelection: 1, freeLessonMinutes: 60, trialTeacherPayoutMinor: 0 });
});

it('charges two hourly units for a two-hour paid lesson', () => {
  expect(quotePaidLessons({ currency: 'USD', lessons: [{ ...lesson, durationMinutes: 120 }] }).amountMinor).toBe(1594);
});
