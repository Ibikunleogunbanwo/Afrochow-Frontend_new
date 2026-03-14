import { API_BASE_URL, fetchWithCredentials } from './httpClient';

export const RegistrationAPI = {
  registerCustomer: async (data) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/register/customer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  registerVendor: async (data) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/register/vendor`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  registerAdmin: async (data) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/register/admin`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyEmail: async (code) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  resendVerificationEmail: async (email) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};
