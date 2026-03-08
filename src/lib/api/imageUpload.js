const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export class ImageUploadAPI {
  /**
   * Upload a registration image
   * @param {File} file - The file to upload
   * @param {string} category - Image category (e.g., 'CustomerProfileImage', 'VendorLogo', 'ProductImage')
   * @param {string} signal - Optional abort signal for cancellation
   * @returns {Promise<Object>} - Response JSON with imageUrl
   *
   * @example
   * const response = await ImageUploadAPI.uploadRegistrationImage(file, 'VendorLogo');
   * console.log(response.imageUrl); // "https://cdn.afrochow.com/..."
   */
  static async uploadRegistrationImage(file, category = 'CustomerProfileImage', signal) {
    if (!file) {
      throw new Error('File is required');
    }

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
      throw new Error(data.message || 'Image upload failed');
    }

    return data;
  }

  /**
   * Upload profile image for authenticated customer
   * @param {File} file - The profile image file to upload
   * @param {string} signal - Optional abort signal for cancellation
   * @returns {Promise<Object>} - Response JSON with imageUrl
   *
   * @example
   * const response = await ImageUploadAPI.uploadProfileImage(file);
   * console.log(response.data.imageUrl); // "http://localhost:8080/api/images/profiles/..."
   */
  static async uploadProfileImage(file, signal) {
    if (!file) {
      throw new Error('File is required');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/customer/profile/image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Profile image upload failed');
    }

    return data;
  }
}