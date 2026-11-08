---
paths:
  - "src/components/**/*.js"
  - "src/components/**/*.ts"
  - "src/scripts/**/*.js"
  - "src/scripts/**/*.ts"
---

# Astro Islands & Client JS — RenoFitness (planned frontend)

## Hydration
- Islands: `LoginForm`, `RegisterForm`, `ContactForm`, `NewsletterForm`, mobile nav toggle. Everything else stays static.
- Use `client:visible` for below-the-fold forms (footer newsletter), `client:load` only for immediately needed ones (login page). Hydrate the form, not the whole page.

## Form submission
- Pattern: preventDefault → client validation → `fetch()` the Express endpoint → handle response → update UI (loading/success/error) without reload.
- Match README payloads exactly, e.g. `POST /api/auth/register` takes `{ name, email, password, confirmPassword }` and returns `{ success, message, user, token }`.
- On login/register success, store the JWT in `localStorage` (existing approach) and redirect.
- Show backend 400 `message` text near the relevant field, not a generic error.

## Validation and state
- Client validation is UX only; the Express routes remain the source of truth. Share helpers (`isValidEmail`, `passwordsMatch`) across forms.
- Each form island owns its local state; no global state library.
- Wrap every `fetch` in try/catch; distinguish network failure from API 4xx/5xx.
- Never log JWTs, passwords, or confirmations to the console.

## Admin views
- Gate admin-only views on a stored JWT but always re-verify via `/api/auth/verify-token`; a stored token alone proves nothing.
