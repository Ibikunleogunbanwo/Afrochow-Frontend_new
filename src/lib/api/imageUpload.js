import { uploadToCloudinary, categoryToFolder } from '@/lib/cloudinary';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Delete a previously uploaded image by URL.
 * For Cloudinary URLs the actual deletion is handled server-side (requires
 * API secret) — the backend DELETE /images endpoint takes care of it.
 * Silently ignores failures so a deletion error never blocks an upload flow.
 *
 * @param {string} imageUrl - The full image URL to delete
 */
export async function deleteImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) return;
  try {
    const res = await fetch(
      `${API_BASE_URL}/images?imageUrl=${encodeURIComponent(imageUrl)}`,
      { method: 'DELETE' }
    );
    if (!res.ok) {
      console.warn('Image cleanup returned non-OK status:', res.status, imageUrl);
    }
  } catch (err) {
    console.warn('Image cleanup failed:', err);
  }
}

export class ImageUploadAPI {
  /**
   * Upload a registration image (product, vendor asset, etc.) to Cloudinary.
   * Returns `{ imageUrl }` — the same shape as the old backend response so
   * every existing call-site works without changes.
   *
   * @param {File}   file     - The file to upload
   * @param {string} category - Image category ('products', 'VendorProfileImage', …)
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation
   * @returns {Promise<{ imageUrl: string }>}
   */
  static async uploadRegistrationImage(file, category, signal) {
    if (!file) throw new Error('File is required');
    if (!category) throw new Error('Category is required');

    const folder = categoryToFolder(category);
    const imageUrl = await uploadToCloudinary(file, folder, signal);
    return { imageUrl };
  }

  /**
   * Upload a profile image for an authenticated user to Cloudinary.
   * Returns `{ imageUrl }` — same shape as before.
   *
   * @param {File}   file     - The profile image file to upload
   * @param {string} category - Image category ('CustomerProfileImage', …)
   * @param {string} _userId  - Kept for API compatibility; not used with Cloudinary
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation
   * @returns {Promise<{ imageUrl: string }>}
   */
  static async uploadProfileImage(file, category, _userId, signal) {
    if (!file) throw new Error('File is required');
    if (!category) throw new Error('Category is required');

    const folder = categoryToFolder(category);
    const imageUrl = await uploadToCloudinary(file, folder, signal);
    return { imageUrl };
  }
}
