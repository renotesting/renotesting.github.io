// reCAPTCHA v2 ("I'm not a robot" checkbox) for the contact form. The site key is public by
// design; the secret key belongs only in the Formspree form settings, never here.
export const recaptchaSiteKey = String(import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY || '').trim();

const SCRIPT_URL = 'https://www.google.com/recaptcha/api.js';
const READY_CALLBACK = '__renoRecaptchaReady';

let loading = null;

// Loads Google's script once per page, even when both the home and contact forms mount.
export function loadRecaptcha() {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    if (window.grecaptcha?.render) {
      resolve(window.grecaptcha);
      return;
    }
    window[READY_CALLBACK] = () => resolve(window.grecaptcha);
    const script = document.createElement('script');
    script.src = `${SCRIPT_URL}?onload=${READY_CALLBACK}&render=explicit`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      // Let a later mount try again, for example after the visitor allows the script.
      loading = null;
      reject(new Error('reCAPTCHA script failed to load'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

// Formspree doesn't document its captcha error codes, so match on the code or message text.
export function isCaptchaRejection(result) {
  return /captcha/i.test(`${result.code || ''} ${result.message || ''}`);
}

export const CAPTCHA_MESSAGES = {
  unticked: 'Please tick "I\'m not a robot" before sending.',
  rejected: 'The "I\'m not a robot" check didn\'t go through or expired. Tick it again and resend your message.',
  blocked: 'The "I\'m not a robot" check couldn\'t load, so the message can\'t be sent. Turn off any ad or script blocker for this site, or reload the page and try again.',
  notSetUp: 'The contact form\'s spam check isn\'t set up yet, so messages can\'t be sent right now. Please reach out on Facebook or Instagram instead.'
};
