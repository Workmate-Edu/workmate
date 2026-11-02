import { z } from 'zod';
import { RESIDENCE_COUNTRIES } from './countries';

export const TERMS_VERSION = '2026-10-18';
export const PRIVACY_VERSION = '2026-10-18';
export const TEACHER_CONDUCT_VERSION = '2026-10-18';

export { RESIDENCE_COUNTRIES } from './countries';
export const residenceCountrySchema = z.string().refine(value => RESIDENCE_COUNTRIES.includes(value), 'Country of residence is required');

export function legalRecord(body: any, now = new Date()) {
  return {
    terms: { version: TERMS_VERSION, acceptedAt: now },
    privacy: { version: PRIVACY_VERSION, acknowledgedAt: now },
    marketing: { optedIn: body.marketingOptIn === true, recordedAt: now },
  };
}

export function validateCommonLegalChoices(body: any) {
  if (body.termsAccepted !== true || body.privacyAcknowledged !== true) {
    return 'Accept the Terms and acknowledge the Privacy Policy separately';
  }
  if (!residenceCountrySchema.safeParse(body.residenceCountry).success) {
    return 'Choose your country of residence';
  }
}

export function hasCurrentTeacherConductAcknowledgement(user: any) {
  return user?.legalAcknowledgements?.teacherConduct?.version === TEACHER_CONDUCT_VERSION;
}

export function parentalVerificationAllowsLearning(user: any) {
  if (user?.role !== 'parent') return true;
  return user.emailVerified === true
    && user.isActive === true
    && Boolean(user.legalAcknowledgements?.parentalAuthority?.acknowledgedAt)
    && user.safeguarding?.parentalVerification?.status !== 'rejected';
}
