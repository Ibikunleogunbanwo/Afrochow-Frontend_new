import { API_BASE_URL, fetchWithCredentials, extractErrorMessage } from '../httpClient';

export const VendorProductsAPI = {
  getAllVendorProducts: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/products`, {
      method: 'GET',
    });
  },

  getVendorProduct: async (publicProductId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/products/${publicProductId}`, {
      method: 'GET',
    });
  },

  createProducts: async (productData) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  editVendorProduct: async (publicProductId, productData) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/products/${publicProductId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  deleteVendorProduct: async (publicProductId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/products/${publicProductId}`, {
      method: 'DELETE',
    });
  },

  toggleProductAvailability: async (publicProductId, available) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/products/${publicProductId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    });
  },

  uploadProductImage: async (publicProductId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/vendor/products/${publicProductId}/image`, {
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
