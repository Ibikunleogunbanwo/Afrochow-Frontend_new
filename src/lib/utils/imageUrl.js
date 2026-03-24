/**
 * Resolves a product/vendor image URL returned by the Afrochow backend.
 *
 * The backend sometimes returns a relative path such as
 *   /api/images/products/<id>.jpg
 * instead of a fully-qualified URL.  When the browser sees a relative src it
 * resolves it against the *page* origin (e.g. localhost:3000 or
 * app.afrochow.ca), which is wrong — the image actually lives on the API
 * server (localhost:8080 / api.afrochow.ca).
 *
 * This helper is intentionally narrow:
 *   - null / undefined           → returned as null (caller shows placeholder)
 *   - already absolute (http/https) → returned unchanged (Cloudinary, S3, etc.)
 *   - local Next.js public asset (/image/..., /icons/...) → returned unchanged
 *   - Afrochow backend path (/api/...) → API origin prepended
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

  // Already absolute — Cloudinary, S3, external CDN, or full Afrochow URL
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // Local Next.js public-folder asset — leave as-is so the browser resolves
  // it against the page origin correctly (e.g. /image/amala.jpg)
  if (!url.startsWith('/api/')) return url;

  // Afrochow backend relative path — prepend the API server origin
  return `${API_ORIGIN}${url}`;
}
