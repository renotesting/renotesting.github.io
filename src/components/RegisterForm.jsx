import { useState } from 'preact/hooks';
import { postJson, NETWORK_ERROR_MESSAGE } from '../scripts/api.js';
import { isValidEmail, isNonEmpty, passwordsMatch } from '../scripts/validation.js';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (!isNonEmpty(password) || password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }
    if (!passwordsMatch(password, confirmPassword)) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const { ok, data } = await postJson('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword
      });
      if (ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess(data.message || 'Registration successful!');
        window.setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } else {
        setError(data.message || 'Registration failed.');
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
        Password
        <input type="password" name="password" value={password} onInput={(e) => setPassword(e.target.value)} autocomplete="new-password" />
        {fieldErrors.password && <span class="field-error">{fieldErrors.password}</span>}
      </label>
      <label>
        Confirm password
        <input type="password" name="confirmPassword" value={confirmPassword} onInput={(e) => setConfirmPassword(e.target.value)} autocomplete="new-password" />
        {fieldErrors.confirmPassword && <span class="field-error">{fieldErrors.confirmPassword}</span>}
      </label>
      <button class="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
