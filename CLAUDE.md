# RenoFitness

Website for a Calgary kickboxing / Muay Thai studio. Migrated from a jQuery static site to a static Astro site on the `redesign` branch, hosted free on GitHub Pages. There is no backend: the contact form goes to Formspree, the newsletter is a hosted Brevo signup form, and live chat is a WhatsApp link. The live site is still the old one on `master` until `redesign` is merged (see Deployment in `README.md`).

An Express API with login, register and admin tools existed until commit `bc13b11` and was dropped to keep hosting free. It's in git history if it's ever needed again.

## Commands
- `npm install` — install dependencies
- `npm run dev` — Astro dev server at http://localhost:4321
- `npm run build` — build the site into `dist/`
- `npm run preview` — serve the built `dist/` locally
- No test framework configured yet

## Stack
- Node.js (>=22.23.4), plain JavaScript (no TypeScript)
- Astro 7 static build with Preact islands for the contact form, loyalty ID generator and mobile nav
- Formspree (contact form), Brevo hosted form (newsletter), WhatsApp click-to-chat
- GitHub Pages, deployed by `.github/workflows/deploy.yml` on push to `master`

## Layout
- `src/pages/`, `src/layouts/`, `src/components/`, `src/styles/`, `src/assets/` — Astro site
- `src/scripts/` — client helpers and build-time settings (`formspree.js`, `newsletter.js`, `whatsapp.js`, `validation.js`)
- `static/` — copied as-is into the build: favicon, `CNAME`, `.nojekyll`, redirect pages for old `.html` URLs
- `dist/` — build output, gitignored
- `.env` — local only, never commit

## Environment variables
All are read at build time and end up in the public site, so none may hold a secret. Template: `.env.example`. For the live site they're GitHub repository variables passed in by the workflow: `PUBLIC_FORMSPREE_FORM_ID`, `PUBLIC_NEWSLETTER_FORM_URL`, `PUBLIC_WHATSAPP_NUMBER`, `PUBLIC_GTM_ID`, `PUBLIC_GA_ID`. A new one goes in `.env.example`, the README table and the workflow.

## Conventions
Detailed rules live in `.claude/rules/` (security and general JS always load; Astro rules load when matching files are touched). Key points:
- Each `PUBLIC_*`-driven feature must still render sensibly when its value is empty.
- Old URLs keep working through redirect pages in `static/`, since GitHub Pages has no server-side redirects.

## Branches
Work on `redesign`. `master` is the old static site until the switch.
