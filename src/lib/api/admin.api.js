import { API_BASE_URL, fetchWithCredentials } from './httpClient';

// ── Admin Profile ──────────────────────────────────────────────────────────
export const AdminProfileAPI = {
    getProfile: () =>
        fetchWithCredentials(`${API_BASE_URL}/admin/profile`),
    updateProfile: (data) =>
        fetchWithCredentials(`${API_BASE_URL}/admin/profile`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Admin User Management ──────────────────────────────────────────────────
export const AdminUsersAPI = {
    getAll:        ()           => fetchWithCredentials(`${API_BASE_URL}/admin/users`),
    getById:       (id)         => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}`),
    getByRole:     (role)       => fetchWithCredentials(`${API_BASE_URL}/admin/users/role/${role}`),
    getActive:     ()           => fetchWithCredentials(`${API_BASE_URL}/admin/users/active`),
    getInactive:   ()           => fetchWithCredentials(`${API_BASE_URL}/admin/users/inactive`),
    search:        (query)      => fetchWithCredentials(`${API_BASE_URL}/admin/users/search?query=${encodeURIComponent(query)}`),
    getStats:      ()           => fetchWithCredentials(`${API_BASE_URL}/admin/users/stats`),
    activate:      (id)         => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}/activate`,   { method: 'PATCH' }),
    deactivate:    (id)         => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}/deactivate`, { method: 'PATCH' }),
    changeRole:    (id, role)   => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}/role?newRole=${role}`, { method: 'PATCH' }),
    deleteUser:    (id)         => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}`,            { method: 'DELETE' }),
};

// ── Admin Vendor Management ────────────────────────────────────────────────
export const AdminVendorsAPI = {
    getAll:        ()   => fetchWithCredentials(`${API_BASE_URL}/admin/vendors`),
    getPending:    ()   => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/pending`),
    getVerified:   ()   => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/verified`),
    verify:        (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/verify`,     { method: 'PATCH' }),
    unverify:      (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/unverify`,   { method: 'PATCH' }),
    activate:      (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/activate`,   { method: 'PATCH' }),
    deactivate:    (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/deactivate`, { method: 'PATCH' }),
};

// Legacy default export for existing layout usage
export const AdminAPI = {
    getAdminData: () => AdminProfileAPI.getProfile(),
};
