/**
 * Resolves a product/vendor image URL returned by the backend.
 *
 * The backend sometimes returns a relative path such as
 *   /api/images/products/<id>.jpg
 * instead of a fully-qualified URL.  When the browser sees a relative src it
 * resolves it against the *page* origin (e.g. localhost:3000 or
 * app.afrochow.ca), which is wrong — the image actually lives on the API
 * server (localhost:8080 / api.afrochow.ca).
 *
 * This helper:
 *   - Returns null/undefined as-is so callers can still show placeholders.
 *   - Returns already-absolute URLs (http/https) unchanged.
 *   - Prepends the API server origin to relative paths.
 */

const API_ORIGIN = (() => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  try {
    return new URL(base).origin; // e.g. "https://api.afrochow.ca"
  } catch {
    return 'http://localhost:8080';
  }
})();

/**
 * @param {string|null|undefined} url  Raw imageUrl from an API response.
 * @returns {string|null}              Absolute URL safe to use in <img src>.
 */
export function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Relative path — join with API origin
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}
