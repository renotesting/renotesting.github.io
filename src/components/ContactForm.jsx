import { useState } from 'preact/hooks';
import { submitToFormspree } from '../scripts/formspree.js';
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

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const nextErrors = {};
    if (!isNonEmpty(name)) nextErrors.name = 'Name is required.';
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email.';
    if (!isNonEmpty(message)) nextErrors.message = 'Message is required.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    const result = await submitToFormspree({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      'found us through': FIND_US_LABELS[findUs] || findUs,
      message: message.trim(),
      _subject: `Website inquiry from ${name.trim()}`,
      // Honeypot: Formspree drops submissions where a bot filled this hidden field.
      _gotcha: gotcha
    });
    setLoading(false);

    if (result.ok) {
      setSuccess('Thank you for contacting us! I will get back to you soon.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
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
      <button class="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
