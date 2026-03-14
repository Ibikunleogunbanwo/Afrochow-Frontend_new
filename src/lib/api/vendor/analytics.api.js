import { API_BASE_URL, fetchWithCredentials } from '../httpClient';

export const VendorAnalyticsAPI = {
  getVendorAnalytics: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/analytics/vendor`, {
      method: 'GET',
    });
  },

  getVendorSalesReport: async (startDate, endDate) => {
    return fetchWithCredentials(
      `${API_BASE_URL}/analytics/vendor/sales-report?startDate=${startDate}&endDate=${endDate}`,
      { method: 'GET' }
    );
  },

  getVendorPopularProducts: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/analytics/vendor/popular-products`, {
      method: 'GET',
    });
  },
};
