# Security Conventions — RenoFitness

## Secrets and environment
- Never hardcode secrets (`JWT_SECRET`, `EMAIL_PASSWORD`, SMTP credentials, admin email); read from `process.env` via `dotenv`.
- Never commit `.env`; only `.env.example` with placeholders.
- New env var → add to `.env.example` and the README configuration table in the same change.
- Don't log env var values.

## Helmet and CORS
- Keep `helmet()` mounted globally in `server.js` before routes; scope any exception narrowly per route.
- CORS origins come from an env var (e.g. `CORS_ORIGINS`), never `origin: '*'` — especially with JWT in localStorage.
- Don't widen CORS to debug locally and forget to narrow it.

## Input handling
- Validate and sanitize all user input (registration, contact, newsletter) before persisting or emailing.
- Treat contact `subject`/`message` as untrusted when interpolated into emails (header/HTML injection).
- Enforce length limits on free-text fields.

## Dependencies
- When bumping `helmet`, `bcryptjs` or `jsonwebtoken`, check for breaking changes in header defaults and JWT verification behavior.
