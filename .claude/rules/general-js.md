# General JavaScript Conventions — RenoFitness

- Plain JavaScript only; no TypeScript unless the whole project migrates deliberately.
- Use ES modules (`import`/`export`) everywhere; the site has no CommonJS code.
- Prefer `async`/`await` over `.then()` chains; wrap anything that can reject (`fetch`, JSON parsing) in try/catch and show the visitor a clear message.
- Throw `Error` instances, not strings/plain objects; keep stack traces when rethrowing.
- `const`/`let` only; template literals over concatenation (especially email HTML).
- Shared client helpers (validation, form submission, build-time settings) live in `src/scripts/`.
- Comment *why*, not *what*; mark temporary workarounds with `// TODO:`.
