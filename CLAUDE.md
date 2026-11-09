# RenoFitness

Website for a Calgary kickboxing / Muay Thai studio. Migrated from a static GitHub Pages site (jQuery) to an Astro frontend and Node.js + Express API on the `redesign` branch. The live site is still the old one on `master` until the domain moves (see Deployment in `README.md`).

## Commands
- `npm install` — install dependencies
- `npm run dev:all` — Astro at http://localhost:4321 and the API at http://localhost:3000
- `npm run dev` — API only, with nodemon (pages return 404 unless `dist/` exists)
- `npm run build` — build the site into `dist/`
- `npm start` — production start (`node server.js`), serves the API and `dist/`
- `npm run make-admin -- <email>` — grant admin access to an existing account
- No test framework configured yet

## Stack
- Node.js (>=22.23.4) + Express 4, plain JavaScript (no TypeScript)
- Frontend: Astro 7 static build with Preact islands for forms and the mobile nav
- `cookie` is a direct dependency only so version 2 sits at the repo root: Astro's prerender step fails on the 0.7 that Express needs. Keep it until Express no longer pulls in the old version
- Auth: `jsonwebtoken` + `bcryptjs`; security: `helmet`, `cors`
- Email: `nodemailer` (Gmail/Outlook/SMTP)
- Storage: flat JSON files in `data/` (gitignored) via `src/utils/storage.js`. No database.

## Layout
- `server.js` — thin entry point (mount middleware + routers, listen)
- `src/routes/` — `auth.js`, `email.js`, `contact.js`
- `src/middleware/` — `auth.js` (`verifyAuth`, `requireAdmin`), `rateLimit.js`, `legacyRedirects.js` (old site URLs)
- `scripts/make-admin.js` — promotes an account to admin
- `src/utils/` — `tokenService.js`, `storage.js`, `emailService.js`, `sanitize.js`
- `src/pages/`, `src/layouts/`, `src/components/`, `src/scripts/`, `src/styles/`, `src/assets/` — Astro frontend
- `static/` — files copied as-is into the build (Astro's public dir)
- `dist/` — build output served by Express, gitignored
- `render.yaml` — hosting blueprint
- `data/`, `.env` — local only, never commit

## API (JSON, shape `{ success, message, ...data }`)
- `POST /api/auth/register | login | verify-token`
- `POST /api/email/subscribe`, `POST /api/email/unsubscribe` (signed token from an email link only)
- `POST /api/contact`
- Admin only (JWT + `role: 'admin'`): `GET /api/email/subscribers`, `POST /api/email/send-newsletter`, `GET /api/contact/:submissionId`

## Environment variables
Defined in `.env` (template: `.env.example`): `NODE_ENV`, `PORT`, `SITE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`, `EMAIL_PROVIDER`, `EMAIL_USER`, `EMAIL_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `ADMIN_EMAIL`, `EMAIL_FROM_NAME`, `DATA_DIR`, `BCRYPT_ROUNDS`, `CORS_ORIGINS`, `TRUST_PROXY`, `PUBLIC_API_URL`, `PUBLIC_GTM_ID`, `PUBLIC_GA_ID`. Never hardcode or log these. Add new ones to `.env.example` and the README table.

## Conventions
Detailed rules live in `.claude/rules/` (security and general JS always load; Express, JWT and Astro rules load when matching files are touched). Key points:
- Route handlers are async with try/catch, validate input first, use correct status codes.
- All `data/*.json` access goes through `src/utils/storage.js`; never store plaintext passwords.
- JSON-file storage is a known scaling limit; mark related workarounds with `// TODO:`.

## Branches
Work on `redesign`. `master` is the old static site.
