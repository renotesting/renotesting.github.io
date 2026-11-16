# Security Conventions — RenoFitness

## Secrets and environment
- This is a static site: every `PUBLIC_*` value is baked into the public HTML/JS. Never put a password, API key or other secret in `.env` or in a GitHub repository variable used by the build.
- Never commit `.env`; only `.env.example` with placeholders.
- New env var → add to `.env.example`, the README configuration table and `.github/workflows/deploy.yml` in the same change.

## Third-party services
- Form submissions go only to the configured Formspree endpoint and the newsletter form URL; don't send visitor data anywhere else.
- Only accept `https://` URLs for anything embedded or posted to (see `src/scripts/newsletter.js`).
- Keep spam protection on: the `_gotcha` honeypot in the contact form, plus Formspree's and the email service's own filters.

## Input handling
- Validate input on the client for UX, and keep length limits on free-text fields (`maxlength`).
- Contact submissions reach the studio's inbox through Formspree; treat their content as untrusted.

## Deployment
- The Pages workflow keeps minimal permissions (`contents: read`, `pages: write`, `id-token: write`). Don't widen them.
