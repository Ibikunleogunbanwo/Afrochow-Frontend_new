import { API_BASE_URL, fetchWithCredentials } from '../httpClient';

export const VendorReviewsAPI = {
  // Authenticated - get my own vendor reviews (includes hidden)
  getMyVendorReviews: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/reviews`, {
      method: 'GET',
    });
  },

  // Authenticated - get my own vendor review statistics
  getMyVendorReviewStats: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/reviews/stats`, {
      method: 'GET',
    });
  },
};
