const API_BASE = import.meta.env.PUBLIC_API_URL || '';

export const NETWORK_ERROR_MESSAGE = "Couldn't reach the server. Check your connection and try again.";

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

export async function postJson(path, body) {
  let response;
  try {
    response = await fetch(apiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch {
    const error = new Error(NETWORK_ERROR_MESSAGE);
    error.network = true;
    throw error;
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  return { ok: response.ok, status: response.status, data };
}
