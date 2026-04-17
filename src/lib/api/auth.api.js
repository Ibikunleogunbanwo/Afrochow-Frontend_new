
import { API_BASE_URL, fetchWithCredentials } from './httpClient';

export const AuthAPI = {

  // ─── Session ───────────────────────────────────────────────────────────────

  login: async (identifier, password) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  googleAuth: async (code) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  logout: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
  },

  /**
   * Sign the user out of every active session (revoke all refresh tokens).
   * Requires password re-entry as a defence against a leaked access token
   * being used to self-lock the legitimate user out of their account.
   */
  logoutAllDevices: async (password) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/logout-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
  },

  /**
   * Refresh the access token using the HttpOnly refresh token cookie.
   *
   * @param {Function} onAuthCleared - Optional callback invoked when the
   *   refresh token is invalid/expired (401 or 403). Use this to clear
   *   auth state in your store/context without coupling AuthAPI to Redux.
   *
   * Returns { success: false, tokenExpired: true } on 401/403 so the
   * caller can skip any retry logic rather than relying on a throw.
   * Re-throws on all other errors (500, network failure, etc.).
   */
  refreshToken: async (onAuthCleared) => {
    try {
      return await fetchWithCredentials(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
      });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        // Refresh token is gone from the DB (backend restart, rotation
        // invalidation, or manual revoke). Clear client auth state silently
        // — no toast, no redirect loop.
        onAuthCleared?.();
        return { success: false, tokenExpired: true };
      }
      // Network error, 500, etc. — re-throw so the caller can decide
      throw error;
    }
  },

  getCurrentUser: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
    });
  },

  /**
   * Passive auth check — never throws.
   * Returns { isAuthenticated, user } regardless of outcome.
   */
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

  // ─── User profile ──────────────────────────────────────────────────────────

  updateUserProfile: async (fields) => {
    return fetchWithCredentials(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      body: JSON.stringify(fields),
    });
  },

  // ─── Passwords ─────────────────────────────────────────────────────────────

  changePassword: async (currentPassword, newPassword) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  deleteAccount: async (password) => {
    return fetchWithCredentials(`${API_BASE_URL}/user/account`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
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