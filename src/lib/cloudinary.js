/**
 * Cloudinary direct-upload utility.
 *
 * Images are uploaded straight from the browser to Cloudinary using an
 * unsigned upload preset — no server round-trip for image bytes.  The
 * backend only ever sees the permanent `https://res.cloudinary.com/…` URL
 * that is returned here, so it stores nothing locally.
 *
 * Required env vars (add to .env / Vercel / Railway):
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME   – your Cloudinary cloud name
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET – an unsigned upload preset
 *
 * How to create an upload preset (Cloudinary dashboard):
 *   Settings → Upload → Upload presets → Add upload preset
 *   Set signing mode = "Unsigned", folder = "afrochow"
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a File object directly to Cloudinary.
 *
 * @param {File}   file    - The image file to upload
 * @param {string} folder  - Sub-folder under "afrochow/" (e.g. "products", "vendors")
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<string>} Permanent secure CDN URL
 */
export async function uploadToCloudinary(file, folder = 'general', signal) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. ' +
      'Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your .env file.'
    );
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', `afrochow/${folder}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form, signal }
  );

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `Cloudinary upload failed (HTTP ${res.status})`);
  }

  // secure_url is always https://res.cloudinary.com/… — permanent and CDN-backed
  return data.secure_url;
}

/**
 * Map the legacy category strings used throughout the app to clean folder names.
 * Keeps Cloudinary organised without changing every call-site.
 */
export function categoryToFolder(category = '') {
  const map = {
    products:             'products',
    VendorProfileImage:   'vendors',
    CustomerProfileImage: 'customers',
    vendor:               'vendors',
    customer:             'customers',
  };
  return map[category] ?? category.toLowerCase().replace(/\s+/g, '-');
}
