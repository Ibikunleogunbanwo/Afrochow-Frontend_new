import { API_BASE_URL, fetchWithCredentials } from '@/lib/api/httpClient';

/**
 * OrderAPI — wraps all customer order endpoints
 *
 * Backend routes:
 *   POST   /customer/orders                          — place order
 *   GET    /customer/orders                          — all orders
 *   GET    /customer/orders/active                   — active orders
 *   GET    /customer/orders/{publicOrderId}          — order details
 *   PUT    /customer/orders/{publicOrderId}/cancel   — cancel order
 *   GET    /customer/orders/stats/count              — order count
 */
export const OrderAPI = {

    // ================= PLACE ORDER =================

    /**
     * Place a new order.
     *
     * @param {Object} payload
     * @param {string}   payload.vendorPublicId
     * @param {string}   payload.fulfillmentType       "DELIVERY" | "PICKUP"
     * @param {string}   [payload.deliveryAddressId]   publicAddressId — required when DELIVERY
     * @param {string}   [payload.deliveryNote]        optional instructions or pickup note
     * @param {string}   payload.paymentMethodId       Stripe payment method token
     * @param {Array}    payload.items                 [{ publicProductId, quantity }]
     *
     * @returns {Promise<OrderResponseDto>}
     */
    createOrder: async (payload) => {
        return fetchWithCredentials(`${API_BASE_URL}/customer/orders`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
        });
    },

    // ================= GET ORDERS =================

    /**
     * Get all orders for the authenticated customer.
     * @returns {Promise<OrderSummaryResponseDto[]>}
     */
    getMyOrders: async () => {
        return fetchWithCredentials(`${API_BASE_URL}/customer/orders`, {
            method: 'GET',
        });
    },

    /**
     * Get all active (in-progress) orders for the authenticated customer.
     * @returns {Promise<OrderSummaryResponseDto[]>}
     */
    getActiveOrders: async () => {
        return fetchWithCredentials(`${API_BASE_URL}/customer/orders/active`, {
            method: 'GET',
        });
    },

    /**
     * Get full details of a specific order by ID.
     * @param {string} publicOrderId
     * @returns {Promise<OrderResponseDto>}
     */
    getOrder: async (publicOrderId) => {
        return fetchWithCredentials(
            `${API_BASE_URL}/customer/orders/${encodeURIComponent(publicOrderId)}`,
            { method: 'GET' }
        );
    },

    // ================= CANCEL =================

    /**
     * Cancel an order. Only valid when status is PENDING or CONFIRMED.
     * @param {string} publicOrderId
     * @returns {Promise<OrderResponseDto>}
     */
    cancelOrder: async (publicOrderId) => {
        return fetchWithCredentials(
            `${API_BASE_URL}/customer/orders/${encodeURIComponent(publicOrderId)}/cancel`,
            { method: 'PUT' }
        );
    },

    // ================= STATS =================

    /**
     * Get total order count for the authenticated customer.
     * @returns {Promise<{ totalOrders: number }>}
     */
    getOrderCount: async () => {
        return fetchWithCredentials(`${API_BASE_URL}/customer/orders/stats/count`, {
            method: 'GET',
        });
    },
};