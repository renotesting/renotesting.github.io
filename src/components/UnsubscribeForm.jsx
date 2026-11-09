import { useEffect, useState } from 'preact/hooks';
import { postJson, NETWORK_ERROR_MESSAGE } from '../scripts/api.js';

export default function UnsubscribeForm() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '');
  }, []);

  async function unsubscribe() {
    setError('');
    setLoading(true);
    try {
      const { ok, data } = await postJson('/api/email/unsubscribe', { token });
      if (ok) {
        setSuccess(data.message || 'You have been unsubscribed.');
      } else {
        setError(data.message || 'Could not unsubscribe you.');
      }
    } catch {
      setError(NETWORK_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return <p class="form-message success" role="status">{success}</p>;
  }

  if (!token) {
    return <p>Please use the unsubscribe link at the bottom of any RenoFitness email.</p>;
  }

  return (
    <div class="form">
      {error && <p class="form-message error" role="alert">{error}</p>}
      <button class="btn btn-primary" type="button" disabled={loading} onClick={unsubscribe}>
        {loading ? 'Unsubscribing…' : 'Unsubscribe me'}
      </button>
    </div>
  );
}
