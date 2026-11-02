## Dashboard entry points (2026-10-16)

Parent overview and My Teachers now show a branded teacher-selection guide linking to `/dashboard/learning-plan`. The independent student dashboard has the same guide with learner-specific wording. The alternate parent sidebar includes Your Learning Plan. Subject cards show introduction completion counts and explain when teacher selection opens. Selection success now directs learners to book their own free lesson; booked lessons no longer show the unbooked disclaimer.

Validation: 37 existing tests passed across teacher shortlist UI/API, matching pages and introduction booking UI. Browser visual verification, booking notifications/reminders and paid checkout integration remain outstanding. These changes are local and undeployed.

## Approved free-lesson policy: one per learner per subject

The user confirmed that each child gets one free 60-minute lesson in each subject. A child studying AI and Yoruba can book one in each. Independent learners follow the same per-subject rule. This supersedes the account/whole-child alternatives and removes the FREE_LESSON_SCOPE gate; there is no environment setting to choose a different scope.

Claims use learner index plus canonical subject, not subject-list position or teacher ID. Intake learner indexes are locked once matching begins. Duplicate subject entries, aliases, or a different teacher cannot reset the allowance. Siblings have separate allowances. Known older claims retain their recorded learner/subject; ambiguous historical claims require review. First-time-family eligibility is recorded at the first successful reservation so starting paid lessons in one subject does not revoke unused subject allowances. Existing paid accounts that never qualified remain excluded.

Pricing, learner dashboard and free-lesson cards now describe the per-subject entitlement. Cancellation/rescheduling/completion rules remain unchanged. Verification: 47 targeted tests passed, including real isolated-database bookings for AI plus Yoruba, separate siblings, duplicate claims, both account types, and booking changes. No live database writes or deployment.

## Scheduling completion update ? 16 October 2026

The trial booking path now supports cancellation and atomic rescheduling of future bookings, withdrawal of unbooked teacher slots, and 60-minute free-lesson slots after teacher selection. Parents/students use self-service controls; admins use the same APIs internally. Teacher cancellation withdraws the old slot; learner/admin cancellation releases it. Failed rescheduling leaves the original booking intact. History records the actor and affected booking. No payment or teacher earnings are created for trial sessions.

A shared teacher-document scheduling revision lock serializes all known schedule creation/update routes in MongoDB transactions, including legacy TeachingSession creation and rescheduling. Conflict detection checks existing schedule models, expands supported recurring lessons in their own timezone, and preserves wall time across DST. Older recurring Session records without sufficient recurrence metadata fail closed for manual review. Legacy creation now requires a real HTTPS meeting URL. Duplicate conflicting User email/username index declarations were removed from source; no live indexes were changed.

Free-lesson reservations are recorded outside editable intake data. Independent learners receive at most one account allowance. Parent policy is deliberately UNSET pending the user's answer: FREE_LESSON_SCOPE=learner means once per child across subjects; account means once per family account. Parent booking fails closed while unset. Active/prior paid accounts (User.subscription) are excluded. A future cancellation releases a reservation, rescheduling retains it, and completion/no-show does not release it. Past historical trial use before this ledger cannot be inferred automatically; review existing users before rollout if earlier free offers were granted outside this flow.

Verification: 84 targeted tests passed, including 20 tests using a real isolated local MongoDB replica set. They cover simultaneous booking claims, different-teacher learner overlaps, live legacy-route races, recurrence/DST, ownership, atomic cancellation/rescheduling, and both free-lesson policies. Test emails/notifications are mocked. Read-only configuration check found transaction support, 28 teacher records and 17 active verified teachers in the configured database; no live writes were performed. No browser/app surface was available, so visual QA is still outstanding. The repository-wide typecheck still reports pre-existing errors; no errors were reported for the new booking/scheduling implementation in the filtered check. Changes remain local and undeployed.

This update supersedes the older scheduling limitations below. Automatic reminders, historical-offer reconciliation, and consolidation of intake children with student login accounts remain separate work.

## Self-service introduction booking; internal admin assistance

There is no learner-facing Arrange for me option. Teachers use /dashboard/teacher/introductions to publish individual 15-minute slots on a UTC quarter-hour grid within 90 days, supplying their own HTTPS meeting link. Parents/students book only teachers already in their saved choices. Admins can book those same slots internally from matching requests. Bookings record the acting account. Available-slot results exclude meeting links; booked account pages and teachers see the link.

Booking updates the slot and owner intake inside a MongoDB transaction. The built-in unique _id protects teacher/time slots; owner document writes serialize concurrent bookings for a learner. Overlapping introductions for the same learner and repeat bookings with the same chosen teacher are rejected. Teacher eligibility is rechecked. MongoDB must support transactions (replica set/Atlas); failures do not fall back to nontransactional writes.

Assigned teachers or admins confirm completion only after a booked introduction has ended. This updates intake and slot together, without creating earnings. The previous direct manual-completion endpoint now rejects bypass attempts. Legacy manually completed introductions remain intact.

Legacy TeachingSession, TeacherSchedule, Session and Schedule conflicts are checked during publishing and booking. Their separate writers do not share the new transaction/lock; concurrent legacy scheduling and recurring-session expansion are NOT yet globally protected. This must be resolved before production rollout. Live transaction/concurrency and browser testing remain outstanding. Automatic notifications, cancellation/rescheduling, free-hour booking/eligibility and child-account consolidation remain unfinished. No live database writes or messages were made in development.

## Learner-led teacher choices (supersedes mandatory admin shortlisting)

Parents and independent learners now browse all active, verified teachers matching each saved subject and confirm one to three distinct introduction choices. Admin assistance remains available. The API enforces request ownership and the one-to-three limit; public results contain names, bios and declared availability, not credential documents or contact details. Final selection requires completion of the chosen introductions (one, two or three), not a mandatory three. Existing published shortlists remain intact. Choosing introductions is not a booking; free-lesson booking and one-time eligibility remain outstanding.

## Teacher shortlist and selection update

Admin matching requests now load active, verified teachers from the existing User collection, matching canonical subjects and existing codes (math/cs/ai). Each learner/subject can receive exactly three different teachers. The server checks eligibility before publishing; no teacher accounts or credential documents are copied. Public cards contain only teacher IDs, names and bios.

Staff record completion of each manually arranged 15-minute introduction. After all three are recorded, the authenticated parent or independent learner can select one shortlisted teacher. Selection rechecks teacher eligibility and uses an atomic no-prior-selection guard. Shortlists cannot be overwritten through this flow. Intake edits are blocked after any shortlist exists, even if staff reset the overall status to pending. Changes to published shortlists or chosen teachers need a future explicit rematching flow.

This is assisted matching, not automated attendance or booking. Selection is stored on the intake, not yet on paid teaching assignments. Free-lesson booking/one-time eligibility, teacher notification and child-account consolidation remain outstanding. No live data or messages were changed during development; tests use mocked records.

## Update: 16 October 2026

Pricing restores the original purple/gold background, translucent cards, benefits and FAQ sections. The CTA opens the existing parent/student/teacher role selector; signed-in parents and students continue to /dashboard/learning-plan. Free introductions and the free lesson require no payment.

The shared learning-plan page supports parents and independent students. Students may submit one learner; parents may submit up to ten. Requests require a verified email, are validated server-side and are saved only to the authenticated account. Parent signup intake remains supported. The old parent learning-plan URL now renders the shared page. Student signup carries selected pricing subjects into its existing subject step and offers personal learning/not-in-school education options. Pricing preferences remain estimates.

Admins can review both account types, change progress (received, finding teachers, arranging introductions), and leave a learner-visible note. Updates compare the previous status atomically. Learners may edit pending requests; once staff matching begins they contact the team for changes. This does not send messages, create bookings, record attendance, select teachers, or grant free-lesson entitlements. Those stages and consolidating parent intake with child login accounts remain unfinished. Existing users access this via Your Learning Plan in the dashboard navigation.

# Parent onboarding and assisted matching

Implemented locally on 11 October 2026. Pricing retains all approved currencies, quantities, longer-session options, monthly 15% and quarterly 20% discounts (updated with approval on 11 October 2026).

Pricing stores only the selected subject quantities, currency and plan in sessionStorage when the signup link is clicked. The parent form validates that draft and uses student counts to propose learner rows; parents can redistribute subjects. It is a planning preference, never an order or entitlement. Storage failure does not block registration. Draft is removed after successful signup. Child names/goals are not written to browser storage by this feature.

Signup remains two steps: account details, then children's learning needs. Country of residence is collected with account details; its value is distinct from the phone-country code. The second step collects first name/nickname, age band, level, subjects and goals. Every selected subject becomes its own teacher-introduction and free-class track; parents are not asked to prioritise one subject. Parents choose an exact date and time only after shortlisting a teacher, from that teacher's published slots. Adult self-learning is optional and collapsed. Server validation precedes account writes; intake status is server-owned `pending`. Records are saved in `parentProfile.onboarding` as validated intake profiles, not student login accounts. Existing My Children account creation is still separate.

Admin navigation links to `/dashboard/admin/matching-requests`, which restricts access to admins and shows up to 100 verified pending families, oldest first. Staff can review and use existing assessment/assignment tools. It does not send messages, auto-match, schedule introductions, record attendance, grant free sessions, or automatically complete requests. Parents can read their own saved preferences at `/dashboard/parent/learning-plan` and contact the team for changes. Preference editing and a full matching workflow remain future work.

Pricing and child-intake dropdowns share `BrandDropdown`, using the installed Radix Select primitives for keyboard navigation, purple focus/borders, gold selection state and rounded menus. Existing unrelated dropdowns were not globally restyled.

Targeted tests cover calculator arithmetic with the new dropdowns, pricing-to-signup draft persistence, intake validation, signup persistence, and parent/admin read permissions. No production email or database writes. Real-browser/mobile visual QA is still needed.

Commercial review: at the previously discussed USD 5 teacher payout, quarterly USD 7.97 less 20% leaves about USD 1.38 per student-hour before other costs. Discounts remain as approved; settlement/payout rules need review before launching paid acquisition.
