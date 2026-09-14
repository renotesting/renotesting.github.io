import { useState } from 'preact/hooks';
import { postJson, NETWORK_ERROR_MESSAGE } from '../scripts/api.js';
import { isValidEmail, isNonEmpty } from '../scripts/validation.js';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [findUs, setFindUs] = useState('friends');
  const [message, setMessage] = useState('');
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
    try {
      const { ok, data } = await postJson('/api/contact', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: 'Website inquiry',
        findUs,
        message: message.trim()
      });
      if (ok) {
        setSuccess(data.message || 'Thank you for contacting us!');
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        setError(data.message || 'Could not send your message.');
      }
    } catch {
      setError(NETWORK_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form class="form" onSubmit={onSubmit} noValidate>
      {error && <p class="form-message error" role="alert">{error}</p>}
      {success && <p class="form-message success" role="status">{success}</p>}
      <label>
        Name
        <input type="text" name="name" value={name} onInput={(e) => setName(e.target.value)} autocomplete="name" />
        {fieldErrors.name && <span class="field-error">{fieldErrors.name}</span>}
      </label>
      <label>
        Email
        <input type="email" name="email" value={email} onInput={(e) => setEmail(e.target.value)} autocomplete="email" />
        {fieldErrors.email && <span class="field-error">{fieldErrors.email}</span>}
      </label>
      <label>
        Phone (optional)
        <input type="tel" name="phone" value={phone} onInput={(e) => setPhone(e.target.value)} autocomplete="tel" />
      </label>
      <label>
        How did you find us?
        <select name="find-us" value={findUs} onChange={(e) => setFindUs(e.target.value)}>
          <option value="friends">Friends</option>
          <option value="search">Search engine</option>
          <option value="ad">Advertisement</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label>
        Message
        <textarea name="message" value={message} onInput={(e) => setMessage(e.target.value)} maxlength="5000"></textarea>
        {fieldErrors.message && <span class="field-error">{fieldErrors.message}</span>}
      </label>
      <button class="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
