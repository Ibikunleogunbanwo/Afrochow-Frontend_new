import { API_BASE_URL, fetchWithCredentials } from './httpClient';

// ── Admin Profile ──────────────────────────────────────────────────────────
export const AdminProfileAPI = {
    getProfile:    ()     => fetchWithCredentials(`${API_BASE_URL}/admin/profile`),
    updateProfile: (data) => fetchWithCredentials(`${API_BASE_URL}/admin/profile`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Admin User Management ──────────────────────────────────────────────────
export const AdminUsersAPI = {
    getAll:      ()           => fetchWithCredentials(`${API_BASE_URL}/admin/users`),
    getById:     (id)         => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}`),
    getByRole:   (role)       => fetchWithCredentials(`${API_BASE_URL}/admin/users/role/${role}`),
    getActive:   ()           => fetchWithCredentials(`${API_BASE_URL}/admin/users/active`),
    getInactive: ()           => fetchWithCredentials(`${API_BASE_URL}/admin/users/inactive`),
    search:      (query)      => fetchWithCredentials(`${API_BASE_URL}/admin/users/search?query=${encodeURIComponent(query)}`),
    getStats:    ()           => fetchWithCredentials(`${API_BASE_URL}/admin/users/stats`),
    activate:    (id)         => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}/activate`,   { method: 'PATCH' }),
    deactivate:  (id)         => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}/deactivate`, { method: 'PATCH' }),
    changeRole:  (id, role)   => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}/role?newRole=${role}`, { method: 'PATCH' }),
    deleteUser:  (id)         => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}`,            { method: 'DELETE' }),
};

// ── Admin Vendor Management ────────────────────────────────────────────────
export const AdminVendorsAPI = {
    getAll:      ()   => fetchWithCredentials(`${API_BASE_URL}/admin/vendors`),
    getById:     (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}`),
    getPending:  ()   => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/pending`),
    getVerified: ()   => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/verified`),
    verify:      (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/verify`,     { method: 'PATCH' }),
    unverify:    (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/unverify`,   { method: 'PATCH' }),
    activate:    (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/activate`,   { method: 'PATCH' }),
    deactivate:  (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/deactivate`, { method: 'PATCH' }),
    reject:      (id, reason) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
    }),
};

// ── Admin Order Management ─────────────────────────────────────────────────
export const AdminOrdersAPI = {
    getAll:     ()       => fetchWithCredentials(`${API_BASE_URL}/admin/orders`),
    getActive:  ()       => fetchWithCredentials(`${API_BASE_URL}/admin/orders/active`),
    getByStatus:(status) => fetchWithCredentials(`${API_BASE_URL}/admin/orders/status/${status}`),
    getById:    (id)     => fetchWithCredentials(`${API_BASE_URL}/admin/orders/${id}`),
};

// ── Analytics ──────────────────────────────────────────────────────────────
const buildDateQuery = (params) => {
    if (!params?.startDate || !params?.endDate) return '';
    return `?startDate=${encodeURIComponent(params.startDate)}&endDate=${encodeURIComponent(params.endDate)}`;
};

export const AdminAnalyticsAPI = {
    getPlatform: (params) => fetchWithCredentials(`${API_BASE_URL}/analytics/admin/platform${buildDateQuery(params)}`),
    getTrends:   (params) => fetchWithCredentials(`${API_BASE_URL}/analytics/admin/trends${buildDateQuery(params)}`),
};

// ── Admin Reviews ──────────────────────────────────────────────────────────
export const AdminReviewsAPI = {
    getAll:    ()   => fetchWithCredentials(`${API_BASE_URL}/admin/reviews`),
    getHidden: ()   => fetchWithCredentials(`${API_BASE_URL}/admin/reviews/hidden`),
    getStats:  ()   => fetchWithCredentials(`${API_BASE_URL}/admin/reviews/stats`),
    hide:      (id) => fetchWithCredentials(`${API_BASE_URL}/admin/reviews/${id}/hide`, { method: 'PATCH' }),
    show:      (id) => fetchWithCredentials(`${API_BASE_URL}/admin/reviews/${id}/show`, { method: 'PATCH' }),
    delete:    (id) => fetchWithCredentials(`${API_BASE_URL}/admin/reviews/${id}`,      { method: 'DELETE' }),
};

// ── Admin Promotions ───────────────────────────────────────────────────────
export const AdminPromotionsAPI = {
    getAll:    ()         => fetchWithCredentials(`${API_BASE_URL}/promotions/admin`),
    getById:   (id)       => fetchWithCredentials(`${API_BASE_URL}/promotions/admin/${id}`),
    create:    (data)     => fetchWithCredentials(`${API_BASE_URL}/promotions/admin`,      { method: 'POST',   body: JSON.stringify(data) }),
    update:    (id, data) => fetchWithCredentials(`${API_BASE_URL}/promotions/admin/${id}`, { method: 'PUT',    body: JSON.stringify(data) }),
    deactivate:(id)       => fetchWithCredentials(`${API_BASE_URL}/promotions/admin/${id}`, { method: 'DELETE' }),
};

// ── Admin Categories ───────────────────────────────────────────────────────
export const AdminCategoriesAPI = {
    getAll:         ()            => fetchWithCredentials(`${API_BASE_URL}/admin/categories`),
    create:         (data)        => fetchWithCredentials(`${API_BASE_URL}/admin/categories`,                         { method: 'POST',  body: JSON.stringify(data) }),
    update:         (id, data)    => fetchWithCredentials(`${API_BASE_URL}/admin/categories/${id}`,                   { method: 'PUT',   body: JSON.stringify(data) }),
    delete:         (id)          => fetchWithCredentials(`${API_BASE_URL}/admin/categories/${id}`,                   { method: 'DELETE' }),
    activate:       (id)          => fetchWithCredentials(`${API_BASE_URL}/admin/categories/${id}/activate`,          { method: 'PATCH' }),
    deactivate:     (id)          => fetchWithCredentials(`${API_BASE_URL}/admin/categories/${id}/deactivate`,        { method: 'PATCH' }),
    setDisplayOrder:(id, order)   => fetchWithCredentials(`${API_BASE_URL}/admin/categories/${id}/display-order?order=${order}`, { method: 'PATCH' }),
};

// ── Notifications ──────────────────────────────────────────────────────────
export const AdminNotificationsAPI = {
    broadcast:           (data)                => fetchWithCredentials(`${API_BASE_URL}/notifications/admin/broadcast`,               { method: 'POST', body: JSON.stringify(data) }),
    getBroadcastHistory: (page = 0, size = 20) => fetchWithCredentials(`${API_BASE_URL}/notifications/admin/broadcasts?page=${page}&size=${size}`),
};

// ── Superadmin Only ────────────────────────────────────────────────────────
export const AdminSuperAPI = {
    promote: (id) => fetchWithCredentials(`${API_BASE_URL}/superadmin/users/${id}/promote`, { method: 'PATCH' }),
    demote:  (id) => fetchWithCredentials(`${API_BASE_URL}/superadmin/users/${id}/demote`,  { method: 'PATCH' }),
};

// ── Legacy default export ──────────────────────────────────────────────────
export const AdminAPI = {
    getAdminData: () => AdminProfileAPI.getProfile(),
};
