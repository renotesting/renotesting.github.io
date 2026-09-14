/**
 * Escape untrusted strings before interpolating into HTML email bodies.
 */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHeaderBreaks(value) {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

module.exports = {
  escapeHtml,
  stripHeaderBreaks
};
