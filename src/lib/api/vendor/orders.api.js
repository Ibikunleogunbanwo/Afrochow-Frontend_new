import { API_BASE_URL, fetchWithCredentials } from '../httpClient';

export const VendorOrdersAPI = {
  // ================= FETCHING ORDERS =================

  getVendorOrders: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders`, {
      method: 'GET',
    });
  },

  getVendorOrderById: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}`, {
      method: 'GET',
    });
  },

  getTodayOrders: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/today`, {
      method: 'GET',
    });
  },

  getOrdersByStatus: async (status) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/status/${status}`, {
      method: 'GET',
    });
  },

  getActiveOrders: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/active`, {
      method: 'GET',
    });
  },

  // ================= ORDER STATS =================

  getOrdersRevenue: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/stats/revenue`, {
      method: 'GET',
    });
  },

  getOrderCountStats: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/stats/count`, {
      method: 'GET',
    });
  },

  // ================= ORDER STATUS TRANSITIONS =================

  acceptOrder: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/accept`, {
      method: 'PUT',
    });
  },

  rejectOrder: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/reject`, {
      method: 'PUT',
    });
  },

  startPreparingOrder: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/preparing`, {
      method: 'PUT',
    });
  },

  markOrderReady: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/ready`, {
      method: 'PUT',
    });
  },

  markOrderOutForDelivery: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/out-for-delivery`, {
      method: 'PUT',
    });
  },

  markOrderDelivered: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/delivered`, {
      method: 'PUT',
    });
  },

  /**
   * Vendor cancels an order they already accepted (CONFIRMED or PREPARING).
   * A reason is required — it is shown to the customer and stored on the order.
   */
  unableToFulfil: async (publicOrderId, reason) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/unable-to-fulfil`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
  },
};
