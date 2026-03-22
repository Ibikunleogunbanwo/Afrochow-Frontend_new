"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Stripe instance is created once outside the component so it is not
// re-instantiated on every render. The publishable key is safe to expose.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

/**
 * StripeProvider
 *
 * Wrap any page or layout that needs Stripe with this provider.
 * Usage:
 *   <StripeProvider>
 *     <CheckoutPage />
 *   </StripeProvider>
 *
 * Only pages that actually need payments need this wrapper —
 * don't put it in the root layout unless every page uses Stripe.
 */
export const StripeProvider = ({ children }) => {
    return (
        <Elements stripe={stripePromise}>
            {children}
        </Elements>
    );
};