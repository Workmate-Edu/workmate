# WhatsApp Communications Backlog

**Status:** Proposed for product/operations approval; no WhatsApp integration is implemented yet.  
**Scope:** Optional WhatsApp notifications for parents and teachers, alongside email and in-app notifications. WhatsApp is not a replacement for transactional email.

## Recommendation

Start with operational messages that help families attend lessons and resolve service issues. Do not use WhatsApp for every email, duplicate private chat conversations, or send promotional broadcasts in the first release. Keep email as the dependable channel for account verification, password reset, receipts/records, and users who do not opt in. Keep in-app notifications and direct app messaging as the source of truth for platform activity.

Use the official WhatsApp Business Platform through Meta or an approved business solution provider (BSP). Do not automate a personal WhatsApp account. Confirm destination-country availability, template rules, opt-in requirements, pricing, sender identity, and support responsibilities before selecting a provider.

## Candidate message backlog

| Priority | Event / recipient | Recommendation | Notes / acceptance criteria |
|---|---|---|---|
| P1 | Upcoming lesson reminder — parent/guardian; teacher separately | Include in first release | Send only when the recipient has opted in. Proposed schedule: 24 hours and 1 hour before a lesson, configurable. Include local date/time, tutor/learner first name as appropriate, and a secure link back to the app. Never put a meeting link in a broadly visible notification by default; use an authenticated app link. |
| P1 | Lesson booked, rescheduled, or cancelled — parent/guardian and teacher | Include in first release | Send only for confirmed changes, not while a booking is provisional. State the new/cancelled time and next step. Suppress stale reminders after edits/cancellation. |
| P1 | Tutor assigned / match ready — parent/guardian; teacher | Include if assignment is an important waiting-state | Notify the parent that a match is ready and direct them to the app. Avoid sharing child assessment details. Do not send to the child directly. |
| P2 | Payment success / subscription expiry — paying parent/account holder | Optional | Email remains the receipt/record. WhatsApp can provide a brief confirmation or an advance expiry heads-up, without payment credentials or sensitive account details. Avoid duplicate noise if the user already receives effective email/in-app notices. |
| P2 | Lesson completed / feedback request — parent/guardian or adult learner | Test only after feedback flow is reliable | Link to the appropriate session feedback screen; avoid asking for sensitive learner details in WhatsApp. Respect frequency caps. |
| P2 | Tutor payout processed — teacher | Optional | Send only after payout state is durably recorded; do not claim a payout completed based only on a request being submitted. |
| Exclude initially | Password resets, verification codes, assessment results, private messages, marketing blasts, direct messaging to minors | Do not implement in first release | Keep account security on email/authenticated flows. Do not copy private conversation content to WhatsApp. Promotional messaging requires separate approval, consent and policy review. |

## Implementation backlog

### W0 — Policy and consent (blocking)

- Decide eligible recipients: parent/guardian for child accounts; teacher for teacher operational notices; adult independent learner may opt in for their own account. No direct WhatsApp to child accounts in the initial release.
- Add explicit, purpose-specific WhatsApp opt-in, timestamp, source, phone number, phone verification status, and opt-out/suppression state. A phone number collected at signup is not WhatsApp consent.
- Provide clear opt-in and opt-out controls in profile/settings and record changes for audit. Handle STOP/unsubscribe requests and provider delivery/opt-out webhooks; suppress immediately. Do not silently re-subscribe users.
- Obtain operational/legal review for applicable privacy, child-safeguarding, and messaging requirements in the countries served. Define retention and who can view message logs.
- Approve message wording, sender display name, supported regions, quiet hours, language, escalation/support owner, and a per-user frequency cap.

**Acceptance:** no WhatsApp message can be sent without current consent, a verified eligible recipient number, an approved use case/template where required, and passing suppression/quiet-hour checks.

### W1 — Reliable notification delivery foundation (blocking)

- Implement a server-side notification dispatcher and durable outbox/queue. Record event, recipient, channel, template/version, consent decision, provider message ID, attempt count, status, timestamps, and sanitized failure reason.
- Make sends idempotent by event + recipient + channel + reminder occurrence. Retries must not send duplicate messages; failed delivery must not undo the underlying booking/payment/session state.
- Process provider delivery, failure, and inbound opt-out webhooks securely. Add retry/backoff, dead-letter/manual review, rate limits, metrics, and a safe way to disable the channel.
- Separate notification persistence from delivery. Current notification `delivery` flags are metadata, not proof that email/push was sent; correct the semantics or replace with per-channel delivery records.

**Acceptance:** duplicate API/webhook/cron events produce one logical notification; provider outages leave an auditable retry state; disabling WhatsApp leaves existing email/in-app flows working.

### W2 — Session notices and reminders (first value release)

- Implement booking/reschedule/cancellation notices and upcoming-session reminders against the canonical session state.
- Replace the placeholder in [session reminder worker](../src/workers/session-reminder.ts). Schedule frequent enough to support the agreed reminder windows; the current daily cron is not adequate for a 1-hour reminder.
- Use each session's stored timezone or the recipient's selected timezone consistently. Re-check session status/time immediately before sending; cancel obsolete queued notices after changes.
- Correct silent session updates in [teacher session update route](../src/app/api/teacher/sessions/[id]/update/route.ts) by generating a notification event after the update is committed.
- Add tests for timezone boundaries, DST, reschedule/cancel, recurring sessions, duplicates, opt-out, provider failures, and delivery-time changes.

**Acceptance:** opted-in parent and teacher receive only applicable notices once, at the configured local times; cancelled/rescheduled sessions do not receive stale reminders; app state remains correct if delivery fails.

### W3 — Tutor assignment and optional account lifecycle notices

- Add parent/teacher assignment notices after an assignment is durably saved.
- Consider payment confirmation and subscription-expiry heads-up only after W1 reliability is in place. Email remains the receipt and canonical record.
- Ensure notices are sent from one shared, replay-safe event path so webhook and browser-return payment processing cannot generate duplicates.

**Acceptance:** only intended recipients receive minimal notices, repeated fulfilment cannot duplicate them, and message text never exposes child assessment or payment-sensitive data.

### W4 — Pilot, measure, and expand cautiously

- Run a small opt-in pilot with staff and a small parent/teacher cohort before general availability.
- Measure opt-in rate, sent/delivered/failed rates, reminder-to-attendance change, opt-outs/complaints, and provider cost per active family. Do not use message opens as a success proxy.
- Review failures and user feedback; add review requests/payout notices only if they provide meaningful value without excess frequency.
- Consider marketing communication only as a separate consent, template, and compliance workstream—not as an extension of operational opt-in.

**Acceptance:** agreed reliability, cost, opt-out, and support thresholds are met before expansion; rollback/kill switch is tested.

## Existing implementation observations

- Email sending is implemented via ZeptoMail SMTP in [SMTP configuration](../src/lib/smtp.ts); successful delivery is visible in the supplied runtime log. Continue using email for account/security flows.
- In-app notification records exist in [notification model](../src/models/notification.ts), and creation is handled by [notification service](../src/lib/notification-service.ts). Its `email`/`push` delivery fields should not be treated as evidence those channels were dispatched.
- A session reminder endpoint exists, but [the worker](../src/workers/session-reminder.ts) is currently a placeholder. The configured daily schedule cannot satisfy near-term reminders.
- Session creation already attempts email and in-app notifications; session updates currently save without notifying recipients.
- Phone numbers are collected, but the reviewed user model/flows do not provide WhatsApp-specific consent, phone verification, or opt-out handling.
- No transactional WhatsApp integration was found. The existing WhatsApp link is for user-initiated blog sharing only.

## Out of scope for the first release

- Replacing app messaging with WhatsApp or mirroring conversation content.
- Direct messaging children/learners who may be minors.
- Sending passwords, one-time codes, assessment outcomes, detailed progress reports, or sensitive learner data.
- Promotional campaigns, automated tutor marketing, and bulk broadcasts.
- Treating WhatsApp delivery as guaranteed; users must still be able to find essential information in the app/email.
