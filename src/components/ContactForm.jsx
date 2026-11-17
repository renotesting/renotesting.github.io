import { useEffect, useRef, useState } from 'preact/hooks';
import { submitToFormspree } from '../scripts/formspree.js';
import { CAPTCHA_MESSAGES, isCaptchaRejection, loadRecaptcha, recaptchaSiteKey } from '../scripts/recaptcha.js';
import { isValidEmail, isNonEmpty } from '../scripts/validation.js';

const FIND_US_LABELS = {
  friends: 'Friends',
  search: 'Search engine',
  ad: 'Advertisement',
  other: 'Other'
};

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [findUs, setFindUs] = useState('friends');
  const [message, setMessage] = useState('');
  const [gotcha, setGotcha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  // 'loading' | 'ready' | 'blocked'; unused when no site key is configured.
  const [captchaState, setCaptchaState] = useState('loading');
  const captchaBox = useRef(null);
  const captchaWidget = useRef(null);

  useEffect(() => {
    if (!recaptchaSiteKey) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const grecaptcha = await loadRecaptcha();
        if (cancelled || !captchaBox.current) return;
        captchaWidget.current = grecaptcha.render(captchaBox.current, {
          sitekey: recaptchaSiteKey,
          callback: () => setFieldErrors((errors) => ({ ...errors, captcha: '' })),
          'expired-callback': () => setFieldErrors((errors) => ({ ...errors, captcha: CAPTCHA_MESSAGES.rejected }))
        });
        setCaptchaState('ready');
      } catch {
        if (!cancelled) setCaptchaState('blocked');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function captchaToken() {
    if (captchaWidget.current === null) return '';
    return window.grecaptcha.getResponse(captchaWidget.current);
  }

  // Each token works for one submission only, so start the checkbox fresh after every attempt.
  function resetCaptcha() {
    if (captchaWidget.current !== null) window.grecaptcha.reset(captchaWidget.current);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const nextErrors = {};
    if (!isNonEmpty(name)) nextErrors.name = 'Name is required.';
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email.';
    if (!isNonEmpty(message)) nextErrors.message = 'Message is required.';

    const token = recaptchaSiteKey ? captchaToken() : '';
    if (recaptchaSiteKey && captchaState === 'ready' && !token) nextErrors.captcha = CAPTCHA_MESSAGES.unticked;
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (recaptchaSiteKey && captchaState !== 'ready') {
      setError(captchaState === 'blocked' ? CAPTCHA_MESSAGES.blocked : 'The "I\'m not a robot" check is still loading. Try again in a moment.');
      return;
    }

    setLoading(true);
    const result = await submitToFormspree({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      'found us through': FIND_US_LABELS[findUs] || findUs,
      message: message.trim(),
      _subject: `Website inquiry from ${name.trim()}`,
      // Honeypot: Formspree drops submissions where a bot filled this hidden field.
      _gotcha: gotcha,
      ...(token && { 'g-recaptcha-response': token })
    });
    setLoading(false);
    resetCaptcha();

    if (result.ok) {
      setSuccess('Thank you for contacting us! I will get back to you soon.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } else if (isCaptchaRejection(result)) {
      if (!recaptchaSiteKey) {
        // Formspree has reCAPTCHA on but the site has no key to show the checkbox with.
        console.warn(`Formspree rejected the message for reCAPTCHA: "${result.message}". Set PUBLIC_RECAPTCHA_SITE_KEY and add the matching secret key under the form's Custom reCAPTCHA settings.`);
      }
      setError(recaptchaSiteKey ? CAPTCHA_MESSAGES.rejected : CAPTCHA_MESSAGES.notSetUp);
    } else {
      setError(result.message);
    }
  }

  return (
    <form class="form" onSubmit={onSubmit} noValidate>
      {error && <p class="form-message error" role="alert">{error}</p>}
      {success && <p class="form-message success" role="status">{success}</p>}
      <label>
        Name
        <input type="text" name="name" value={name} onInput={(e) => setName(e.target.value)} autocomplete="name" maxlength="100" />
        {fieldErrors.name && <span class="field-error">{fieldErrors.name}</span>}
      </label>
      <label>
        Email
        <input type="email" name="email" value={email} onInput={(e) => setEmail(e.target.value)} autocomplete="email" maxlength="254" />
        {fieldErrors.email && <span class="field-error">{fieldErrors.email}</span>}
      </label>
      <label>
        Phone (optional)
        <input type="tel" name="phone" value={phone} onInput={(e) => setPhone(e.target.value)} autocomplete="tel" maxlength="30" />
      </label>
      <label>
        How did you find us?
        <select name="find-us" value={findUs} onChange={(e) => setFindUs(e.target.value)}>
          {Object.entries(FIND_US_LABELS).map(([value, label]) => (
            <option value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label>
        Message
        <textarea name="message" value={message} onInput={(e) => setMessage(e.target.value)} maxlength="5000"></textarea>
        {fieldErrors.message && <span class="field-error">{fieldErrors.message}</span>}
      </label>
      <input
        class="honeypot"
        type="text"
        name="_gotcha"
        value={gotcha}
        onInput={(e) => setGotcha(e.target.value)}
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
      />
      {recaptchaSiteKey && (
        <div class="captcha">
          <div ref={captchaBox}></div>
          {captchaState === 'loading' && <span class="captcha-note">Loading the "I'm not a robot" check…</span>}
          {captchaState === 'blocked' && <span class="field-error">{CAPTCHA_MESSAGES.blocked}</span>}
          {fieldErrors.captcha && <span class="field-error">{fieldErrors.captcha}</span>}
        </div>
      )}
      <button class="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
