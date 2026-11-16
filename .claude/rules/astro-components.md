---
paths:
  - "src/pages/**/*.astro"
  - "src/components/**/*.astro"
  - "src/layouts/**/*.astro"
---

# Astro Components & Pages — RenoFitness

## Routing
- Each page is a file in `src/pages/`. When a URL changes, keep the old one working with a redirect page in `static/` (copy one of the existing ones, e.g. `static/blog.html`). GitHub Pages has no server-side redirects.
- Shared `<head>`, nav, footer go in `src/layouts/BaseLayout.astro`; never duplicate per page.

## Components
- Small single-purpose components: `Navbar`, `Footer`, `ContactSection`/`ContactForm`, `WhatsAppButton`.
- Static sections (hero, schedule, testimonials) stay plain `.astro` with zero client JS.
- Only real interactivity (the contact form, mobile nav toggle, loyalty ID generator) becomes an island.
- Features driven by a `PUBLIC_*` setting (contact form, newsletter, WhatsApp) must still render sensibly when it's empty.

## Assets
- Put images in `src/assets/` and render them with Astro's `<Image>` so they are resized and compressed; never use a plain `<img src={x.src}>`, which ships the original file.
- `static/` is for files that must keep their exact name and bytes (favicon, `CNAME`, `.nojekyll`, redirect pages).
- Don't add jQuery; prefer CSS-only or small island replacements.

## SEO
- Each page passes its own `<title>` and meta description to `BaseLayout`.
- Use semantic HTML (`<nav>`, `<main>`, `<footer>`, proper heading hierarchy).
- Preserve Open Graph/social tags from the original `index.html`.

## Third-party services
- Service settings (Formspree form ID, newsletter form URL) come from `PUBLIC_*` env vars read at build time, never hardcoded.
