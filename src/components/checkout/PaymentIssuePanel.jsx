"use client";

import { useState } from "react";
import { StripeProvider } from "@/contexts/Stripeprovider";
import { useStripePayment } from "@/hooks/useStripePayment";
import StripeCardFields from "@/components/home/cards/StripeCardFields";
import { PaymentAPI } from "@/lib/api/payment.api";
import { toast } from "@/components/ui/toast";
import { AlertCircle, ShieldCheck, Loader2 } from "lucide-react";

/**
 * Shown on the order-confirmation page whenever an order's payment didn't
 * cleanly finish at checkout — either it's stuck waiting on a 3D Secure
 * challenge the customer didn't complete, or it FAILED outright. Self-contained
 * (wraps its own <StripeProvider>) so it can be dropped into any page without
 * that page needing to know about Stripe.
 *
 * Props:
 *   - order      the OrderResponseDto (needs .publicOrderId and .payment)
 *   - onResolved called with the fresh order once payment succeeds, so the
 *                 parent page can refresh its view (progress tracker, etc.)
 */
export default function PaymentIssuePanel({ order, onResolved }) {
    const paymentStatus = order?.payment?.status;
    if (paymentStatus !== "FAILED" && paymentStatus !== "PENDING") return null;

    return (
        <StripeProvider>
            <PaymentIssuePanelInner
                publicOrderId={order.publicOrderId}
                paymentStatus={paymentStatus}
                onResolved={onResolved}
            />
        </StripeProvider>
    );
}

function PaymentIssuePanelInner({ publicOrderId, paymentStatus, onResolved }) {
    const { stripe, createPaymentMethod, stripeReady } = useStripePayment();

    const [showCardForm, setShowCardForm] = useState(false);
    const [cardholderName, setCardholderName] = useState("");
    const [fieldErrors, setFieldErrors] = useState({ name: "", number: "", expiry: "", cvc: "" });
    const [fieldComplete, setFieldComplete] = useState({ number: false, expiry: false, cvc: false });
    const [working, setWorking] = useState(false);
    const [issueMessage, setIssueMessage] = useState(null);

    const cardComplete = cardholderName.trim() !== "" &&
        fieldComplete.number && fieldComplete.expiry && fieldComplete.cvc;

    const handleStripeFieldChange = (field, event) => {
        setFieldComplete(prev => ({ ...prev, [field]: event.complete }));
        setFieldErrors(prev => ({ ...prev, [field]: event.error ? event.error.message : "" }));
    };

    /**
     * Runs the 3D Secure challenge for a given client secret, then asks the
     * backend to re-check the intent. Shared by both the "resume a stuck
     * verification" flow and the "retry with a new card" flow, since both can
     * land back in requires_action (e.g. the new card also needs 3DS).
     */
    const resolveClientSecret = async (clientSecret) => {
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);
        if (confirmError) {
            // Customer closed the challenge or it was declined client-side —
            // ask the backend for the authoritative outcome rather than guessing.
            setIssueMessage(confirmError.message || "Card verification was not completed.");
        }
        return PaymentAPI.confirmPayment(publicOrderId);
    };

    /** Interprets a PaymentResponseDto outcome and drives the UI accordingly. */
    const handleOutcome = async (res) => {
        const data = res?.data;
        if (!data) throw new Error("Unexpected response from payment service.");

        if (data.status === "AUTHORIZED" || data.status === "COMPLETED") {
            toast.success("Payment confirmed!", { description: "Your order has been received by the vendor." });
            setShowCardForm(false);
            setIssueMessage(null);
            onResolved?.();
            return;
        }

        if (data.requiresAction && data.stripeClientSecret) {
            // Still needs verification (e.g. the new card also triggers 3DS) — run it.
            const followUp = await resolveClientSecret(data.stripeClientSecret);
            await handleOutcome(followUp);
            return;
        }

        // FAILED
        setIssueMessage("That didn't work. You have not been charged, no funds were taken. You can try a different card below.");
        setShowCardForm(true);
    };

    /** "Verify now" — resumes a payment stuck in PENDING (3DS not yet completed). */
    const handleResumeVerification = async () => {
        if (!stripe) return;
        setWorking(true);
        setIssueMessage(null);
        try {
            const res = await PaymentAPI.confirmPayment(publicOrderId);
            const data = res?.data;
            if (data?.requiresAction && data?.stripeClientSecret) {
                const followUp = await resolveClientSecret(data.stripeClientSecret);
                await handleOutcome(followUp);
            } else {
                await handleOutcome(res);
            }
        } catch (e) {
            setIssueMessage(e.message || "Could not verify this payment. You can try a different card below.");
            setShowCardForm(true);
        } finally {
            setWorking(false);
        }
    };

    /** "Retry payment" — tokenizes a new card and re-attempts the charge. */
    const handleRetryWithNewCard = async () => {
        const errors = { name: "", number: "", expiry: "", cvc: "" };
        let valid = true;
        if (!cardholderName.trim()) { errors.name = "Cardholder name is required"; valid = false; }
        if (!fieldComplete.number)  { errors.number = "Card number is required"; valid = false; }
        if (!fieldComplete.expiry) { errors.expiry = "Expiry date is required"; valid = false; }
        if (!fieldComplete.cvc)    { errors.cvc = "CVC is required"; valid = false; }
        setFieldErrors(errors);
        if (!valid) return;

        setWorking(true);
        setIssueMessage(null);
        try {
            const paymentMethodId = await createPaymentMethod(cardholderName);
            const res = await PaymentAPI.retryPayment(publicOrderId, paymentMethodId);
            await handleOutcome(res);
        } catch (e) {
            setIssueMessage(e.message || "Payment retry failed. Please check your card details and try again.");
        } finally {
            setWorking(false);
        }
    };

    return (
        <div className="border border-red-200 rounded-2xl overflow-hidden">
            <div className="bg-red-50 px-5 py-3 border-b border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <h2 className="text-sm font-bold text-red-800">
                    {paymentStatus === "PENDING" ? "Payment needs one more step" : "Payment didn't go through"}
                </h2>
            </div>

            <div className="px-5 py-4 space-y-3 bg-white">
                <p className="text-sm text-gray-600">
                    {paymentStatus === "PENDING"
                        ? "Your bank needs you to verify this payment before your order can be confirmed."
                        : "Your card could not be charged for this order. Try again with a different card."}
                </p>

                {issueMessage && (
                    <p className="text-xs text-red-600 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {issueMessage}
                    </p>
                )}

                {paymentStatus === "PENDING" && !showCardForm && (
                    <button
                        onClick={handleResumeVerification}
                        disabled={working || !stripe}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {working
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                            : <><ShieldCheck className="w-4 h-4" /> Verify now</>
                        }
                    </button>
                )}

                {(showCardForm || paymentStatus === "FAILED") && (
                    <div className="space-y-3 pt-1">
                        {!stripeReady ? (
                            <div className="flex items-center justify-center py-4 gap-2 text-sm text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading secure payment fields…
                            </div>
                        ) : (
                            <StripeCardFields
                                cardholderName={cardholderName}
                                onCardholderChange={setCardholderName}
                                errors={fieldErrors}
                                onStripeChange={handleStripeFieldChange}
                                disabled={working}
                            />
                        )}
                        <button
                            onClick={handleRetryWithNewCard}
                            disabled={working || !stripeReady || !cardComplete}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-amber-700 transition-all disabled:opacity-50"
                        >
                            {working
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Retrying payment…</>
                                : "Retry payment"
                            }
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
