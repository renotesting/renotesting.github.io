---
paths:
  - "src/pages/**/*.astro"
  - "src/components/**/*.astro"
  - "src/layouts/**/*.astro"
---

# Astro Components & Pages — RenoFitness

## Routing
- Each page is a file in `src/pages/`. When a URL changes, add a redirect in `src/middleware/legacyRedirects.js`.
- Shared `<head>`, nav, footer go in `src/layouts/BaseLayout.astro`; never duplicate per page.

## Components
- Small single-purpose components: `Navbar`, `Footer`, `ContactForm`, `NewsletterForm`, `LoginForm`, `RegisterForm`.
- Static sections (hero, schedule, testimonials) stay plain `.astro` with zero client JS.
- Only real interactivity (forms calling the Express API, mobile nav toggle) becomes an island.

## Assets
- Put images in `src/assets/` and render them with Astro's `<Image>` so they are resized and compressed; never use a plain `<img src={x.src}>`, which ships the original file.
- `static/` is for files that must keep their exact name and bytes (e.g. the favicon).
- Don't add jQuery; prefer CSS-only or small island replacements.

## SEO
- Each page passes its own `<title>` and meta description to `BaseLayout`.
- Use semantic HTML (`<nav>`, `<main>`, `<footer>`, proper heading hierarchy).
- Preserve Open Graph/social tags from the original `index.html`.

## Backend contract
- Pages never touch `data/*.json`; all data goes through `/api/auth/*`, `/api/email/*`, `/api/contact`.
- Keep the API base URL configurable (env/config), not hardcoded `localhost:3000`.
