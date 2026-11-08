---
paths:
  - "src/pages/**/*.astro"
  - "src/components/**/*.astro"
  - "src/layouts/**/*.astro"
---

# Astro Components & Pages — RenoFitness (planned frontend)

## Routing
- `public/index.html` → `src/pages/index.astro`; `blog.html` → `blog.astro`; `login.html` → `login.astro`; `register.html` → `register.astro`; `subscribe.html` → `subscribe.astro`; `contact.html` → `contact.astro`.
- Shared `<head>`, nav, footer go in `src/layouts/BaseLayout.astro`; never duplicate per page.

## Components
- Small single-purpose components: `Navbar`, `Footer`, `ContactForm`, `NewsletterForm`, `LoginForm`, `RegisterForm`.
- Static sections (hero, schedule, testimonials) stay plain `.astro` with zero client JS.
- Only real interactivity (forms calling the Express API, mobile nav toggle) becomes an island.

## Assets
- Move assets from `carousel1/`, `carousel2/`, `widgets/`, `vendors/`, `resources/` into `src/assets/` (optimized) or `public/` (as-is).
- Don't port jQuery carousel/widget code blindly; prefer CSS-only or small island replacements first.

## SEO
- Each page passes its own `<title>` and meta description to `BaseLayout`.
- Use semantic HTML (`<nav>`, `<main>`, `<footer>`, proper heading hierarchy).
- Preserve Open Graph/social tags from the original `index.html`.

## Backend contract
- Pages never touch `data/*.json`; all data goes through `/api/auth/*`, `/api/email/*`, `/api/contact`.
- Keep the API base URL configurable (env/config), not hardcoded `localhost:3000`.
