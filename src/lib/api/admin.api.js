import { API_BASE_URL, fetchWithCredentials } from './httpClient';

export const AdminAPI = {
  getAdminData: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/admin/profile`, {
      method: 'GET',
    });
  },
};
