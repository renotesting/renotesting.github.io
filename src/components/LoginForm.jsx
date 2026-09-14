import { useState } from 'preact/hooks';
import { postJson, NETWORK_ERROR_MESSAGE } from '../scripts/api.js';
import { isValidEmail, isNonEmpty } from '../scripts/validation.js';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const nextErrors = {};
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email.';
    if (!isNonEmpty(password)) nextErrors.password = 'Password is required.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const { ok, data } = await postJson('/api/auth/login', { email: email.trim(), password });
      if (ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess(data.message || 'Login successful!');
        window.setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } else {
        setError(data.message || 'Login failed.');
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
        Email
        <input type="email" name="email" value={email} onInput={(e) => setEmail(e.target.value)} autocomplete="email" />
        {fieldErrors.email && <span class="field-error">{fieldErrors.email}</span>}
      </label>
      <label>
        Password
        <input type="password" name="password" value={password} onInput={(e) => setPassword(e.target.value)} autocomplete="current-password" />
        {fieldErrors.password && <span class="field-error">{fieldErrors.password}</span>}
      </label>
      <button class="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}
