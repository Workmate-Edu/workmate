# Subscription Access Strategy (Parent, Student, Child)

## 1. Parent

- **No Subscription:**  
  - Can add/manage children, view dashboard, but cannot access learning content, book sessions, or see progress reports.
  - Can view pricing and initiate subscription.

- **Active Subscription:**  
  - Can access:
    - Parent dashboard (overview, children, progress, notifications).
    - All features for children covered by the subscription (progress, reports, session bookings, materials).
    - If `interestedInLearning` is true, can access "My Courses", "My Teachers", "Learning Progress" for their own learning journey (like a student).
    - Can add new children/subjects (may require new subscription for those).

## 2. Student (Independent)

- **No Subscription:**  
  - Can sign up, complete initial assessment, but cannot access courses, sessions, or materials.
  - Can view pricing and subscribe.

- **Active Subscription:**  
  - Can access:
    - All assigned courses, teachers, sessions, materials, and progress tracking.
    - Messaging and notifications.

## 3. Child (Parent-Added Student)

- **No Subscription:**  
  - Cannot access learning content, sessions, or materials.
  - Can log in (if invited), but will see a prompt to ask parent to subscribe.

- **Active Subscription (via Parent):**  
  - Can access:
    - Only the subjects/learning journeys covered by the parent's subscription.
    - Assigned teachers, sessions, materials, and progress tracking.
    - Messaging (if enabled).

## 4. Teacher

- **No Subscription Required:**  
  - Access is based on admin approval, not subscription.

## 5. Admin

- **No Subscription Required:**  
  - Full access.

---

## Implementation Notes

- **Enforcement:**  
  - Use middleware or utility functions (like `hasSubjectAccess`, `getAllowedSubjectsForUser`) to check access before serving content, booking, or showing progress.
  - UI should hide or disable features if access is not granted.

- **Granularity:**  
  - Access is per subject/child for parents and children.
  - For parents with `interestedInLearning`, treat them as a student for their own learning journey.

- **Renewal/Upgrade:**  
  - When a subscription is renewed or upgraded, extend access for covered subjects/children.
  - Adding new children/subjects requires a new subscription or upgrade.

- **Expired/Inactive:**  
  - Show clear prompts to renew/subscribe.
  - Hide or disable all learning features.

---

## Example UI/UX

- **Parent Dashboard:**  
  - If no subscription: "Subscribe to unlock learning for your children."
  - If active: Show all covered children/subjects, and "My Learning" if parent is also learning.

- **Student/Child Dashboard:**  
  - If no subscription: "Ask your parent to subscribe."
  - If active: Show only allowed subjects/courses.

---

## Summary Table

| Role    | No Subscription | Active Subscription |
|---------|-----------------|--------------------|
| Parent  | Manage children, view pricing | Full dashboard, children’s learning, own learning (if enabled) |
| Student | Assessment only, view pricing | Full learning access |
| Child   | Prompt to parent | Only covered subjects/courses |
| Teacher | N/A             | N/A                |
| Admin   | N/A             | N/A                |

---

**Next Steps:**  
- Implement access checks in all API routes and UI components.
- Ensure subscription status is checked on every protected action.
- Provide clear upgrade/subscribe prompts in the UI.
