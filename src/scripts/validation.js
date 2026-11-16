export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function isNonEmpty(value) {
  return Boolean(String(value || '').trim());
}
