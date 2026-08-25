/**
 * Resolves an image URL from any Afrochow API response to a fully-qualified,
 * correct URL for the current environment.
 *
 * Problem: Product/vendor images hosted on the Afrochow backend are stored in
 * the database as the URL that existed at upload time.  That URL may point to:
 *   - localhost:8080         (uploaded during local dev)
 *   - a previous hosting provider's domain (uploaded before a backend migration)
 *   - a relative path        (/api/images/products/…)
 *   - the correct production URL (https://api.afrochow.ca/api/images/…)
 *
 * All of those cases share one thing: the path always contains /api/images/.
 * We extract that path segment and rebuild the URL with the correct API origin
 * for the current deployment.
 *
 * External images (Cloudinary, S3, etc.) never contain /api/images/. Cloudinary
 * URLs additionally get on-the-fly transformation params injected
 * (f_auto,q_auto[,w_xxx]) so the CDN delivers an auto-optimized, correctly-
 * sized variant instead of the full-size original. Non-Cloudinary external
 * URLs (S3, etc.) pass through unchanged.
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
//   https://api.afrochow.ca/api/images/products/abc-123.jpg
//   /api/images/products/abc-123.jpg
const AFROCHOW_IMAGE_PATH_RE = /(\/api\/images\/.+)/;

// Cloudinary upload URLs look like …/image/upload/v<version>/<public_id>.
// Transformation params go between "/image/upload/" and the version segment.
const CLOUDINARY_UPLOAD_RE = /(\/image\/upload\/)(v\d+\/.*)/;
const CLOUDINARY_HOST = 'res.cloudinary.com';

/**
 * @param {string|null|undefined} url  Raw imageUrl from an API response.
 * @param {{width?: number}} [opts]   Optional display width for Cloudinary
 *                                    width-capping (e.g. { width: 600 }).
 * @returns {string|null}             Absolute URL safe to use in <img src>.
 */
export function resolveImageUrl(url, { width } = {}) {
  if (!url) return null;

  // Afrochow-hosted image: extract the canonical path and prepend the correct
  // API origin for this deployment — fixes wrong-host and relative-path cases.
  const match = url.match(AFROCHOW_IMAGE_PATH_RE);
  if (match) {
    return `${API_ORIGIN}${match[1]}`;
  }

  // Cloudinary: inject f_auto,q_auto (and optionally a width cap) so the CDN
  // serves WebP/AVIF at the right size instead of the full original.
  if (url.includes(CLOUDINARY_HOST) && url.includes('/image/upload/')) {
    const transform = ['f_auto', 'q_auto', width ? `w_${width}` : null]
      .filter(Boolean)
      .join(',');
    return url.replace(CLOUDINARY_UPLOAD_RE, `$1${transform}/$2`);
  }

  // Everything else (S3, Next.js public assets, etc.) — unchanged.
  return url;
}
