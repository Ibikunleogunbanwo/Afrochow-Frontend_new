import { API_BASE_URL, fetchWithCredentials } from './httpClient';

/**
 * PaymentAPI — customer-facing payment endpoints (3D Secure confirm + retry).
 *
 * Backend routes:
 *   GET  /customer/payments/order/{publicOrderId}          — payment for an order
 *   POST /customer/payments/order/{publicOrderId}/confirm  — finalize after stripe.confirmCardPayment()
 *   POST /customer/payments/order/{publicOrderId}/retry    — retry a FAILED payment with a new card
 */
export const PaymentAPI = {
    getPayment: (publicOrderId) =>
        fetchWithCredentials(`${API_BASE_URL}/customer/payments/order/${encodeURIComponent(publicOrderId)}`),

    /**
     * Call after stripe.confirmCardPayment(clientSecret) resolves successfully, to tell
     * the backend to re-check the PaymentIntent and finalize the order.
     * @returns {Promise<ApiResponse<PaymentResponseDto>>} — response.data.status will be
     *   AUTHORIZED (done), PENDING with requiresAction+stripeClientSecret (3DS still not
     *   finished — re-prompt), or FAILED (dead end — offer retry).
     */
    confirmPayment: (publicOrderId) =>
        fetchWithCredentials(`${API_BASE_URL}/customer/payments/order/${encodeURIComponent(publicOrderId)}/confirm`, {
            method: 'POST',
        }),

    /**
     * Retry a FAILED payment with a brand new Stripe payment method token.
     * @param {string} publicOrderId
     * @param {string} paymentMethodId  fresh Stripe payment method token from createPaymentMethod()
     * @returns {Promise<ApiResponse<PaymentResponseDto>>} — same three-way outcome as confirmPayment.
     */
    retryPayment: (publicOrderId, paymentMethodId) =>
        fetchWithCredentials(`${API_BASE_URL}/customer/payments/order/${encodeURIComponent(publicOrderId)}/retry`, {
            method: 'POST',
            body: JSON.stringify({ paymentMethodId }),
        }),
};
