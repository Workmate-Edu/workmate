# Workmate relaunch handoff

## Completed work

- Public signup supports parent, independent-adult learner and teacher accounts. It records residence country, versioned legal acknowledgements, optional marketing consent and role-specific authority or conduct acknowledgements. Independent learner signup is restricted to adults.
- Signup uses field-title-specific validation messages, a top-centre toast and red labels/borders on the exact invalid control or grouped section. Parent learner name, age, subjects and learning-goal errors are marked individually. International phone numbers are normalized and validated on both client and server.
- Country of residence uses the shared `BrandDropdown` with all 249 ISO country codes. Flags use the bundled phone-input sprite with image/code fallbacks; search remains disabled.
- Parent onboarding collects each child’s name, age 6–16, derived age band, level, subjects and goals. Independent learners collect equivalent learning details plus broad availability preferences. Pricing-page selections can prefill the existing onboarding draft.
- Matching runs per learner and subject. Users can shortlist one to three approved teachers, book a 15-minute introduction with each, select one teacher after all selected introductions are completed, and book one free 6" to be conise0-minute class for that learner and subject.
- Teacher availability, booking, cancellation, rescheduling and completion use guarded server operations. Booking changes create in-app notifications in the same transaction.
- New and edited onboarding records receive server-owned learner IDs. The guarded migration utility is read-only unless `--apply` is supplied and updates only learner identities when the stored intake has not changed.
- Parent matching and trial booking are gated by an administrator-recorded parental-verification decision. A guardian acknowledgement is stored as pending and is not presented as verified consent.
- Newly verified parents default to `/dashboard/learning-plan` after sign-in unless a validated internal callback is present. The parent dashboard shows the persisted next Learning Plan action, and parent/student navigation places Your Learning Plan immediately after Dashboard.
- Signup emails use the shared branded renderer and include the full clickable verification URL below the verification button. Password-reset emails also include a fallback URL.
- Shared buttons support a disabled loading state. Public navigation CTAs show `Loading...` and prevent repeated activation while navigation is pending.
- Public Privacy, Terms, Safety, About and Contact pages use application-grounded wording. Support, privacy and safeguarding submissions are stored in a restricted queue and return a reference.
- Public signup, teacher discovery, messaging, realtime, booking and diagnostic routes have role/ownership checks. Email/database diagnostics require an administrator session; the email diagnostic is POST-only and self-addressed.
- Public pricing uses fixed hourly prices of USD 7.97, GBP 6.90, CAD 12.90 and NGN 12,000, with weekly, four-week monthly (15% discount) and twelve-week quarterly (20% discount) calculations.
- The payment-return page follows the server verification redirect. A server-owned `PaymentOrder` foundation exists, but it is intentionally not connected to checkout or fulfilment.

## Key files

- Signup and validation: `src/app/api/auth/sign-up/route.ts`, `src/components/auth/parent-sign-up-form.tsx`, `src/components/auth/student-sign-up-form.tsx`, `src/components/auth/teacher-sign-up-form.tsx`, `src/components/auth/child-learning-step.tsx`, `src/components/auth/legal-consent-fields.tsx`, `src/lib/signup-validation.ts`, `src/lib/phone-number.ts`, `src/lib/legal-consent.ts`.
- Countries and dropdowns: `src/lib/countries.ts`, `src/components/ui/brand-dropdown.tsx`.
- Onboarding and matching: `src/lib/parent-onboarding.ts`, `src/app/api/learning-plan/route.ts`, `src/app/api/learning-plan/matches/route.ts`, `src/app/dashboard/learning-plan/page.tsx`, `src/components/learning-request-form.tsx`, `src/components/teacher-shortlist.tsx`, `src/lib/learning-progress.ts`.
- Scheduling and free-class policy: `src/app/api/introductions/route.ts`, `src/lib/introduction-booking.ts`, `src/lib/change-introduction-booking.ts`, `src/lib/scheduling.ts`, `src/lib/free-lesson-policy.ts`, `src/lib/booking-notifications.ts`, `src/models/introduction-slot.ts`.
- Learner identity: `src/lib/learner-identity.ts`, `src/lib/backfill-learner-identities.ts`, `scripts/backfill-learner-identities.ts`.
- Dashboard entry points: `src/components/auth/sign-in-form.tsx`, `src/components/dashboard/dashboard-nav.tsx`, `src/app/dashboard/parent/page.tsx`.
- Email: `src/lib/render-email.ts`, `email-templates/base-layout.html`, `email-templates/parent-signup.html`, `email-templates/student-signup.html`, `email-templates/teacher-signup.html`.
- Privacy and safeguarding: `src/models/support-request.ts`, `src/app/api/support-requests/route.ts`, `src/app/api/admin/parental-verifications/[ownerId]/route.ts`, `src/app/api/teacher/conduct-acknowledgement/route.ts`, `docs/privacy-safeguarding-decisions.md`.
- Pricing and payments: `src/lib/payments/relaunch-offer.ts`, `src/components/session-pricing.tsx`, `src/lib/payments/order-policy.ts`, `src/lib/payments/create-order.ts`, `src/models/payment-order.ts`, `docs/payment-review-2026-10-16.md`.
- Authorization and realtime: `src/lib/conversation-access.ts`, `src/lib/realtime-token.ts`, `src/lib/socket/secure-server.ts`.

## Important decisions

- The free offer requires no payment: up to three 15-minute introductions per learner/subject, followed by one free 60-minute class with the selected teacher. Trial sessions have no teacher payout.
- The allowance, shortlist and selected teacher are scoped per learner and subject. Changing teachers, reordering subjects or using a subject alias must not create another allowance.
- Parents and independent learners choose their teachers. Administrators may assist through the same rules; there is no customer-facing “arrange for me” path.
- Parents select exact introduction and free-class times only after teacher selection, from published teacher availability. Residence country and phone country code remain separate fields.
- `prioritySubject` is compatibility metadata only. It must not be shown to users or used to gate matching.
- A parent/guardian acknowledgement is not verified parental consent. Pending or rejected parental verification continues to block teacher discovery and trial booking.
- Legal notice versions are application constants dated `2026-10-18`. Material notice changes require a new version and an explicit re-acknowledgement decision.
- Public prices are fixed product prices; no live exchange-rate conversion is used. Displayed pricing/onboarding drafts are not payment entitlements.
- Country selection must use `BrandDropdown`; flags must not depend on platform emoji. Search should return only after live pointer, keyboard and cross-browser verification.
- `DashboardGuide` and `TeacherSelectionGuide` remain in the repository but are not mounted. Do not restore them without an explicit product decision.
- Public copy should present Workmate as the product, not describe it as an MVP or “the current application.”

## Things that should not change

- Do not replace per-learner/per-subject trial claims with account-wide, teacher-based or array-position-based claims.
- Do not require payment before introductions or the free class, and do not grant a second free class after a teacher change.
- Do not let clients control matching state, completion, eligibility, prices, renewal days, ownership or entitlements.
- Do not use Flutterwave metadata, return query parameters or webhook payloads as entitlement authority. Provider data must be checked against a stored server-owned order.
- Do not restore public administrator signup or weaken messaging, realtime, teacher-directory or booking authorization.
- Do not bypass parental verification, describe acknowledgement as verified consent, or expose learner/teacher contact details through discovery APIs.
- Do not infer learner identity from names or automatically link onboarding learners to legacy child accounts.
- Do not enable automatic retention deletion until record-specific periods, legal holds and preservation rules are approved.
- Preserve the dirty working tree and existing prepaid rights; do not reset, overwrite, commit, push or deploy without explicit instruction.

## Verification results

- `src/__tests__/email/branding.test.ts`: 43 tests passed on 24 October 2026, including visible clickable fallback verification URLs in all signup templates.
- Six focused signup/onboarding suites: 32 tests passed on 25 October 2026. Coverage included field-title errors, exact learner-control highlighting, phone validation, country selection, parent onboarding and server-side parent signup intake.
- Current source inspection confirmed that Your Learning Plan occurs once directly after Dashboard for parent/student navigation, parent sign-in uses a validated internal callback before its Learning Plan default, and dashboard-guide components have no render site.
- A current `npx tsc --noEmit` run is not green. It reports existing typing errors in legacy and active signup form code. `next.config.js` sets `typescript.ignoreBuildErrors: true`, so a Next.js build does not establish type safety.
- No live SMTP delivery, Flutterwave sandbox payment, staging migration, desktop/mobile visual, keyboard or screen-reader verification has been completed for this handoff.

## Unresolved issues

- Payment is not safe to expose. Initialization still calculates legacy USD 5 pricing; verification trusts browser-originated provider metadata and renewal days; return and webhook fulfilment differ and are not idempotent. The unused `PaymentOrder` model is USD-only and keyed to legacy child user IDs.
- Existing onboarding records still need a reviewed dry run, backup and controlled learner-ID backfill in the target environment before payment work relies on those identities.
- Paid entitlements do not yet enforce purchased hours, frequency, learner, subject and selected teacher. Cancellation, refund, proration, renewal, chargeback and paid teacher-payout policies remain undecided.
- Trial booking confirmation emails and scheduled reminders are not implemented; current booking notifications are in-app only.
- Self-service rematching, no-show, post-start cancellation and teacher-unavailability policies/workflows are not implemented.
- Operator/controller identity, address, jurisdiction-specific child-consent basis, retention schedule, safeguarding recipients/response targets and the final provider inventory remain awaiting product/legal approval.
- The support/safeguarding/privacy queue and parental-verification endpoint have no staff UI, assignment workflow, evidence handling, expiry/reverification process or auditable resolution workflow.
- Browser/mobile and assistive-technology QA remains outstanding. Country fallback flags rely on a remote image asset for codes missing from the bundled sprite and still need live cross-browser verification.
- Full TypeScript remains red. Legacy payment verification also contains verbose provider/user logging, and the broader sensitive-log audit remains incomplete.

## Next step

1. Approve the open operator/legal, safeguarding-recipient, retention and parental-verification decisions in `docs/privacy-safeguarding-decisions.md`; then implement the restricted staff workflows and complete real-browser parent, independent-learner and teacher journey QA without weakening the guardian gate.
2. Before reconnecting checkout, back up the target data, review and apply the guarded learner-ID backfill, replace legacy payment entry points with a server-owned multi-currency order and one idempotent transactional fulfilment service, then test all enabled currencies in Flutterwave sandbox.
