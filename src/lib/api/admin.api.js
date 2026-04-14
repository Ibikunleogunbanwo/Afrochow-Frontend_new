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
    unlock:      (id)         => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}/unlock`,     { method: 'PATCH' }),
    changeRole:  (id, role)   => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}/role?newRole=${role}`, { method: 'PATCH' }),
    deleteUser:  (id)         => fetchWithCredentials(`${API_BASE_URL}/admin/users/${id}`,            { method: 'DELETE' }),
};

// ── Admin Vendor Management ────────────────────────────────────────────────
export const AdminVendorsAPI = {
    // ── List endpoints ──
    getAll:          ()       => fetchWithCredentials(`${API_BASE_URL}/admin/vendors`),
    getById:         (id)     => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}`),
    getPending:      ()       => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/pending`),
    getProvisional:  ()       => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/provisional`),
    getVerified:     ()       => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/verified`),
    getByStatus:     (status) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/by-status/${status}`),

    // ── Status transitions (new state machine) ──
    /**
     * Move a PENDING_REVIEW vendor to PROVISIONAL.
     * Vendor goes live with an order cap; food handling cert still required for full verification.
     */
    approveProvisional: (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/approve-provisional`, { method: 'PATCH' }),

    /**
     * Confirm the vendor's food handling cert and promote PROVISIONAL → VERIFIED.
     */
    verifyCert:      (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/verify-cert`, { method: 'PATCH' }),

    /**
     * Directly promote a vendor to VERIFIED (bypass cert — exceptional use only).
     */
    verify:          (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/verify`,     { method: 'PATCH' }),

    /**
     * Suspend a VERIFIED or PROVISIONAL vendor.
     */
    suspend:         (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/suspend`,    { method: 'PATCH' }),

    /**
     * Reinstate a SUSPENDED vendor back to VERIFIED.
     */
    reinstate:       (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/reinstate`,  { method: 'PATCH' }),

    /**
     * Reject a PENDING_REVIEW or PROVISIONAL vendor.
     */
    reject:          (id, reason) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
    }),

    // ── Stripe ──
    linkStripeAccount: (id, stripeAccountId) => fetchWithCredentials(
        `${API_BASE_URL}/admin/vendors/${id}/stripe-account`,
        { method: 'PATCH', body: JSON.stringify({ stripeAccountId }) }
    ),

    // ── Migration ──
    /**
     * One-time backfill: sets vendorStatus from legacy isVerified/isActive for stores
     * created before the state machine. Only touches rows where vendorStatus IS NULL.
     * Safe to call multiple times. SUPERADMIN only.
     */
    backfillStatus: () => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/backfill-status`, { method: 'POST' }),

    // ── Deprecated aliases (kept for backward compatibility) ──
    /** @deprecated Use suspend() instead */
    deactivate: (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/suspend`,   { method: 'PATCH' }),
    /** @deprecated Use reinstate() instead */
    activate:   (id) => fetchWithCredentials(`${API_BASE_URL}/admin/vendors/${id}/reinstate`, { method: 'PATCH' }),
};

// ── Admin Order Management ─────────────────────────────────────────────────
export const AdminOrdersAPI = {
    getAll:     ()       => fetchWithCredentials(`${API_BASE_URL}/admin/orders`),
    getActive:  ()       => fetchWithCredentials(`${API_BASE_URL}/admin/orders/active`),
    getByStatus:(status) => fetchWithCredentials(`${API_BASE_URL}/admin/orders/status/${status}`),
    getById:    (id)     => fetchWithCredentials(`${API_BASE_URL}/admin/orders/${id}`),
    cancel:     (id)     => fetchWithCredentials(`${API_BASE_URL}/admin/orders/${id}/cancel`, { method: 'POST' }),
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
    create:    (data)     => fetchWithCredentials(`${API_BASE_URL}/promotions/admin`,                    { method: 'POST',   body: JSON.stringify(data) }),
    update:    (id, data) => fetchWithCredentials(`${API_BASE_URL}/promotions/admin/${id}`,              { method: 'PUT',    body: JSON.stringify(data) }),
    deactivate:(id)       => fetchWithCredentials(`${API_BASE_URL}/promotions/admin/${id}`,              { method: 'DELETE' }),
    activate:  (id)       => fetchWithCredentials(`${API_BASE_URL}/promotions/admin/${id}/activate`,     { method: 'PATCH' }),
    delete:    (id)       => fetchWithCredentials(`${API_BASE_URL}/promotions/admin/${id}/permanent`,    { method: 'DELETE' }),
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

// ── Admin Products ─────────────────────────────────────────────────────────
export const AdminProductsAPI = {
    getAll:           (page = 0, size = 20, search = '', featured = null) => fetchWithCredentials(
        `${API_BASE_URL}/admin/products?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}${featured !== null ? `&featured=${featured}` : ''}`
    ),
    getFeatured:      ()    => fetchWithCredentials(`${API_BASE_URL}/admin/products/featured`),
    toggleFeature:    (id)  => fetchWithCredentials(`${API_BASE_URL}/admin/products/${id}/toggle-feature`, { method: 'PUT' }),
    clearAllFeatured: ()    => fetchWithCredentials(`${API_BASE_URL}/admin/products/featured/clear`, { method: 'DELETE' }),
};

// ── Legacy default export ──────────────────────────────────────────────────
export const AdminAPI = {
    getAdminData: () => AdminProfileAPI.getProfile(),
};
