"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useStripePayment } from "@/hooks/useStripePayment";
import { CustomerAPI } from "@/lib/api/customer.api";
import { SearchAPI } from "@/lib/api/search.api";
import { OrderAPI } from "@/lib/api/order/order.api";
import { PromotionsAPI } from "@/lib/api/promotions.api";
import StripeCardFields from "@/components/home/cards/StripeCardFields";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    MapPin, ChevronRight, Plus, Truck, FileText,
    ShoppingBag, Check, ChevronDown, Clock, AlertCircle, Tag, X,
} from "lucide-react";

const PROVINCIAL_TAX = {
    AB: { rate: 0.05,    label: "GST",       province: "Alberta" },
    BC: { rate: 0.12,    label: "GST + PST", province: "British Columbia" },
    MB: { rate: 0.12,    label: "GST + PST", province: "Manitoba" },
    NB: { rate: 0.15,    label: "HST",       province: "New Brunswick" },
    NL: { rate: 0.15,    label: "HST",       province: "Newfoundland and Labrador" },
    NS: { rate: 0.15,    label: "HST",       province: "Nova Scotia" },
    NT: { rate: 0.05,    label: "GST",       province: "Northwest Territories" },
    NU: { rate: 0.05,    label: "GST",       province: "Nunavut" },
    ON: { rate: 0.13,    label: "HST",       province: "Ontario" },
    PE: { rate: 0.15,    label: "HST",       province: "Prince Edward Island" },
    QC: { rate: 0.14975, label: "GST + QST", province: "Quebec" },
    SK: { rate: 0.11,    label: "GST + PST", province: "Saskatchewan" },
    YT: { rate: 0.05,    label: "GST",       province: "Yukon" },
};

const PROVINCES = [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "MB", label: "Manitoba" },
    { value: "NB", label: "New Brunswick" },
    { value: "NL", label: "Newfoundland and Labrador" },
    { value: "NS", label: "Nova Scotia" },
    { value: "NT", label: "Northwest Territories" },
    { value: "NU", label: "Nunavut" },
    { value: "ON", label: "Ontario" },
    { value: "PE", label: "Prince Edward Island" },
    { value: "QC", label: "Quebec" },
    { value: "SK", label: "Saskatchewan" },
    { value: "YT", label: "Yukon" },
];

export default function CheckoutPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { cartItems, cartTotal, vendorId, clearCart } = useCart();
    const { createPaymentMethod, stripeReady, stripeError, setStripeError } = useStripePayment();
    const router = useRouter();

    const [profileData, setProfileData]         = useState(null);
    const [vendorData, setVendorData]           = useState(null);
    const [loading, setLoading]                 = useState(true);
    const [placing, setPlacing]                 = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const [fulfillment, setFulfillment]           = useState("delivery");
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showNewAddress, setShowNewAddress]     = useState(false);
    const [newAddress, setNewAddress]             = useState({
        addressLine: "", city: "", province: "AB",
        postalCode: "", country: "Canada", defaultAddress: false,
    });
    const [deliveryNote, setDeliveryNote] = useState("");

    // Promo code
    const [promoInput,   setPromoInput]   = useState("");
    const [promoCode,    setPromoCode]    = useState("");   // applied code
    const [promoPreview, setPromoPreview] = useState(null); // server response
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError,   setPromoError]   = useState("");

    // Stripe card fields state
    const [cardholderName, setCardholderName]   = useState("");
    const [stripeFieldErrors, setStripeFieldErrors] = useState({
        name: "", number: "", expiry: "", cvc: "",
    });
    const [stripeFieldComplete, setStripeFieldComplete] = useState({
        number: false, expiry: false, cvc: false,
    });

    // ── Data loader ───────────────────────────────────────────────────────────
    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            const [profileRes, vendorRes] = await Promise.allSettled([
                CustomerAPI.getCustomerProfile(),
                vendorId ? SearchAPI.getVendorDetails(vendorId) : Promise.resolve(null),
            ]);

            if (profileRes.status === "fulfilled" && profileRes.value?.success && profileRes.value?.data) {
                const data = profileRes.value.data;
                setProfileData(data);
                setDeliveryNote(data.defaultDeliveryInstructions || "");
                const def = data.addresses?.find(a => a.defaultAddress);
                if (def) setSelectedAddressId(def.publicAddressId);
                else if (data.addresses?.length > 0) setSelectedAddressId(data.addresses[0].publicAddressId);
            }

            if (vendorRes.status === "fulfilled" && vendorRes.value?.success && vendorRes.value?.data) {
                const v = vendorRes.value.data;
                setVendorData(v);
                if (!v.offersDelivery && v.offersPickup) setFulfillment("pickup");
            } else {
                toast.error("Could not load restaurant details", {
                    description: "Please go back and try again.",
                });
            }
        } catch (e) {
            toast.error("Could not load checkout data", { description: e.message });
        } finally {
            setLoading(false);
        }
    }, [vendorId]);

    // ── Auth + cart guard ─────────────────────────────────────────────────────
    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) { router.push("/"); return; }
        if (cartItems.length === 0) { router.push("/cart"); return; }
        void loadData();
    }, [isAuthenticated, authLoading, cartItems.length, loadData, router]);

    // ── Derived values ────────────────────────────────────────────────────────
    const selectedAddress = profileData?.addresses?.find(a => a.publicAddressId === selectedAddressId);
    const province = fulfillment === "delivery"
        ? (showNewAddress ? newAddress.province : selectedAddress?.province) ?? vendorData?.address?.province ?? "AB"
        : vendorData?.address?.province ?? "AB";
    const taxInfo = PROVINCIAL_TAX[province] || PROVINCIAL_TAX.AB;

    const vendorDeliveryFee = vendorData?.deliveryFee ?? 0;
    const deliveryFee       = fulfillment === "delivery" ? vendorDeliveryFee : 0;
    const discountAmount    = promoPreview?.discountAmount ?? 0;
    // Tax mirrors backend: calculated on full subtotal+delivery, discount applied after
    const taxAmount         = (cartTotal + deliveryFee) * taxInfo.rate;
    const total             = Math.max(0, cartTotal + deliveryFee + taxAmount - discountAmount);

    const belowMinimum = fulfillment === "delivery" &&
        vendorData?.minimumOrderAmount > 0 &&
        (cartTotal + deliveryFee) < vendorData.minimumOrderAmount;

    const cardComplete =
        cardholderName.trim() !== "" &&
        stripeFieldComplete.number &&
        stripeFieldComplete.expiry &&
        stripeFieldComplete.cvc;

    const canSubmit = !belowMinimum && cardComplete && stripeReady;

    // ── Handlers ──────────────────────────────────────────────────────────────

    // Called by StripeCardFields when a Stripe element changes
    const handleStripeFieldChange = (field, event) => {
        setStripeFieldComplete(prev => ({ ...prev, [field]: event.complete }));
        if (event.error) {
            setStripeFieldErrors(prev => ({ ...prev, [field]: event.error.message }));
        } else {
            setStripeFieldErrors(prev => ({ ...prev, [field]: "" }));
        }
        // Clear top-level stripe error on any change
        if (stripeError) setStripeError(null);
    };

    const validateCardFields = () => {
        const errors = { name: "", number: "", expiry: "", cvc: "" };
        let valid = true;

        if (!cardholderName.trim()) {
            errors.name = "Cardholder name is required";
            valid = false;
        }
        if (!stripeFieldComplete.number) {
            errors.number = "Card number is required";
            valid = false;
        }
        if (!stripeFieldComplete.expiry) {
            errors.expiry = "Expiry date is required";
            valid = false;
        }
        if (!stripeFieldComplete.cvc) {
            errors.cvc = "CVC is required";
            valid = false;
        }

        setStripeFieldErrors(errors);
        return valid;
    };

    const handleNewAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleApplyPromo = async () => {
        const code = promoInput.trim().toUpperCase();
        if (!code) return;
        setPromoLoading(true);
        setPromoError("");
        try {
            const res = await PromotionsAPI.previewPromotion({
                promoCode:       code,
                vendorPublicId:  vendorId,
                subtotal:        cartTotal,
            });
            if (res?.success && res.data) {
                setPromoPreview(res.data);
                setPromoCode(code);
            } else {
                setPromoError("Invalid or expired promo code.");
                setPromoPreview(null);
                setPromoCode("");
            }
        } catch (err) {
            setPromoError(err.message || "Invalid or expired promo code.");
            setPromoPreview(null);
            setPromoCode("");
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromo = () => {
        setPromoInput("");
        setPromoCode("");
        setPromoPreview(null);
        setPromoError("");
    };

    const handlePlaceOrder = async () => {
        setSubmitAttempted(true);

        // 1 — Validate card fields
        if (!validateCardFields()) return;

        // 2 — Validate minimum order
        if (belowMinimum) {
            toast.error("Minimum order not met", {
                description: `Add CA$${(vendorData.minimumOrderAmount - cartTotal - deliveryFee).toFixed(2)} more to proceed.`,
            });
            return;
        }

        // 3 — Validate delivery address
        if (fulfillment === "delivery") {
            if (!showNewAddress && !selectedAddressId) {
                toast.error("No address selected", {
                    description: "Please select or add a delivery address.",
                });
                return;
            }
            if (showNewAddress && (!newAddress.addressLine || !newAddress.city || !newAddress.postalCode)) {
                toast.error("Incomplete address", {
                    description: "Please fill in all required address fields.",
                });
                return;
            }
        }

        try {
            setPlacing(true);

            // 4 — Save new address first if needed, get back its ID
            let deliveryAddressId = selectedAddressId;
            if (fulfillment === "delivery" && showNewAddress) {
                const addressRes = await CustomerAPI.addAddress(newAddress);
                if (!addressRes?.data?.publicAddressId) {
                    throw new Error("Failed to save new address. Please try again.");
                }
                deliveryAddressId = addressRes.data.publicAddressId;
            }

            // 5 — Tokenize card via Stripe.js — card data never touches our backend
            const paymentMethodId = await createPaymentMethod(cardholderName);

            // 6 — Build order payload — field names must match OrderRequestDto exactly
            const orderPayload = {
                vendorPublicId:  vendorId,
                fulfillmentType: fulfillment.toUpperCase(), // "DELIVERY" | "PICKUP"
                specialInstructions: deliveryNote || null,  // backend field: specialInstructions
                paymentMethodId,
                orderLines: cartItems.map(item => ({        // backend field: orderLines
                    productPublicId: item.publicProductId,  // backend field: productPublicId
                    quantity:        item.quantity,
                })),
                ...(promoCode && { promoCode }),             // applied promo code (if any)
                ...(fulfillment === "delivery" && {
                    deliveryAddressPublicId: deliveryAddressId, // backend field: deliveryAddressPublicId
                }),
            };

            // 7 — POST /customer/orders  →  ApiResponse<OrderResponseDto>
            const orderRes = await OrderAPI.createOrder(orderPayload);

            if (!orderRes?.data?.publicOrderId) {
                throw new Error("Order was not created. Please try again.");
            }

            const publicOrderId = orderRes.data.publicOrderId;

            // 8 — Success
            clearCart();
            toast.success("Order placed!", {
                description: "Your order has been received by the vendor.",
            });
            router.push(`/order-confirmation/${publicOrderId}`);

        } catch (e) {
            const raw = e.message || "";
            const description =
                raw.includes("card was declined") || raw.includes("Your card")
                    ? raw                                                    // Stripe card errors — safe to show
                    : raw.includes("minimum amount")
                    ? raw                                                    // Business rule — safe to show
                    : raw.includes("not available")
                    ? raw                                                    // Product unavailable — safe to show
                    : "Something went wrong processing your payment. Please try again or use a different card.";
            toast.error("Order could not be placed", { description });
        } finally {
            setPlacing(false);
        }
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <Link href="/cart" className="hover:text-gray-700 transition-colors">Cart</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-gray-900 font-medium">Checkout</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                    {vendorData && (
                        <p className="text-sm text-gray-500 mt-1">Order from {vendorData.restaurantName}</p>
                    )}
                </div>

                {/* Minimum order warning */}
                {belowMinimum && (
                    <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">
                            Minimum order for {vendorData.restaurantName} is{" "}
                            <span className="font-semibold">CA${vendorData.minimumOrderAmount.toFixed(2)}</span>.
                            Add <span className="font-semibold">CA${(vendorData.minimumOrderAmount - cartTotal).toFixed(2)}</span> more to proceed.
                        </p>
                    </div>
                )}

                <div className="grid lg:grid-cols-5 gap-8">

                    {/* ── Left column ── */}
                    <div className="lg:col-span-3 space-y-4">

                        {/* Fulfillment */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center">
                                    <Truck className="w-3.5 h-3.5 text-orange-500" />
                                </div>
                                <h2 className="text-sm font-semibold text-gray-900">Fulfillment</h2>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-3">
                                {[
                                    {
                                        value:    "delivery",
                                        label:    "Delivery",
                                        sub:      vendorData?.offersDelivery
                                            ? vendorDeliveryFee === 0 ? "Free delivery" : `+CA$${vendorDeliveryFee.toFixed(2)}`
                                            : "Not available",
                                        disabled: !vendorData?.offersDelivery,
                                    },
                                    {
                                        value:    "pickup",
                                        label:    "Pickup",
                                        sub:      vendorData?.offersPickup ? "Free" : "Not available",
                                        disabled: !vendorData?.offersPickup,
                                    },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => !opt.disabled && setFulfillment(opt.value)}
                                        disabled={opt.disabled}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                                            opt.disabled
                                                ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-40"
                                                : fulfillment === opt.value
                                                    ? "border-gray-900 bg-gray-900"
                                                    : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <div>
                                            <p className={`text-sm font-semibold ${fulfillment === opt.value && !opt.disabled ? "text-white" : "text-gray-900"}`}>
                                                {opt.label}
                                            </p>
                                            <p className={`text-xs mt-0.5 ${fulfillment === opt.value && !opt.disabled ? "text-orange-100" : "text-gray-400"}`}>
                                                {opt.sub}
                                            </p>
                                        </div>
                                        {fulfillment === opt.value && !opt.disabled && (
                                            <Check className="w-4 h-4 text-white shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Timing */}
                            {vendorData && (
                                <div className="px-4 pb-4 flex items-center gap-4 text-xs text-gray-400">
                                    {vendorData.preparationTime > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {vendorData.preparationTime} min prep
                                        </span>
                                    )}
                                    {fulfillment === "delivery" && vendorData.estimatedDeliveryMinutes > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Truck className="w-3.5 h-3.5" />
                                            ~{vendorData.estimatedDeliveryMinutes} min delivery
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Delivery address */}
                        {fulfillment === "delivery" && (
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center">
                                            <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                        </div>
                                        <h2 className="text-sm font-semibold text-gray-900">Delivery address</h2>
                                    </div>
                                    <button
                                        onClick={() => { setShowNewAddress(!showNewAddress); setSelectedAddressId(null); }}
                                        className="text-sm text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        New address
                                    </button>
                                </div>
                                <div className="p-4 space-y-2">
                                    {!showNewAddress && profileData?.addresses?.map(address => {
                                        const { publicAddressId, addressLine, defaultAddress, city, province: addrProvince, postalCode } = address;
                                        return (
                                            <button
                                                key={publicAddressId}
                                                onClick={() => setSelectedAddressId(publicAddressId)}
                                                className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                                    selectedAddressId === publicAddressId
                                                        ? "border-orange-500 bg-orange-50"
                                                        : "border-gray-200 hover:border-orange-200"
                                                }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                                                    selectedAddressId === publicAddressId ? "border-orange-500" : "border-gray-300"
                                                }`}>
                                                    {selectedAddressId === publicAddressId && (
                                                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-sm font-medium text-gray-900">{addressLine}</p>
                                                        {defaultAddress && (
                                                            <span className="text-[10px] px-1.5 py-0.5 border border-gray-300 text-gray-500 rounded-full">Default</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {city}, {addrProvince} {postalCode}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {PROVINCIAL_TAX[addrProvince]?.label} · {(PROVINCIAL_TAX[addrProvince]?.rate * 100).toFixed(2)}%
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {!showNewAddress && !profileData?.addresses?.length && (
                                        <div className="text-center py-6">
                                            <MapPin className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No saved addresses</p>
                                            <button
                                                onClick={() => setShowNewAddress(true)}
                                                className="text-sm text-orange-600 hover:text-orange-700 underline mt-1"
                                            >
                                                Add one
                                            </button>
                                        </div>
                                    )}

                                    {showNewAddress && (
                                        <div className="space-y-3 pt-1">
                                            <input
                                                type="text" name="addressLine"
                                                value={newAddress.addressLine}
                                                onChange={handleNewAddressChange}
                                                placeholder="Street address"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text" name="city"
                                                    value={newAddress.city}
                                                    onChange={handleNewAddressChange}
                                                    placeholder="City"
                                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                                                />
                                                <div className="relative">
                                                    <select
                                                        name="province"
                                                        value={newAddress.province}
                                                        onChange={handleNewAddressChange}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white appearance-none"
                                                    >
                                                        {PROVINCES.map(p => (
                                                            <option key={p.value} value={p.value}>{p.label}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <input
                                                type="text" name="postalCode"
                                                value={newAddress.postalCode}
                                                onChange={handleNewAddressChange}
                                                placeholder="Postal code"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                                            />
                                            <p className="text-xs text-gray-400">
                                                Tax: {PROVINCIAL_TAX[newAddress.province]?.label} · {(PROVINCIAL_TAX[newAddress.province]?.rate * 100).toFixed(2)}%
                                            </p>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox" name="defaultAddress"
                                                    checked={newAddress.defaultAddress}
                                                    onChange={handleNewAddressChange}
                                                    className="w-4 h-4 rounded"
                                                />
                                                <span className="text-sm text-gray-700">Save as default address</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pickup location */}
                        {fulfillment === "pickup" && vendorData?.address && (
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center">
                                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                    </div>
                                    <h2 className="text-sm font-semibold text-gray-900">Pickup location</h2>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{vendorData.restaurantName}</p>
                                            <p className="text-sm text-gray-600 mt-0.5">{vendorData.address.formattedAddress}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {PROVINCIAL_TAX[vendorData.address.province]?.label}
                                                {" · "}
                                                {((PROVINCIAL_TAX[vendorData.address.province]?.rate ?? 0) * 100).toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delivery / pickup note */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center">
                                    <FileText className="w-3.5 h-3.5 text-orange-500" />
                                </div>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    {fulfillment === "delivery" ? "Delivery instructions" : "Pickup note"}
                                    <span className="ml-2 text-xs font-normal text-gray-400">Optional</span>
                                </h2>
                            </div>
                            <div className="p-4">
                                <textarea
                                    value={deliveryNote}
                                    onChange={e => setDeliveryNote(e.target.value)}
                                    rows={2}
                                    placeholder={fulfillment === "delivery"
                                        ? "e.g., Leave at the door, ring the bell..."
                                        : "e.g., I'll arrive at 6pm"}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 resize-none"
                                />
                            </div>
                        </div>

                        {/* Promo code */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center">
                                    <Tag className="w-3.5 h-3.5 text-orange-500" />
                                </div>
                                <h2 className="text-sm font-semibold text-gray-900">Promo code</h2>
                                <span className="text-xs text-gray-400">Optional</span>
                            </div>
                            <div className="p-4">
                                {promoPreview ? (
                                    <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-600 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-green-800">{promoCode}</p>
                                                <p className="text-xs text-green-600">
                                                    {promoPreview.title} · −CA${promoPreview.discountAmount?.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemovePromo}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                                            aria-label="Remove promo code"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoInput}
                                            onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                                            onKeyDown={e => e.key === "Enter" && handleApplyPromo()}
                                            placeholder="e.g. SAVE10"
                                            disabled={promoLoading}
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 uppercase placeholder:normal-case tracking-widest disabled:opacity-50"
                                        />
                                        <button
                                            onClick={handleApplyPromo}
                                            disabled={!promoInput.trim() || promoLoading}
                                            className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {promoLoading ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : "Apply"}
                                        </button>
                                    </div>
                                )}
                                {promoError && (
                                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        {promoError}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Payment — Stripe hosted fields */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center">
                                    <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                                </div>
                                <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
                                <span className="text-xs text-gray-400">Credit or debit card</span>
                            </div>
                            <div className="p-4">
                                {!stripeReady ? (
                                    <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-400">
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
                                        Loading secure payment fields…
                                    </div>
                                ) : (
                                    <StripeCardFields
                                        cardholderName={cardholderName}
                                        onCardholderChange={setCardholderName}
                                        errors={stripeFieldErrors}
                                        onStripeChange={handleStripeFieldChange}
                                        disabled={placing}
                                    />
                                )}

                                {/* Top-level Stripe error (e.g. network, card declined) */}
                                {stripeError && (
                                    <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-600">{stripeError}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right column — order summary ── */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-24">

                            <div className="px-5 py-4 border-b border-gray-100">
                                <h2 className="text-sm font-semibold text-gray-900">Order summary</h2>
                                {vendorData && (
                                    <p className="text-xs text-gray-400 mt-0.5">{vendorData.restaurantName}</p>
                                )}
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                                {cartItems.map(item => (
                                    <div key={item.publicProductId} className="flex items-center gap-3 px-5 py-3">
                                        {item.imageUrl ? (
                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    width={40} height={40}
                                                    className="w-full h-full object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                                <ShoppingBag className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400">Qty {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 shrink-0">
                                            CA${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="px-5 py-4 border-t border-gray-100 space-y-2.5">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>CA${cartTotal.toFixed(2)}</span>
                                </div>

                                {fulfillment === "delivery" && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span className="flex items-center gap-1.5">
                                            <Truck className="w-3.5 h-3.5" />
                                            Delivery fee
                                        </span>
                                        <span>
                                            {vendorDeliveryFee === 0
                                                ? <span className="text-gray-500">Free</span>
                                                : `CA$${vendorDeliveryFee.toFixed(2)}`
                                            }
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>
                                        {taxInfo.label}
                                        <span className="text-xs text-gray-400 ml-1">
                                            ({(taxInfo.rate * 100).toFixed(2)}% · {province}
                                            {fulfillment === "pickup" && " · vendor"})
                                        </span>
                                    </span>
                                    <span>CA${taxAmount.toFixed(2)}</span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5" />
                                            {promoCode}
                                        </span>
                                        <span>−CA${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-gray-100 flex justify-between">
                                    <span className="text-sm font-semibold text-gray-900">Total</span>
                                    <span className="text-sm font-bold text-gray-900">CA${total.toFixed(2)}</span>
                                </div>

                                {fulfillment === "delivery" && vendorData?.minimumOrderAmount > 0 && (
                                    <p className={`text-xs ${belowMinimum ? "text-red-500" : "text-gray-400"}`}>
                                        Minimum order: CA${vendorData.minimumOrderAmount.toFixed(2)}
                                    </p>
                                )}
                            </div>

                            {/* Blocked reasons */}
                            {submitAttempted && !canSubmit && (
                                <div className="px-5 pb-3">
                                    <div className="flex items-start gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                                        <AlertCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                        <div className="text-xs text-gray-600 space-y-0.5">
                                            {belowMinimum && (
                                                <p>Minimum order of CA${vendorData.minimumOrderAmount.toFixed(2)} not met.</p>
                                            )}
                                            {!cardComplete && (
                                                <p>Please complete your card details.</p>
                                            )}
                                            {!stripeReady && (
                                                <p>Stripe is still loading. Please wait.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Place order button */}
                            <div className="px-5 pb-5">
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={placing || !stripeReady}
                                    className={`w-full py-3 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95 ${
                                        !canSubmit || placing
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-md hover:shadow-lg"
                                    }`}
                                >
                                    {placing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Placing order...
                                        </>
                                    ) : (
                                        `Place order · CA$${total.toFixed(2)}`
                                    )}
                                </button>
                                <p className="text-xs text-gray-400 text-center mt-3">
                                    By placing your order you agree to our terms of service.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}