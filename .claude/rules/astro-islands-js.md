---
paths:
  - "src/components/**/*.js"
  - "src/components/**/*.jsx"
  - "src/scripts/**/*.js"
---

# Astro Islands & Client JS — RenoFitness

## Hydration
- Islands: `ContactForm`, `LoyaltyIdGenerator` and the mobile nav toggle. Everything else stays static.
- Use `client:visible` for below-the-fold forms (home page contact section), `client:load` only for forms that are the point of the page (`/contact`). Hydrate the form, not the whole page.

## Form submission
- There is no backend. The contact form posts to Formspree through `src/scripts/formspree.js`, sending `Accept: application/json` so it answers JSON instead of redirecting.
- Pattern: preventDefault → client validation → submit → update UI (loading/success/error) without reload.
- Show Formspree's `errors[].message` text when a submission is rejected, not a generic error.
- Keep the `_gotcha` honeypot field on the contact form.
- The newsletter signup is the email service's hosted form, embedded on `/subscribe`; don't rebuild it as a custom island.

## Validation and state
- Client validation is UX only; Formspree and the email service enforce their own rules. Share helpers from `src/scripts/validation.js`.
- Each form island owns its local state; no global state library.
- Wrap every `fetch` in try/catch; distinguish network failure from a rejected submission.
