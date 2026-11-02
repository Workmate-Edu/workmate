# Workmate transactional email branding

The email reference is the existing website, not a new brand identity:

- `src/app/layout.tsx`: Inter typography and African Languages & STEM Education.
- `src/app/globals.css`: golden yellow `#F4A300`, purple `#7C3AED`, slate `#1E293B`, light neutral backgrounds.
- `src/components/logo.tsx` and `src/components/ui/logo.tsx`: `/images/logo.png`.
- `src/components/footer.tsx`: Workmate name, education/culture tagline and contact/privacy/terms routes.

## Structure

All 33 message templates in `email-templates` are content fragments. `base-layout.html` supplies one header, real website logo, footer and current copyright year. `src/lib/render-email.ts` combines the content and layout. Both SMTP senders call it. Do not send a fragment directly or add another full HTML document/footer to a message template.

`src/lib/emailTheme.ts` is the shared email theme; `emailStyles.ts` re-exports its styles for compatibility. The old unused green `base-styles.html` was removed. Essential layout, colour and button styles are inline, with presentation tables, Outlook width fallback, responsive padding, long-link wrapping and a font fallback when Inter is unavailable. Email uses the website's light brand palette.

The renderer obtains the logo/footer origin from the optional `EMAIL_BRAND_URL`, defaulting to `https://workmateteam.com`. This is deliberately independent of `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL`, which can point to localhost during development. If overriding it, use a publicly reachable HTTPS site hosting `/images/logo.png`. The image path is the same asset used by website navigation. Reset and verification links continue to use their caller-provided URLs; changing branding does not redirect local authentication to production.

Business placeholders and existing HTML-fragment replacements are retained. Replacement values are substituted literally in one pass, so dollar sequences in URLs are preserved and supplied data is not recursively interpolated. Existing callers supplying HTML remain responsible for safe construction of that HTML; this branding change is not a general templating/security redesign.

## Password reset

The live forgot-password route uses `passwordReset.html`, with `userName` and `passwordResetLink`. It now sends the subject “Reset your Workmate password”, uses Workmate branding and says the link expires in one hour, matching `generateToken` in `src/templates/authTemplates.ts`. The alternative `reset-password.html` has the same design and retains its `name`/`resetLink` contract. Diboruwa sign-off, social accounts, unrelated logo and teal styling are removed.

## Preview and checks

```powershell
.\node_modules\.bin\tsx.cmd scripts/preview-emails.ts
.\node_modules\.bin\jest.cmd --runInBand --runTestsByPath src/__tests__/email/branding.test.ts src/__tests__/email/forgot-password.test.ts
```

The preview script generates `docs/email-previews/index.html` and all message previews with invented data and an embedded copy of the logo. It imports no SMTP transport or database. Pass an output directory as the final argument to generate elsewhere. Preview links are for inspection and are not functional authentication links.

Tests cover all 33 rendered templates, the actual forgot-password route with mocked persistence/token/SMTP, correct expiry copy, one shared shell, preservation of reset URLs and dynamic HTML/style data, optional event links, and template path validation. No real emails are sent by these tests.

Desktop browser screenshots were inspected for password reset, parent signup and class invitations. The narrow-window screenshot was clipped; reliable mobile emulation could not be completed in this session. Final responsive changes still need a real mobile/email-client check. Gmail/Outlook delivery and client-specific rendering are not certified. The repository's unrelated payment-button syntax errors remain outside this change.

The relaunch product/engineering backlog remains in `relaunch-marketing-impact-review.md`; it was not implemented as part of the email work.

## Follow-up consistency audit

All 33 existing templates use the shared layout through both SMTP senders. Neutral text, surface, border and card colours now resolve from `emailTheme.ts` through reserved brand placeholders, alongside the primary and secondary colours. Account-details cards and the signup email's injected children section have inline styling for clients that remove head styles.

The branding, forgot-password route and sender-boundary suites pass 42 checks with SMTP mocked. Sender tests verify both delivery helpers use the shared renderer. Regenerated previews are in `docs/email-previews/index.html`; these are browser previews, not certification of Gmail/Outlook rendering.

Two pre-existing incomplete flows remain outside the available template set: `src/lib/services/migration-notification.ts` references missing `child-account-migration` and has no sender import; `src/app/api/parent/children/[childId]/verify/route.ts` references missing `child-verification` and has unresolved imports/route parameters. These require functional implementation and authentication review before activation; the existing 33-template checks do not certify these flows.
