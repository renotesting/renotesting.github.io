---
paths:
  - "src/**/*.js"
  - "server.js"
---

# Express / Node.js Conventions — RenoFitness

## Project shape
- Route handlers live in `src/routes/` (one file per resource: `auth.js`, `email.js`, `contact.js`).
- Cross-cutting concerns live in `src/middleware/` (e.g. `auth.js` for JWT verification).
- Shared logic lives in `src/utils/` (`tokenService.js`, `storage.js`, `emailService.js`).
- Static frontend pages are served from `public/` — no server logic there.
- Keep `server.js` thin: mount middleware, mount routers, listen. No business logic.

## Route handler style
- Every handler is `async` and wrapped in try/catch; never leave a rejected promise unhandled.
- Consistent JSON: `{ success: boolean, message?: string, ...data }` on success, `{ success: false, message }` on error (matches the README API docs).
- Status codes: `201` created (register, subscribe, contact), `200` reads/logins, `400` validation, `401`/`403` auth, `500` only for unexpected errors.
- Validate request bodies (required fields, email format, password confirmation) before calling `storage.js` or `emailService.js`.

## Data layer (flat JSON files)
- All reads/writes to `data/*.json` go through `src/utils/storage.js`; never call `fs` from a route.
- Avoid concurrent read-modify-write races on the same file (e.g. two simultaneous registrations); use a simple in-process lock/queue if needed.
- Never write raw passwords — only the bcrypt hash.
- JSON-file storage is a known scaling limit; flag assumptions with `// TODO:`.

## Middleware and errors
- Middleware uses `(req, res, next)` and calls `next(err)` on failure.
- Mount global middleware (`helmet`, `cors`, `express.json()`) once in `server.js`.
- Use one central error-handling middleware at the end of the chain for unexpected errors.
- Log server errors with context (route, method) but never secrets or raw bodies containing passwords.
