// Read at build time. Without a form ID the contact form is replaced by other ways to get in touch.
function readFormId(raw) {
  const value = String(raw || '').trim();
  // The old site posted to formspree.io/<email>. Formspree retired those, so an email here
  // would give a form that always fails with "This form isn't set up yet".
  if (value.includes('@')) {
    console.warn('PUBLIC_FORMSPREE_FORM_ID is an email address. Use the form ID from the Formspree dashboard (Integration tab, the part after /f/). The contact form stays hidden until then.');
    return '';
  }
  return value;
}

const formId = readFormId(import.meta.env.PUBLIC_FORMSPREE_FORM_ID);

export const formspreeEndpoint = formId ? `https://formspree.io/f/${encodeURIComponent(formId)}` : null;

export const NETWORK_ERROR_MESSAGE = "Couldn't send your message. Check your connection and try again.";

// Formspree answers JSON when asked for it, with { ok } on success or { errors: [{ message }] }.
export async function submitToFormspree(fields) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.append(key, value);

  let response;
  try {
    response = await fetch(formspreeEndpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body
    });
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }

  if (response.ok) return { ok: true };

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  // Form-level problems (such as reCAPTCHA left on for an AJAX form) come back as a single
  // `error` string instead of an `errors` list.
  const message = Array.isArray(data.errors) && data.errors.length
    ? data.errors.map((error) => error.message).join(' ')
    : typeof data.error === 'string' && data.error
      ? data.error
      : 'Could not send your message. Please try again later.';
  const code = Array.isArray(data.errors) ? data.errors.find((error) => error.code)?.code || '' : '';
  return { ok: false, message, code };
}
