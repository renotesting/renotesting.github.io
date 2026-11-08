# RenoFitness

Website for a Calgary kickboxing / Muay Thai studio. Migrated from a static GitHub Pages site (jQuery) to a Node.js + Express app on the `redesign` branch. A frontend rebuild with Astro is planned.

## Commands
- `npm install` — install dependencies
- `npm run dev` — start with nodemon (auto-reload), http://localhost:3000
- `npm start` — production start (`node server.js`)
- `npm test` — no test framework configured yet

## Stack
- Node.js (>=14) + Express 4, plain JavaScript (no TypeScript)
- Auth: `jsonwebtoken` + `bcryptjs`; security: `helmet`, `cors`
- Email: `nodemailer` (Gmail/Outlook/SMTP)
- Storage: flat JSON files in `data/` (gitignored) via `src/utils/storage.js`. No database.

## Layout
- `server.js` — thin entry point (mount middleware + routers, listen)
- `src/routes/` — `auth.js`, `email.js`, `contact.js`
- `src/middleware/auth.js` — JWT verification
- `src/utils/` — `tokenService.js`, `storage.js`, `emailService.js`
- `public/` — static HTML pages served by Express (current frontend)
- `data/`, `.env` — local only, never commit

## API (JSON, shape `{ success, message, ...data }`)
- `POST /api/auth/register | login | verify-token`
- `POST /api/email/subscribe | unsubscribe`; admin (JWT): `GET /api/email/subscribers`, `POST /api/email/send-newsletter`
- `POST /api/contact`, `GET /api/contact/:submissionId`

## Environment variables
Defined in `.env` (template: `.env.example`): `NODE_ENV`, `PORT`, `JWT_SECRET`, `JWT_EXPIRATION`, `EMAIL_PROVIDER`, `EMAIL_USER`, `EMAIL_PASSWORD`, `ADMIN_EMAIL`, `EMAIL_FROM_NAME`, `DATA_DIR`, `BCRYPT_ROUNDS`. Never hardcode or log these. Add new ones to `.env.example` and the README table.

## Conventions
Detailed rules live in `.claude/rules/` (security and general JS always load; Express, JWT and Astro rules load when matching files are touched). Key points:
- Route handlers are async with try/catch, validate input first, use correct status codes.
- All `data/*.json` access goes through `src/utils/storage.js`; never store plaintext passwords.
- JSON-file storage is a known scaling limit; mark related workarounds with `// TODO:`.

## Branches
Work on `redesign`. `master` is the old static site.
