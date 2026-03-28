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

  // ================= CUSTOMER REVIEWS (authenticated) =================

  /**
   * Check whether the authenticated customer can review a vendor.
   * Returns { canReview, hasOrdered, alreadyReviewed, eligibleOrders: [{ publicOrderId, orderTime, totalAmount }] }
   */
  getEligibleOrders: (vendorPublicId) =>
    fetchWithCredentials(
      `${API_BASE_URL}/customer/reviews/eligible?vendorPublicId=${encodeURIComponent(vendorPublicId)}`
    ),

  createReview: (data) =>
    fetchWithCredentials(`${API_BASE_URL}/customer/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateReview: (reviewId, data) =>
    fetchWithCredentials(`${API_BASE_URL}/customer/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMyReview: (reviewId) =>
    fetchWithCredentials(`${API_BASE_URL}/customer/reviews/${reviewId}`, {
      method: 'DELETE',
    }),

  getMyReviews: () =>
    fetchWithCredentials(`${API_BASE_URL}/customer/reviews`),

  markHelpful: (reviewId) =>
    fetchWithCredentials(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
      method: 'PATCH',
    }),
};
