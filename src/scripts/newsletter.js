// Read at build time: the hosted signup form from the email-marketing service (e.g. Brevo).
// Only https URLs are accepted, since the form is embedded in the page.
function parseFormUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export const newsletterFormUrl = parseFormUrl(import.meta.env.PUBLIC_NEWSLETTER_FORM_URL);
