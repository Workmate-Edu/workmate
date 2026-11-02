# Payment integrity implementation

> Current review: [16 October 2026 payment review](payment-review-2026-10-16.md). That review supersedes historical unresolved offer, currency, scope and discount notes below. Core trial booking is now implemented; checkout remains unintegrated with the new policy.

## Plan calculator clarification — 11 October 2026

The user confirmed retaining weekly, monthly (4 weeks, 15% discount), and quarterly (12 weeks, 20% discount) plans. Each subject supports student count, hours per session and sessions per week. Default duration is one hour; longer lessons are allowed. Fixed currency amounts are therefore per-student hourly base rates. Public calculator now uses shared `quoteLearningPlan`: sum hourly rate × students × hours × weekly frequency, multiply by plan weeks, apply discount once and round the final currency total. Controls preserve previous bounds (1–10 students, 1–4 hours, 1–5 sessions/week). Trial structure is unchanged. This supersedes earlier unresolved discount/one-hour-only notes. Checkout fulfilment remains unintegrated; the public page presents plan estimates, not an active recurring-payment promise.

## Approved fixed prices — current policy

The latest user decision supersedes all FX and discounted-offer discussion below: one paid 60-minute lesson costs **USD 7.97, GBP 6.90, CAD 12.90 or NGN 12,000**. These are fixed regional selling prices; no exchange-rate API is needed at checkout. `relaunch-offer.ts` stores them in minor units with version `relaunch-fixed-prices-v2` and exposes `quotePaidLessons`. The old five-lesson discount calculation has been removed from that module.

The user also confirmed 15 minutes per introductory teacher (three teachers per subject), followed by one free 60-minute lesson after selection, replacing the five discounted lessons entirely. Trial payouts are zero by teacher agreement. Constants record this structure; trial booking/consent/eligibility persistence is not implemented. Sibling/account scope still needs an explicit rule before granting allowances.

This policy is tested but still not wired to live checkout. Existing legacy calculator/subscription flows and the legacy order service remain unchanged. Integrate the fixed-price policy with server-owned orders, immutable price snapshots, shared fulfilment and separate trial authorization before exposing these as working checkout currencies. Admin price editing is not built yet.

## Latest revision: teacher selection trials (supersedes offer discussion below)

The user now wants a subject introduction involving three teachers, parent/child selection of a teacher, then one free 60-minute lesson with the chosen teacher. Teachers agree to provide these trial lessons without a Workmate payout. Participation is per new parent/child trial, not a teacher's lifetime allowance; having taught other families must not exhaust a teacher's ability to offer a new family's trial. Capture teacher consent for the relevant trial arrangement and distinguish trial sessions from paid earning-generating lessons when this is implemented.

Pending clarification: whether the introductory 15 minutes is per teacher or total; whether the free hour is per child, per parent account, or per subject; whether the previous five discounted USD 3.50 lessons are removed entirely (the user referred to them as five free lessons, while the original plan/code describes discounted lessons). Do not activate `relaunch-offer.ts`'s five-discount quote while this revision is pending. It was never wired to checkout.

Provider exchange rates are preferred only if they introduce no additional cost to Workmate. This condition has not been verified for the merchant account. Flutterwave documents processing fees and classifies non-local-currency payments as international for pricing/settlement. Its published transfer-rate API is for transfers, not proof of a checkout FX quote or zero-cost conversion. Confirm actual collection/settlement currencies, available rate mechanism and fee allocation before implementation. No paid FX service or provider conversion has been enabled.

References: https://flutterwave.com/mw/support/pricing/pricing-for-receiving-payment and https://developer.flutterwave.com/v3.0/docs/transfer-rates

## Confirmed relaunch rules (latest user update)

- Lessons are 60 minutes.
- Payment currency choices are USD, GBP, CAD and NGN (naira equivalent for those choosing it).
- Introductory eligibility is for new registrants/first-time users. One first-time offer applies across subjects and tutors; using another subject must not restart it.
- The marketing offer remains five lessons at USD 3.50, then USD 7.

`src/lib/payments/relaunch-offer.ts` now implements the isolated USD quote calculation with a single supplied allowance, including consumed/reserved lessons, 60-minute enforcement and refusal to quote unverified eligibility. It declares the four currency choices but rejects non-USD quotes until pricing/rate configuration is approved. This is not yet a persistent eligibility ledger or an atomic reservation system, and no checkout calls it.

Still pending: whether the allowance belongs to each student or the whole purchasing account; GBP/CAD fixed prices versus USD conversion and the exchange-rate source (including NGN); precise historical eligibility/duplicate-account checks; purchasing format, stacking and cancellation/refund rules. Two clarifying questions about allowance scope and currency pricing have been sent. Do not default unanswered choices.

## Completed foundation (not active checkout)

`src/lib/payments/order-policy.ts` validates the primary calculator's existing weekly/monthly/quarterly purchase shape, calculates USD cents at $7.97/hour with the existing 15%/20% discounts, rejects duplicate student/subject combinations and limits numeric inputs to the calculator's bounds. Client amounts, currencies, user IDs and renewal days cannot override the quote. This compatibility snapshot is not approval of the relaunch commercial policy.

`src/lib/payments/create-order.ts` loads the authenticated purchaser's role and children from the database before creating a versioned order. The internal service is not exposed as an API and is not called by checkout yet. `PaymentOrder` stores the expected price, currency, subjects, owner and duration with immutable Mongoose fields, unique references and a unique partial provider-transaction index. These declarations still require index verification at deployment; no production index/data changes were performed.

The reconciliation function accepts only successful verified provider results matching the expected reference, transaction ID, currency and exact amount. It does not return provider metadata as entitlements. Exact overpayments are sent for review by the future caller rather than automatically granting extra access. Reference: https://developer.flutterwave.com/docs/transaction-verification

## Required before activation

1. Confirm relaunch lesson duration, eligibility, purchasing format, discount stacking, payout currency, cancellation/no-show/refund policy and legacy rights. User questions about the core offer have been raised; no unanswered question is treated as approval.
2. Integrate all checkout entry points, including the older $5 payment form/button. Remove client-controlled amounts and metadata from entitlement decisions. Do not switch only the main calculator while leaving legacy callbacks incompatible.
3. Implement one transaction-backed fulfilment service shared by the return verifier and authenticated webhook. Reverify provider data; bind the stored order; atomically record payment, grant entitlements and transition state. Retry/replay must not extend access twice or lose writes. Preserve existing prepaid rights; calculate remaining time from stored subscriptions, not `daysLeft` from the browser.
4. Define handling for payments initiated before migration and unmatched/overpaid orders. Persist a retryable email outbox after durable entitlement writes. Do not label a received payment failed solely because notification delivery failed.
5. Test concurrent and reordered webhook/return processing, browser abandonment, mismatched amounts, child ownership, legacy migration and refunds against a replica-set test database and provider sandbox.

The existing live initialization/verification/webhook handlers have not been changed in this stage. Their previously documented integrity defects remain until the shared path is integrated and tested. No live payment, provider call with credentials, or production mutation was performed.
