---
paths:
  - "src/routes/auth.js"
  - "src/middleware/*.js"
  - "src/utils/tokenService.js"
---

# JWT Authentication — RenoFitness

## Passwords
- Hash with `bcryptjs` before storing in `data/users.json`; never store or log plaintext.
- Use `BCRYPT_ROUNDS` from env, not a hardcoded number.
- Verify `password === confirmPassword` server-side on registration; never trust client validation alone.

## Token issuance
- Sign with `JWT_SECRET` from env; never hardcode or default it.
- Respect `JWT_EXPIRATION` from env.
- Payload carries only id, email, name — never the password hash (JWT payloads are encoded, not encrypted).

## Verification middleware
- Expect `Authorization: Bearer <token>`; missing/invalid/expired → `401`, not `500`.
- Don't leak why a token is invalid or whether a user exists.
- Attach the decoded payload to `req.user` for downstream handlers.

## Admin-gated routes
- `GET /api/email/subscribers` and `POST /api/email/send-newsletter` use the shared auth middleware; never re-implement verification inline.
- If roles are added later, enforce them explicitly in middleware, not via scattered email/id comparisons.

## General
- Never log full JWTs or `JWT_SECRET`.
- Keep all `jsonwebtoken` calls inside `tokenService.js`.
