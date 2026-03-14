import { API_BASE_URL, fetchWithCredentials } from './httpClient';

export const ReviewsAPI = {
  // ================= PRODUCT REVIEWS (public) =================

  getProductReviews: async (productPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/products/${productPublicId}/reviews`, {
      method: 'GET',
    });
  },

  getProductAverageRating: async (productPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/products/${productPublicId}/rating`, {
      method: 'GET',
    });
  },

  // ================= VENDOR REVIEWS (public) =================

  getVendorsReviews: async (vendorPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendors/${vendorPublicId}/reviews`, {
      method: 'GET',
    });
  },

  getVendorAverageRating: async (vendorPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendors/${vendorPublicId}/rating`, {
      method: 'GET',
    });
  },

  filterVendorReviews: async (vendorPublicId, minRating) => {
    return fetchWithCredentials(
      `${API_BASE_URL}/vendors/${vendorPublicId}/reviews/filter?minRating=${minRating}`,
      { method: 'GET' }
    );
  },

  getAllProductReviews: async (vendorPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendors/${vendorPublicId}/products/reviews`, {
      method: 'GET',
    });
  },

  getAllProductsAverageRating: async (vendorPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendors/${vendorPublicId}/products/rating`, {
      method: 'GET',
    });
  },
};
