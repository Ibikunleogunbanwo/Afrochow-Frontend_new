const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Delete a previously uploaded image by URL.
 * Silently ignores failures so a deletion error never blocks an upload flow.
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
      console.warn("Image cleanup returned non-OK status:", res.status, imageUrl);
    }
  } catch (err) {
    console.warn("Image cleanup failed:", err);
  }
}

export class ImageUploadAPI {
  /**
   * Upload a registration image.
   * @param {File} file - The file to upload
   * @param {string} category - Image category (e.g. 'VendorProfileImage', 'CustomerProfileImage')
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation
   * @returns {Promise<Object>} - Response JSON with imageUrl
   *
   * @example
   * const response = await ImageUploadAPI.uploadRegistrationImage(file, 'VendorProfileImage');
   * console.log(response.imageUrl);
   */
  static async uploadRegistrationImage(file, category, signal) {
    if (!file) throw new Error('File is required');
    if (!category) throw new Error('Category is required');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await fetch(`${API_BASE_URL}/images/upload/registration`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(
        data?.data?.message ?? data?.message ?? 'Image upload failed'
      );
    }

    // Normalise: backend may wrap the URL under data.data.imageUrl (new format)
    // or return it flat as data.imageUrl (old format). Always surface it at the
    // top level so every caller can simply do `response.imageUrl`.
    const imageUrl = data?.data?.imageUrl ?? data?.imageUrl;
    if (!imageUrl) throw new Error('Image upload succeeded but no URL was returned');

    return { ...data, imageUrl };
  }

  /**
   * Upload a profile image for an authenticated user.
   * @param {File} file - The profile image file to upload
   * @param {string} category - Image category (e.g. 'CustomerProfileImage')
   * @param {string} userId - The user's public ID
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation
   * @returns {Promise<Object>} - Response JSON with imageUrl always at the top level
   *
   * @example
   * const response = await ImageUploadAPI.uploadProfileImage(file, 'CustomerProfileImage', userId);
   * console.log(response.imageUrl);
   */
  static async uploadProfileImage(file, category, userId, signal) {
    if (!file) throw new Error('File is required');
    if (!category) throw new Error('Category is required');
    if (!userId) throw new Error('userId is required');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('userId', userId);

    const response = await fetch(`${API_BASE_URL}/images/upload/user`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(
        data?.data?.message ?? data?.message ?? 'Profile image upload failed'
      );
    }

    const imageUrl = data?.data?.imageUrl ?? data?.imageUrl;
    if (!imageUrl) throw new Error('Profile image upload succeeded but no URL was returned');

    return { ...data, imageUrl };
  }
}