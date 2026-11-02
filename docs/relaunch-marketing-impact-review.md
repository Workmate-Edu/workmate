# WorkmateTeam: new-clone review and marketing impact

## Implementation progress — first authorization fixes

Payment foundation: added an internal server-priced legacy order service, immutable order snapshots, and strict verified-payment reconciliation. These are not connected to checkout yet and do not resolve the existing live payment defects by themselves. Offer questions are pending. See `payment-integrity.md` for activation gates and remaining shared-fulfilment work.

Real-time follow-up: shared Socket.IO authentication now uses server-issued, five-minute credentials with conversation checks, saved-message relays and recipient membership checks. Pusher channel authorization is restricted to own-user/private participant channels; typing uses private channels. Client sends now persist before relaying, and expired socket connections refresh credentials and restore authorized rooms. See `realtime-security.md` for deployment, tests and remaining limitations. This supersedes the open socket/channel implementation notes below; staging validation and broader authorization review remain required.

Messaging API follow-up: fetching/sending messages, read receipts, typing notifications, edits and deletion now check conversation participation. Edits additionally bind the message ID to the route's conversation and authenticated sender and exclude deleted messages. Fifteen focused messaging tests pass, including anonymous/nonparticipant denial without writes or broadcasts, legitimate participant typing, and cross-conversation edit protection. Combined with the earlier authorization suite, 29 tests pass. Real-time Socket.IO identity/room checks and Pusher subscription authorization remain open; this change does not establish end-to-end messaging security.

Public signup now rejects roles other than parent/student/teacher before database access. Tutor assignment and eligible-tutor search require an authenticated admin. Session finalization retains existing admin/teacher behavior but requires teachers to own the lesson. Fourteen focused route tests pass with database and email dependencies mocked. Removed the duplicated JSX in payment-button so type checking can proceed beyond parsing.

This is a partial completion of backlog item 1. Full type checking now reveals extensive additional errors (captured locally in `docs/typecheck-relaunch.txt`); it does not pass. Messaging authentication/membership, the remaining access-control audit, payment integrity and completion/earning reliability remain open. WhatsApp review is deferred. Commercial rules still need confirmation before introductory pricing is implemented.

Date: 10 October 2026

Reviewed checkout: `C:/Users/ibrah/Documents/dev/workmate-zeeson`, branch `launch`, commit `9438319` (`timezone and availability`). The checkout was clean before this review. This document is the only change made. No branch switching, application edits, deployments, customer-data mutations, or live payments were performed.

## Executive assessment

The new clone contains a substantial tutoring application. Reuse it. Parent/child accounts, tutor verification, assessments, administrative assignment, teaching sessions, availability/timezones, subscription payments, earnings, materials, blog content and reviews have implementations. That supersedes the earlier review's incomplete-source limitation.

However, the app is currently organized around subscriptions, administrative teacher assignment and teacher-created sessions. The marketing plan promises a simpler parent-led journey: discover a suitable tutor, purchase lessons at an introductory rate, attend reliably, then continue at the regular price. Those are material product and commercial changes.

Recommendation: do not start the paid acquisition test against this implementation yet. Complete a narrow relaunch release covering pricing/payment integrity, parent access to tutors, first-session delivery and measurement. Marketing can prepare content and recruit tutors concurrently. A broad rewrite, new matching algorithm and custom webinar platform are unnecessary for this cohort.

This is a code and test review of the local branch, not a production certification or a rendered mobile usability test. Tutor supply, payment-account configuration, deliverability, deployed version and actual lesson joining remain to be verified in staging. File presence does not establish operational readiness.

## Comparison against the marketing plan

| Marketing requirement | Current implementation | Required change |
|---|---|---|
| Clear affordable tutoring offer on main site | Hero leads with STEM/African languages, discovery-call CTA and generic signup; also addresses adults | Put the parent offer and direct `/sign-up/parent` CTA near the top; keep discovery calls as optional assistance |
| $7/session; $3.50 for first five | Calculator uses $7.97/hour with weekly, monthly and quarterly purchasing; 15% monthly and 25% quarterly discounts | Establish a single server-side offer policy; define session duration; reconcile existing subscriptions and discounts |
| Tutor earns $5/$2.50 per session | Completion route calculates NGN 5,000/hour; earnings model has no explicit currency field | Store agreed payout and currency per purchased lesson; capture tutor agreement; define settlement conversion if paying NGN |
| Simple parent registration | Two-step parent form asks name, email, username, password, gender, phone and parent learning preferences | Prioritize account creation and the child's needs; move nonessential fields later; retain attribution through verification |
| Parent explores and chooses tutors | Parent teacher listing is gated on the parent wanting to learn, using the parent's subjects; admin assignment exists | Provide child-specific approved tutor discovery and an explicit assisted-matching request |
| Book and pay for an actual lesson | Checkout buys subject subscriptions; teacher creates sessions separately | Link student, tutor, slot, price, payment and lesson entitlement; enforce slot/allowance reservations |
| Reliable lesson joining | Teacher scheduling supports custom links, but fallback invents a Google Meet URL | Require a verified real meeting link for the initial release or implement actual meeting creation |
| Session reminders | Cron configuration exists; its worker is a placeholder | Implement, deduplicate and verify reminders; choose scheduling frequency to meet the intended reminder windows |
| First-session feedback and continuation | Child-session rating/comment UI and review API exist; email points to wrong parent session page | Correct deep link; validate ownership/completion; ask tutor fit/joining questions; provide rebook and progress summary |
| Tutor screening and readiness | Verification/rejection/history and subject eligibility implementations exist | Extend with assessment evidence, curriculum/age fit, agreement and bookable availability; enforce consistently |
| Campaign conversion measurement | Admin operational stats exist; no UTM, pixel or funnel-event implementation found in source search | Track parent registrations through first paid and repeat lessons, attributed to source and creative |
| Founder content, webinars and referrals | Blog infrastructure exists; no dedicated webinar/referral funnel found | Reuse content infrastructure and tagged links; add a simple replay/CTA page when assets are ready |

## Findings that must be addressed before launch

### 1. Pricing and entitlement verification are disconnected — P0

Evidence:

- `src/components/pricing-calculator.tsx:186` sets `hourlyRate = 7.97`; lines 32–33 apply plan discounts.
- `src/app/api/payment/initialize/route.ts:21` and `:35` calculate using a rate of 5, without the calculator's plan multiplier/discount. The handler returns a reference but does not save an expected order.
- `src/components/pricing-calculator.tsx:301` passes its own `totalCost` to Flutterwave rather than the API's amount. User, subjects, plan and remaining days are client-supplied metadata.
- `src/app/api/payment/verify/route.ts:46` verifies provider success, but does not reconcile amount, currency and reference against a stored server-approved order. It grants access using returned metadata, including child IDs and `daysLeft`.

Impact: the provider verification proves a transaction succeeded; it does not prove the correct amount was paid for the entitlements being granted. Current UI and API pricing also disagree independently of the new offer.

Required fix: create a validated, persisted order before payment. Authenticate its owner, validate parent-child relationships and tutor/subject/slot eligibility, calculate price on the server, and store currency and entitlement details. Fulfil only after matching verified payment to that order. Never derive purchased access or renewal duration from untrusted checkout metadata. Flutterwave's [verification guidance](https://developer.flutterwave.com/docs/transaction-verification) calls for checking the reference, status, currency and amount before providing value.

### 2. Payment return and webhook do not fulfil consistently — P0

`src/app/api/payment/webhook/route.ts:26` uses `Transaction.create`, while the return verifier upserts by transaction ID and also creates/updates subject subscriptions. The webhook only updates the user's subscription summary. The transaction model declares a unique transaction ID.

Consequences: return and webhook delivery in different orders can produce a duplicate-key failure rather than successful replay handling. A webhook-only success does not create the same subject entitlement. Replaying the return verifier can recompute subscription dates using a new `now` and resend email; upserting the transaction does not make those side effects idempotent.

Use one fulfilment function for both entry points, an atomic processed state keyed by provider transaction/order, recoverable entitlement writes and retryable notifications. Test repeated delivery, reversed delivery order, browser abandonment and delayed events. If a unique index is not present in the database, the schema declaration alone is not a deployed guarantee.

### 3. Authorization gaps affect tutoring operations — P0

- `src/app/api/admin/assign-teacher/route.ts:9` accepts assignments and writes teacher/student relationships without authenticating the caller. `src/middleware.ts` does not match API routes, so the dashboard guard does not cover this endpoint.
- `src/app/api/admin/teachers/eligible/route.ts:14` uses `!session?.user?.role === 'admin'`; this compares a boolean to a string and does not reject unauthorized callers as intended.
- `src/app/api/auth/sign-up/route.ts:151` accepts the requested role directly; the imported `src/models/user.ts:248` permits `admin`. The account is saved at line 269 before role-specific email content is resolved. Thus the later email error for an unsupported signup role does not prevent persistence of that role. Restrict public registration to explicitly allowed roles before any writes; do not rely on the client selector. This review did not attempt privileged signup or prove a production exploit.
- `src/app/api/sessions/[id]/complete/route.ts:22` allows teachers as well as admins to finalize a `teacher-completed` session, without checking teacher ownership. The separate teacher-completion endpoint does check ownership; the finalization endpoint needs its own policy.
- `server/socket.ts:17` trusts client-supplied user IDs; joins and sends do not check conversation membership. Determine whether this socket implementation is deployed, then secure or remove it. Other messaging implementations exist, so this is not a claim that all live messaging uses it.

Require authentication, role checks and resource ownership at each server operation. Add denial tests for anonymous callers, unrelated parents, unassigned teachers and unknown roles. This is consistent with [Next.js route-handler authorization guidance](https://nextjs.org/docs/app/guides/authentication).

### 4. First-session delivery is not yet reliable — P0

`src/app/api/teacher/sessions/route.ts:157` falls back to a random `https://meet.google.com/...` string. Constructing this string does not provision a Google Meet meeting. The teacher form permits the default path when a custom link is not selected.

The session creation handler checks teacher role and subject, but has no checks for assigned student relationship, paid entitlement, approved readiness or conflicting slots before creating sessions. These must be enforced on the server, not assumed from the teacher UI.

`vercel.json` schedules `/api/cron/session-reminders` daily. That endpoint calls `src/workers/session-reminder.ts`, which logs and returns success without finding sessions or sending reminders. Existing email templates are reusable, but scheduled reminders are not implemented by this configured path.

For the first cohort, validated staff/tutor-provided meeting links are a reasonable delivery option. Make the parent experience explicit and test a real authorized join in staging. Add working reminder selection, delivery state, retries and local-time display.

### 5. Tutor payouts need a commercial and reliability update — P0

`src/app/api/sessions/[id]/complete/route.ts:135` pays NGN 5,000 per hour, whereas the plan promises USD 5 standard / USD 2.50 introductory per session. `src/models/earning.ts` stores amount and hours, not currency or an agreed offer snapshot.

The completion route changes status before sending the parent review email and creating the earning. An email failure can leave the session completed without an earning; the next attempt fails the status precondition. Concurrent requests can both pass the initial status check and create earnings because the transition is not conditional and the earning schema has no unique session constraint.

Persist completion and the agreed earning atomically or with a recoverable exactly-once workflow. Send emails after durable writes via a retryable process. Record payout currency/rate, agreement version, offer eligibility, refunds/adjustments and settlement details.

### 6. Parent tutor discovery is aimed at the parent's own learning — P1, required for this campaign

`src/app/api/parent/teachers/route.ts:29` returns no tutors when `interestedInLearning` is false or the parent has no subjects. It filters by the parent's own subjects and does not require tutor verification. `src/app/dashboard/parent/teachers/page.tsx:135` links messaging to `/dashboard/student/messages`, which conflicts with role navigation. The API returns subject strings while the page reads subject objects with `.name`.

Do not require a parent buying lessons for a child to opt into adult learning. Build a child-specific flow that shows approved tutors by subject, curriculum/age fit and availability, with a request-help path when there is no match. Keep adult self-learning separate.

Administrative assignment and subject eligibility are useful foundations after their authorization defects are fixed. The separate `/api/matching` endpoint is not a shortcut: it calls an unimported `auth()` at line 11 and only accepts student role. It needs repair and a data-model review before use.

### 7. Feedback exists, but the end-to-end path has defects — P1

The review request email in `src/app/api/sessions/[id]/complete/route.ts:104` directs parents to `/dashboard/parent/sessions`, the parent's own lessons. Child reviews are implemented at `/dashboard/parent/children-sessions`.

`src/app/api/teacher/reviews/route.ts` requires login for POST but does not check participation, child ownership, session completion or duplicate reviews. Its role mapping treats every non-parent caller as a student. `GET ?teacherId=all` returns review documents without the admin check suggested by its comment. The child-review UI also does not check `response.ok` before marking submission successful.

Fix authorization and error handling, create a uniqueness rule for the permitted reviewer/session combination, and return only appropriate public review fields. Add the plan's tutor-fit, joining-ease and rebooking questions. Direct low ratings and problems into an assigned operations queue, rather than only an average star rating.

### 8. Registration and verification need dependable recovery — P1

The parent form has two steps: basic information and learning preferences. Required username, gender and phone plus adult-learning questions add effort before the parent reaches the child's goal. Use a direct parent CTA; defer nonessential details where feasible and retain a clear next action after verification.

Signup saves the account before attempting email delivery. A send failure returns an error although the account exists, so a fresh signup retry encounters a duplicate. Return a recoverable account-created/pending-verification state and offer resend. In `/api/auth/verify-email`, invalid-token fallback looks for any already-verified account and can report success unrelated to the submitted token. Correct this to avoid false verification feedback and distorted funnel metrics.

### 9. Build and access-rule debt remain — P1

Type checking stops on four syntax errors at `src/components/payment/payment-button.tsx:88–91`, caused by a duplicated trailing JSX fragment. No import of that component was found in the source search, so this does not establish that the main calculator currently crashes; it does block the project type check. More errors may appear after parsing is repaired. `next.config.js` suppresses build type errors.

There are multiple user, auth and transaction model definitions. Consolidate the paths involved in the relaunch first and verify actual stored shapes before migrations. The shared subscription-access helper checks subject inclusion without checking status/expiry; its consumer is the student dashboard. The middleware's `/dashboard/lessons` subscription branch is also inconsistent with its earlier role redirects. Do not infer complete API enforcement from these helpers.

## Product decisions needed before coding the offer

The marketing document explicitly leaves these open. Suggested defaults below are recommendations, not approved rules:

1. Define one session's duration and format. Current code charges by hours and allows varying duration. USD 7 per session is incomplete without a duration.
2. Use five introductory sessions per eligible student across subjects and tutor changes. Siblings have independent allowances; switching tutor does not reset the count. Confirm existing-student eligibility and duplicate-profile handling.
3. Capture versioned tutor consent to both standard and introductory payouts. Only offer eligible participating tutors; define the alternative when a selected tutor declines.
4. Define consumption, cancellation, refund and no-show rules. Reserve discounts during checkout so six simultaneous advance purchases cannot all claim introductory pricing. Release expired/failed holds; restore allowance for eligible refunds; preserve the reservation on reschedule.
5. Decide individual-session versus pack purchasing. The plan does not require paying for all five upfront. Avoid introducing that requirement silently.
6. Decide whether existing 15%/25% plan discounts remain and whether they stack. Preserve previously purchased subscription rights and old transaction prices; introduce a versioned migration rather than replacing existing records.
7. Confirm the initial parent market, currency charged, payout currency and any exchange-rate/fee treatment. Pricing page, checkout and tutor agreement must describe the same economics.

At the plan's rates, the first five lessons produce USD 17.50 in parent payments and USD 12.50 in tutor payouts: USD 5 before fees, refunds, delivery and support. This arithmetic is not net profit. Report paid-parent conversion and continuation, not registration cost alone; comparing USD lesson economics with NGN ad spend requires a dated conversion basis.

## Minimum relaunch architecture

Extend the existing system; do not start a new application.

- **Offer policy:** price, duration, currency, eligibility, limit, payout and agreement version.
- **Student offer ledger:** reserved/consumed/released sessions tied to an enduring student identity and booking, with atomic concurrency control.
- **Order/booking:** parent/student ownership, tutor, subject, UTC time and display timezone, slot hold, agreed parent charge and tutor payout, offer version, payment state and lesson state.
- **Payment fulfilment:** one server-owned path for provider verification, replay protection, entitlement creation and exception recovery.
- **Tutor readiness:** approval, relevant teaching evidence, curriculum/age suitability, availability and accepted agreement, enforced at discovery and booking.
- **Operations:** assigned owner and status for matching requests, payment exceptions, tutor absence, refunds and low feedback. Manual decisions are adequate for 10–20 registrations if they are visible and accountable.
- **Learning continuity:** initial learning goal/baseline, short tutor note after each lesson, parent feedback after the first and a progress/next-step discussion before the regular-price transition.

Avoid making a long diagnostic or a learning-style quiz a required purchase barrier. Let the first tutor-led lesson establish an appropriate baseline. Test local-time presentation and daylight-saving boundaries for the selected parent market; timezone fields existing in the schema do not establish correct scheduling behavior.

## Measurement and marketing surfaces

Improve the current homepage/pricing experience first. Show the ongoing five-session offer, duration, standard rate, how tutor selection works and one clear parent-registration action. The existing role-specific signup route can be reused. Retain the blog for founder/educational content. Add an uncomplicated webinar replay page with the same CTA; a guest webinar should not block launch. Start referrals with tagged links rather than rewards infrastructure.

Add campaign/creative/referral attribution at landing and preserve it through signup, verification and checkout. No UTM/pixel/conversion implementation was found in source searches; this does not rule out external deployment configuration.

Recommended events: landing viewed, parent account created, email verified, child profile completed, tutor viewed, assisted match requested, checkout started, payment succeeded, first lesson completed, feedback submitted and repeat lesson paid. Emit definitive account/payment outcomes from successful server writes, deduplicate retries, and keep child details and learning needs out of ad analytics.

Use an initial export/report rather than a large new dashboard. For each source/creative report spend, unique parent registrations, verified parents, profiles completed, first paying parents, completed first lessons, repeat purchases and unserved requests. Keep registration and verification separate. Reconcile transactions before reporting paid conversions. Report cohort follow-through after the ten-day ad window; later bookings should not disappear from attribution.

## Proposed implementation backlog

| Order | Work package | Owner | Acceptance criterion |
|---|---|---|---|
| 1 | Fix public role validation, assignment/admin checks, session ownership and applicable messaging authorization; remove syntax blocker | Engineering | Negative API tests deny unauthorized callers; type checking runs beyond parser errors and remaining failures are resolved |
| 2 | Confirm offer, duration, eligibility, payout and legacy subscription treatment | Product + education/operations + marketing | One approved rule sheet covers all prices, eligibility and exceptions |
| 3 | Implement server-priced orders, student offer ledger and shared payment fulfilment | Engineering | Correct first-five/sixth pricing; no excess discounts or duplicate fulfilment under concurrent/replayed requests |
| 4 | Repair parent tutor discovery and add slot purchase/assisted matching | Engineering + operations | Parent buying for a child can find an approved available tutor without opting into self-learning |
| 5 | Deliver real meeting links, reminders and reliable completion/earnings | Engineering + tutor operations | Test lesson can be joined; reminders deliver once; email failure cannot lose earnings |
| 6 | Update homepage/pricing, simplify parent entry, fix verification recovery and add attribution | Engineering + marketing | Mobile journey communicates the actual offer and retains campaign source through payment |
| 7 | Repair child feedback flow, add progress/rebook actions and campaign report | Engineering + education + marketing | First-session feedback reaches staff; remaining offer count/next price is clear; report reconciles cohort outcomes |
| 8 | Publish content/replay, run campaign, follow up and review | Marketing + operations | Ready tutor capacity and support cover advertised subjects; campaign review includes lessons and repeat activity |

Calendar estimates should follow the rule decisions and a staging walkthrough. The principal effort is commercial-flow and reliability work, not landing-page styling. Do not label this a quick pricing change. Keep the current `launch` branch context; create implementation branches deliberately when moving from review to fixes.

## Release gates

- Anonymous/non-admin callers cannot assign tutors; public signup cannot persist admin accounts; unrelated teachers/parents cannot access or alter a child's sessions/messages/reviews.
- First five qualifying lessons charge USD 3.50 and the sixth USD 7; the tutor receives the agreed matching payout. Two simultaneous purchases cannot both consume the final introductory slot.
- Two families cannot purchase the same exclusive tutor slot. Tutor/subject changes retain the student's correct remaining allowance; siblings are independent under the agreed rule.
- Failed, abandoned, delayed and duplicated payments, webhook/return order changes, cancellations, refunds and reschedules produce correct access and earnings exactly once.
- Existing prepaid/subscription rights remain usable after migration.
- A mobile parent can register, recover verification, add a child, choose/request a suitable tutor, pay, receive details, join a real lesson, provide feedback and book again.
- Tutor approval, agreement and availability are checked server-side. A missing tutor or failed meeting has a named operational fallback.
- Reminders and parent updates are actually delivered; email failure does not corrupt payment or earning state.
- Campaign events reconcile with account/payment records and distinguish acquisition from retention without exposing child information to advertising tools.

## Validation performed

- Read-only Git inspection: branch `launch`, commit `9438319`, initially clean checkout.
- Source tracing through public home/pricing, parent signup/verification, subscription checkout and payment callbacks, parent teacher discovery, admin assignment/verification, teacher scheduling, completion/earnings, reminders and child reviews.
- `tsc --noEmit --incremental false --pretty false`: failed with four parser errors at payment-button.tsx lines 88–91. These are the first blocking errors, not a count of all remaining type defects.
- Targeted Jest model suites for initial assessments and teacher assessments: **2 suites passed, 8 tests passed**, using in-memory MongoDB. They do not cover pricing, authorization, payments, scheduling or the conversion funnel.
- No browser/device validation, production data inspection, provider transactions or live email tests. No production exploit tests. Launch readiness is not established by this review.

The next engineering milestone is a staging demonstration of one complete parent-to-repeat-booking journey, backed by the commercial and authorization tests above. This review provides concrete fixes and acceptance criteria for that milestone.
