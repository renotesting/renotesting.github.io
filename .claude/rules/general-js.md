# General JavaScript Conventions — RenoFitness

- Plain JavaScript only; no TypeScript unless the whole project migrates deliberately.
- Follow the module style already used in `server.js`/`src/` (CommonJS vs ESM); don't mix `require()` and `import` in one file.
- Prefer `async`/`await` over `.then()` chains; wrap anything that can reject (file I/O, `sendMail`, bcrypt, `jwt.verify`) in try/catch and surface a proper HTTP response.
- Throw `Error` instances, not strings/plain objects; keep stack traces when rethrowing.
- `const`/`let` only; template literals over concatenation (especially email HTML).
- Route handler shape: validate → call util/service → shape response. Hashing, token, and email logic live in `src/utils/`.
- Comment *why*, not *what*; mark temporary workarounds (e.g. JSON-file storage) with `// TODO:`.
