"use client";

import { useState } from "react";
import { useStripe, useElements, CardNumberElement } from "@stripe/react-stripe-js";

/**
 * useStripePayment
 *
 * Encapsulates all Stripe payment method creation logic.
 * Must be used inside a component wrapped by <StripeProvider>.
 *
 * Returns:
 *   - createPaymentMethod(billingName) → { paymentMethodId } | throws
 *   - stripe, elements — pass to CardField components
 *   - stripeReady — true when Stripe.js has loaded
 */
export const useStripePayment = () => {
    const stripe   = useStripe();
    const elements = useElements();
    const [stripeError, setStripeError] = useState(null);

    const stripeReady = !!stripe && !!elements;

    /**
     * Tokenizes the card details entered in the Stripe CardElement.
     * Card data never touches your server — Stripe returns a safe token.
     *
     * @param {string} billingName — cardholder name from your form
     * @returns {Promise<string>} paymentMethodId
     * @throws {Error} if tokenization fails
     */
    const createPaymentMethod = async (billingName) => {
        if (!stripe || !elements) {
            throw new Error("Stripe has not loaded yet. Please try again.");
        }

        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) {
            throw new Error("Card element not found.");
        }

        setStripeError(null);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
            billing_details: {
                name: billingName.trim(),
            },
        });

        if (error) {
            setStripeError(error.message);
            throw new Error(error.message);
        }

        return paymentMethod.id;
    };

    return {
        stripe,
        elements,
        stripeReady,
        stripeError,
        setStripeError,
        createPaymentMethod,
    };
};