import { z } from 'zod';
export const INTRODUCTION_MS = 15 * 60 * 1000;
export const publishIntroductionSchema = z.object({
  startTime: z.string().datetime(),
  kind: z.enum(['introduction', 'free-lesson']).default('introduction'),
  meetingLink: z.string().url().max(2000).refine(value => {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const approvedHost = host === 'meet.google.com' || host === 'zoom.us' || host.endsWith('.zoom.us');
    return url.protocol === 'https:' && !url.username && !url.password && approvedHost;
  }, 'Use an HTTPS Google Meet or Zoom meeting link'),
});
export function introductionTimes(start: string, now = Date.now(), kind: 'introduction' | 'free-lesson' = 'introduction') {
  const milliseconds = Date.parse(start);
  if (!Number.isFinite(milliseconds) || milliseconds <= now || milliseconds > now + 90 * 86400000 || milliseconds % INTRODUCTION_MS !== 0) {
    throw new Error('Choose a future 15-minute slot within the next 90 days');
  }
  return { startTime: new Date(milliseconds), endTime: new Date(milliseconds + (kind === 'free-lesson' ? 60 * 60000 : INTRODUCTION_MS)) };
}
export function overlaps(a: { startTime: Date | string; endTime: Date | string }, b: { startTime: Date | string; endTime: Date | string }) {
  return new Date(a.startTime).getTime() < new Date(b.endTime).getTime() && new Date(a.endTime).getTime() > new Date(b.startTime).getTime();
}
