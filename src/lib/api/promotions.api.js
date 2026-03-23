import { API_BASE_URL, fetchWithCredentials } from './httpClient';

export const PromotionsAPI = {
    /** Active promotions visible to all authenticated users */
    getActivePromotions: async () => {
        return fetchWithCredentials(`${API_BASE_URL}/promotions`);
    },

    /** Authenticated vendor's own promotions (resolved from JWT) */
    getMyPromotions: async () => {
        return fetchWithCredentials(`${API_BASE_URL}/promotions/vendor/mine`);
    },

    /** All promotions for a specific vendor (public read) */
    getVendorPromotions: async (vendorPublicId) => {
        return fetchWithCredentials(`${API_BASE_URL}/promotions/vendor/${vendorPublicId}`);
    },

    /** Validate a promo code and return its discount details */
    validatePromoCode: async (code) => {
        return fetchWithCredentials(`${API_BASE_URL}/promotions/validate/${code}`);
    },

    /**
     * Preview the exact discount amount before checkout.
     * POST /promotions/preview  { promoCode, vendorPublicId, subtotal }
     * Returns { promoCode, title, description, type, value, discountAmount, discountedSubtotal }
     */
    previewPromotion: async ({ promoCode, vendorPublicId, subtotal }) => {
        return fetchWithCredentials(`${API_BASE_URL}/promotions/preview`, {
            method: 'POST',
            body: JSON.stringify({ promoCode, vendorPublicId, subtotal }),
        });
    },

    // ── Vendor CRUD endpoints ────────────────────────────────────────────────

    /** Create a new promotion for this vendor */
    createPromotion: async (promotionData) => {
        return fetchWithCredentials(`${API_BASE_URL}/promotions/vendor`, {
            method: 'POST',
            body: JSON.stringify(promotionData),
        });
    },

    /** Update an existing promotion */
    updatePromotion: async (publicPromotionId, promotionData) => {
        return fetchWithCredentials(`${API_BASE_URL}/promotions/vendor/${publicPromotionId}`, {
            method: 'PUT',
            body: JSON.stringify(promotionData),
        });
    },

    /** Deactivate (soft-delete) a promotion */
    deactivatePromotion: async (publicPromotionId) => {
        return fetchWithCredentials(`${API_BASE_URL}/promotions/vendor/${publicPromotionId}`, {
            method: 'DELETE',
        });
    },

    // ── Admin-only endpoints ─────────────────────────────────────────────────

    /** Get all promotions with usage statistics (ADMIN only) */
    getAllPromotionsAdmin: async () => {
        return fetchWithCredentials(`${API_BASE_URL}/promotions/admin`);
    },

    /** Create a promotion as admin (can target any vendor) */
    createPromotionAdmin: async (promotionData) => {
        return fetchWithCredentials(`${API_BASE_URL}/promotions/admin`, {
            method: 'POST',
            body: JSON.stringify(promotionData),
        });
    },

    /** Update any promotion as admin */
    updatePromotionAdmin: async (publicPromotionId, promotionData) => {
        return fetchWithCredentials(`${API_BASE_URL}/promotions/admin/${publicPromotionId}`, {
            method: 'PUT',
            body: JSON.stringify(promotionData),
        });
    },

    /** Deactivate any promotion as admin */
    deactivatePromotionAdmin: async (publicPromotionId) => {
        return fetchWithCredentials(`${API_BASE_URL}/promotions/admin/${publicPromotionId}`, {
            method: 'DELETE',
        });
    },
};
