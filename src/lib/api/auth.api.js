import { API_BASE_URL, fetchWithCredentials } from './httpClient';

export const AuthAPI = {
  // ================= SESSION =================

  login: async (identifier, password) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  logout: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
  },

  logoutAllDevices: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/logout-all`, {
      method: 'POST',
    });
  },

  refreshToken: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
    });
  },

  checkAuth: async () => {
    try {
      const result = await AuthAPI.getCurrentUser();
      return {
        isAuthenticated: result.success,
        user: result.data,
      };
    } catch {
      return {
        isAuthenticated: false,
        user: null,
      };
    }
  },

  // ================= PASSWORDS =================

  changePassword: async (currentPassword, newPassword) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  forgotPassword: async (email) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ identifier: email }),
    });
  },

  resetPassword: async (token, newPassword) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};
