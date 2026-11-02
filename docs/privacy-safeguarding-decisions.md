# Privacy and safeguarding decisions still required

Updated 18 October 2026. Internal launch note; do not copy unresolved items into public claims.

## Operator and legal review

- Confirm the contracting/data-controller legal entity, registered address, operator contact details and whether a formally appointed privacy or safeguarding role exists.
- Obtain country-specific review for Nigeria, the UK, US and Canada, including the applicable child-consent/guardian-verification standard, lawful bases, regulator wording, cross-border safeguards and age coverage.
- Approve the Terms and Privacy Policy text and establish a controlled notice-version publication process.

## Safeguarding operations

- Define acceptable evidence, reviewers, separation of duties, response targets and appeal handling for parental verification. The application currently records acknowledgement, holds matching/booking, and provides an admin-only decision endpoint; it does not define the evidence process.
- Name the primary and alternative safeguarding recipients, define escalation outside the ordinary recipient, and connect alerting/queue ownership. The application queue records submissions but does not promise email delivery or 24/7 monitoring.
- Define no-show, post-start cancellation, rematching, teacher-unavailability, incident response, emergency disclosure and law-enforcement procedures.
- Confirm whether lessons may ever be recorded. The current introduction/free-class flow does not implement recording and public wording says so.

## Data lifecycle and requests

- Approve retention periods per category: accounts, child intakes, parental-verification evidence, messages/attachments, bookings/attendance, support and safeguarding cases, teacher applications, payments, logs and backups.
- Define legal holds, deletion/anonymisation mechanics, backup expiry, request identity checks, child/guardian authority checks, exports and completion records. Do not add automatic deletion until these rules are approved and tested.
- Assign authorised roles for ordinary support, privacy requests, safeguarding cases and restricted escalations. The current API is admin-only and needs a reviewed operational UI/workflow.

## Providers and configuration

- Confirm executed terms, data locations, subprocessors and production configuration for Vercel, MongoDB, Zoho Mail, ZeptoMail, Google Meet and Zoom.
- Approve mandatory Google Meet/Zoom host settings and decide whether reusable personal rooms are prohibited technically as well as by policy.
- Inventory production cookies and scripts before enabling analytics or advertising. Consent-dependent tracking must remain disabled until a consent mechanism and vendor list are approved.

## Commercial policies

- Paid cancellation, refund, proration, renewal, chargeback and teacher-payout rules remain unresolved.
- Preserve the payment restrictions in `DEVELOPER-HANDOFF.md`; do not expose paid checkout until server-owned orders and idempotent fulfilment are complete.
