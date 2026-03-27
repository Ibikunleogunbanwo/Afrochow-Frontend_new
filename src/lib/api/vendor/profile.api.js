import { API_BASE_URL, fetchWithCredentials, extractErrorMessage } from '../httpClient';

export const VendorProfileAPI = {
  getVendorProfile: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/profile`, {
      method: 'GET',
    });
  },

  updateVendorProfile: async (profileData) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  updateVendorAddress: async (addressData) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/profile/address`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  resubmitForReview: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/profile/resubmit`, {
      method: 'POST',
    });
  },

  uploadVendorImage: async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/vendor/profile/image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const json = await response.json();

    if (!response.ok || json.success === false) {
      const errorMessage = extractErrorMessage(json, 'Image upload failed');
      throw new Error(errorMessage);
    }

    return json;
  },
};
