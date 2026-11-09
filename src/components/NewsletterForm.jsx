import { useState } from 'preact/hooks';
import { postJson, NETWORK_ERROR_MESSAGE } from '../scripts/api.js';
import { isValidEmail, isNonEmpty } from '../scripts/validation.js';

export default function NewsletterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const { ok, data } = await postJson('/api/email/subscribe', {
        name: name.trim(),
        email: email.trim()
      });
      if (ok) {
        setSuccess(data.message || 'Subscription successful!');
        setName('');
        setEmail('');
      } else {
        setError(data.message || 'Subscription failed.');
      }
    } catch (err) {
      setError(err.network ? NETWORK_ERROR_MESSAGE : NETWORK_ERROR_MESSAGE);
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
      <button class="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
}
