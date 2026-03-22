"use client";

import {
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
} from "@stripe/react-stripe-js";
import { AlertCircle, Lock } from "lucide-react";


const STRIPE_ELEMENT_STYLE = {
    base: {
        fontSize:        "14px",
        color:           "#111827",
        fontFamily:      "inherit",
        "::placeholder": { color: "#9ca3af" },
    },
    invalid: {
        color:   "#ef4444",
        iconColor: "#ef4444",
    },
};

const fieldCls = (hasError) =>
    `w-full px-3 py-2.5 border rounded-lg transition-all ${
        hasError
            ? "border-red-400 bg-red-50"
            : "border-gray-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20"
    }`;

const FieldError = ({ message }) =>
    message ? (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {message}
        </p>
    ) : null;

/**
 * StripeCardFields
 *
 * Renders three Stripe-hosted card input fields:
 *   - Card number
 *   - Expiry date
 *   - CVC
 *
 * Also renders a cardholder name input (plain text — not sent to Stripe directly,
 * passed to createPaymentMethod as billing_details.name).
 *
 * Props:
 *   - cardholderName        {string}
 *   - onCardholderChange    {(value: string) => void}
 *   - errors                { name, number, expiry, cvc }
 *   - onStripeChange        {(field, event) => void} — called on Stripe element change
 *   - disabled              {boolean}
 */
const StripeCardFields = ({
                              cardholderName,
                              onCardholderChange,
                              errors = {},
                              onStripeChange,
                              disabled = false,
                          }) => {
    return (
        <div className="space-y-3">

            {/* Cardholder name — plain input, used as billing_details.name */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Cardholder name
                </label>
                <input
                    type="text"
                    value={cardholderName}
                    onChange={e => onCardholderChange(e.target.value)}
                    placeholder="Name on card"
                    disabled={disabled}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-gray-900 transition-all disabled:opacity-50 ${
                        errors.name ? "border-red-400 bg-red-50" : "border-gray-300"
                    }`}
                />
                <FieldError message={errors.name} />
            </div>

            {/* Card number — Stripe hosted iframe */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Card number
                </label>
                <div className={fieldCls(errors.number)}>
                    <CardNumberElement
                        options={{
                            style:       STRIPE_ELEMENT_STYLE,
                            showIcon:    true,
                            disabled,
                        }}
                        onChange={e => onStripeChange?.("number", e)}
                    />
                </div>
                <FieldError message={errors.number} />
            </div>

            {/* Expiry + CVC — side by side */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Expiry date
                    </label>
                    <div className={fieldCls(errors.expiry)}>
                        <CardExpiryElement
                            options={{ style: STRIPE_ELEMENT_STYLE, disabled }}
                            onChange={e => onStripeChange?.("expiry", e)}
                        />
                    </div>
                    <FieldError message={errors.expiry} />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        CVC
                    </label>
                    <div className={fieldCls(errors.cvc)}>
                        <CardCvcElement
                            options={{ style: STRIPE_ELEMENT_STYLE, disabled }}
                            onChange={e => onStripeChange?.("cvc", e)}
                        />
                    </div>
                    <FieldError message={errors.cvc} />
                </div>
            </div>

            {/* Security note */}
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
                <Lock className="w-3 h-3 shrink-0" />
                Your card details are encrypted by Stripe and never touch our servers.
            </p>
        </div>
    );
};

export default StripeCardFields;