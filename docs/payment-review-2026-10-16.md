# Payment review — 16 October 2026

## Decision

The trial booking journey can operate without payment. Do not connect its continuation CTA to the legacy checkout until the issues below are resolved. The CTA currently offers price review and contact with the team. Existing payment endpoints remain active in code; this review does not disable them or make them safe. No deployment, live payment or provider configuration change was made.

## Agreed commercial policy

- Fixed per-student hourly rates: USD 7.97, GBP 6.90, CAD 12.90, NGN 12,000. No exchange-rate conversion.
- Weekly: 1 week, no discount. Monthly: 4 weeks, 15%. Quarterly: 12 weeks, 20%.
- Per-subject quantities: students, hours per session, sessions per week. Default lesson length is 60 minutes.
- Up to three 15-minute teacher introductions, then one free 60-minute class per eligible learner per subject. No charge or teacher payout for these trial sessions.
- Displayed plan estimates are not evidence of an active recurring billing agreement.

## Findings from current code

| Priority | Evidence | Consequence / required fix |
| --- | --- | --- |
| Critical | `src/app/api/payment/verify/route.ts` takes owner, children, subjects, plan and extra renewal days from provider metadata originally supplied by the browser. It does not compare against a stored expected order. | Server must create and own the purchase snapshot; provider metadata must never grant access. Verify reference, amount, currency and transaction ID against that snapshot. Check purchaser ownership of every learner. |
| Critical | `src/app/api/payment/webhook/route.ts` trusts the event after a hash check, creates a transaction and updates user status without re-querying verification or creating the same subscription as the return handler. | A customer closing the browser can receive different access. Use one transactional fulfilment service for both entry points, with provider verification and idempotency. |
| Critical | Return verification writes several documents separately and has no fulfilled-order guard. Transaction upsert alone does not prevent subscription processing on replay. | Concurrent callback/webhook/retry must grant a purchase exactly once and recover safely after failures. Preserve existing prepaid rights. |
| High | Initialize computes at USD 5; main calculator sends its own USD 7.97 total and browser-created metadata. Old PaymentForm and PaymentButton also retain USD 5; no current imports of those two components were found. | Consolidate all entry points. Use the four fixed rates and shared plan discounts on the server. Remove unreachable obsolete paths as part of migration. |
| High | PaymentOrder supports only USD and references child User ObjectIds; its service is unused. Onboarding children currently live in locked intake arrays. | Introduce durable learner identities or an explicit verified mapping before using trial learners as paid beneficiaries. Never infer identity by matching a child's name. Extend immutable order snapshots to all four currencies and AI. |
| High | Subscription subject schema stores names, child IDs and dates, but not purchased hours/frequency or selected teacher. | Store and enforce purchased quantities and learner/subject/teacher associations. An active status alone must not permit unlimited lessons. |
| High | Renewal accepts browser `daysLeft`; subscription overall dates are calculated before merging untouched subjects. | Calculate remaining entitlement from server data and preserve unrelated subjects and existing prepaid periods. Decide the policy for plan changes before implementing proration. |
| High | Payment return UI ignored the server outcome and trusted query-string `status`. | Fixed in this change: navigate to the verification endpoint and follow its redirect. The underlying verification defects above remain. |
| Medium | Return verification logs complete provider responses, transaction and user documents. | Remove sensitive verbose logs when replacing the handler; retain reference IDs and sanitized operational errors. |
| Medium | Email delivery and payment processing are not backed by a retryable outbox. | Save notification jobs with durable payment fulfilment; retry separately, without treating notification failures as failed payments. |

## Implementation sequence

1. Resolve learner identity linkage between onboarding and existing child accounts. Preserve trial history and avoid duplicate child accounts.
2. Create an authenticated server quote/order endpoint using the approved rate table and plan calculator, verified learner ownership, selected teacher and immutable line items. Store amounts in minor units, currency, price version and plan duration.
3. Initiate checkout from the saved order. Confirm collection/settlement availability for USD, GBP, CAD and NGN in the merchant account and test environment. This review has not verified account capabilities or fees.
4. Implement one provider-verification and transaction-backed fulfilment service. Bind unique provider transaction/reference, grant once, preserve existing entitlements, and flag unmatched/overpaid/historical payments for review.
5. Wire both return and authenticated webhook paths to that service. Persist retryable notification jobs. Remove browser-controlled renewal days and entitlement metadata.
6. Wire the completed-trial continuation screen to order review, then checkout. Free classes stay independent of payment.
7. Test duplicate/reordered webhook and return calls, browser abandonment, wrong amounts/currencies/references, learner ownership, renewal preservation, interrupted writes and pending payments. Run sandbox checks in every enabled currency before deployment.

## Still needed for launch beyond core trial booking

- Real browser/mobile walkthrough and accessibility checks. No browser visual verification was performed here.
- Email confirmations and scheduled reminders for trial bookings; this change adds durable **in-app** notifications only, with UTC timestamps and directions to localized booking details.
- Operational handling for unavailable shortlisted teachers, no-shows and schedule changes after a slot begins. Current UI directs users to the team; it does not award another free allowance.
- Refund/cancellation and paid teacher-payout policy must be settled before implementing automated refunds or paid earnings.

## Provider references checked

- https://developer.flutterwave.com/docs/transaction-verification — verify status, reference, currency and expected amount before granting value.
- https://developer.flutterwave.com/v3.0.0/docs/webhooks — verify critical data through the API even after accepting an authenticated event; design for retries.

Local verification: 104 targeted tests passed across nine suites, including isolated replica-set booking races, atomic notifications, free lesson claims, onboarding progress and existing order-policy tests. These are not end-to-end provider sandbox tests and do not certify the legacy payment handlers.
