import { API_BASE_URL, fetchWithCredentials } from './httpClient';

export const CustomerAPI = {
  // ================= PROFILE =================

  getCustomerProfile: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/profile`, {
      method: 'GET',
    });
  },

  updateCustomerProfile: async (data) => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  completeProfile: async (data) => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/profile/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ================= ADDRESSES =================

  savedAddress: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/addresses`, {
      method: 'GET',
    });
  },

  addAddress: async (addressData) => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/addresses`, {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  updateAddress: async (publicAddressId, addressData) => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/addresses/${publicAddressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  deleteAddress: async (addressId) => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },

  setDefaultAddress: async (publicAddressId) => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/addresses/${publicAddressId}/set-default`, {
      method: 'POST',
    });
  },

  // ================= NOTIFICATION PREFERENCE =================

  updateNotificationPreference: async (enabled) => {
    return fetchWithCredentials(
      `${API_BASE_URL}/customer/profile/notifications?enabled=${enabled}`,
      { method: 'PATCH' }
    );
  },
};
