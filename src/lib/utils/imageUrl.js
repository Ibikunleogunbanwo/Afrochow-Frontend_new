/**
 * Resolves an image URL from any Afrochow API response to a fully-qualified,
 * correct URL for the current environment.
 *
 * Problem: Product/vendor images hosted on the Afrochow backend are stored in
 * the database as the URL that existed at upload time.  That URL may point to:
 *   - localhost:8080         (uploaded during local dev)
 *   - *.up.railway.app       (uploaded against the Railway staging server)
 *   - a relative path        (/api/images/products/…)
 *   - the correct production URL (https://api.afrochow.ca/api/images/…)
 *
 * All of those cases share one thing: the path always contains /api/images/.
 * We extract that path segment and rebuild the URL with the correct API origin
 * for the current deployment.
 *
 * External images (Cloudinary, S3, etc.) never contain /api/images/, so they
 * pass through completely unchanged.
 *
 * Local Next.js public assets (/image/amala.jpg, /icons/…) also pass through
 * unchanged because they don't match the pattern.
 */

const API_ORIGIN = (() => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  try {
    return new URL(base).origin; // e.g. "https://api.afrochow.ca"
  } catch {
    return 'http://localhost:8080';
  }
})();

// Matches the Afrochow image path regardless of what host precedes it.
// e.g. captures "/api/images/products/abc-123.jpg" from any of:
//   http://localhost:8080/api/images/products/abc-123.jpg
//   https://afrochow-backendnew-production.up.railway.app/api/images/products/abc-123.jpg
//   https://api.afrochow.ca/api/images/products/abc-123.jpg
//   /api/images/products/abc-123.jpg
const AFROCHOW_IMAGE_PATH_RE = /(\/api\/images\/.+)/;

/**
 * @param {string|null|undefined} url  Raw imageUrl from an API response.
 * @returns {string|null}              Absolute URL safe to use in <img src>.
 */
export function resolveImageUrl(url) {
  if (!url) return null;

  // Afrochow-hosted image: extract the canonical path and prepend the correct
  // API origin for this deployment — fixes wrong-host and relative-path cases.
  const match = url.match(AFROCHOW_IMAGE_PATH_RE);
  if (match) {
    return `${API_ORIGIN}${match[1]}`;
  }

  // Everything else (Cloudinary, S3, Next.js public assets, etc.) — unchanged.
  return url;
}
