"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { CustomerAPI } from "@/lib/api/customer.api";
import { SearchAPI } from "@/lib/api/search.api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    MapPin, ChevronRight, Plus, Truck, FileText,
    ShoppingBag, Check, ChevronDown, Clock, AlertCircle
} from "lucide-react";

const PROVINCIAL_TAX = {
    AB: { rate: 0.05,    label: "GST",       province: "Alberta" },
    BC: { rate: 0.12,    label: "GST + PST",  province: "British Columbia" },
    MB: { rate: 0.12,    label: "GST + PST",  province: "Manitoba" },
    NB: { rate: 0.15,    label: "HST",        province: "New Brunswick" },
    NL: { rate: 0.15,    label: "HST",        province: "Newfoundland and Labrador" },
    NS: { rate: 0.15,    label: "HST",        province: "Nova Scotia" },
    ON: { rate: 0.13,    label: "HST",        province: "Ontario" },
    PE: { rate: 0.15,    label: "HST",        province: "Prince Edward Island" },
    QC: { rate: 0.14975, label: "GST + QST",  province: "Quebec" },
    SK: { rate: 0.11,    label: "GST + PST",  province: "Saskatchewan" },
};

const PROVINCES = [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "MB", label: "Manitoba" },
    { value: "NB", label: "New Brunswick" },
    { value: "NL", label: "Newfoundland and Labrador" },
    { value: "NS", label: "Nova Scotia" },
    { value: "ON", label: "Ontario" },
    { value: "PE", label: "Prince Edward Island" },
    { value: "QC", label: "Quebec" },
    { value: "SK", label: "Saskatchewan" },
];

export default function CheckoutPage() {
    // ── Auth — destructure BOTH isAuthenticated AND isLoading ─────────────────
    // isLoading tells us auth state is still being resolved — we must wait
    // before redirecting, otherwise unauthenticated flashes happen.
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const { cartItems, cartTotal, vendorId, clearCart } = useCart();
    const router = useRouter();

    const [profileData, setProfileData] = useState(null);
    const [vendorData, setVendorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const [fulfillment, setFulfillment] = useState("delivery");
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showNewAddress, setShowNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        addressLine: "", city: "", province: "AB",
        postalCode: "", country: "Canada", defaultAddress: false
    });
    const [deliveryNote, setDeliveryNote] = useState("");

    const [cardDetails, setCardDetails] = useState({
        name: "", number: "", expiry: "", cvv: ""
    });
    const [cardErrors, setCardErrors] = useState({
        name: "", number: "", expiry: "", cvv: ""
    });

    // ── Data loader — stable reference via useCallback ───────────────────────
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
            }

        } catch (e) {
            toast.error("Could not load checkout data", { description: e.message });
        } finally {
            setLoading(false);
        }
    }, [vendorId]);

    // ── Guard effect ──────────────────────────────────────────────────────────
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
    const deliveryFee = fulfillment === "delivery" ? vendorDeliveryFee : 0;
    const taxAmount = (cartTotal + deliveryFee) * taxInfo.rate;
    const total = cartTotal + deliveryFee + taxAmount;

    const belowMinimum = fulfillment === "delivery" &&
        vendorData?.minimumOrderAmount > 0 &&
        cartTotal < vendorData.minimumOrderAmount;

    const cardComplete =
        cardDetails.name.trim() !== "" &&
        cardDetails.number.replace(/\s/g, "").length === 16 &&
        /^\d{2}\/\d{2}$/.test(cardDetails.expiry) &&
        cardDetails.cvv.length >= 3;

    const canSubmit = !belowMinimum && cardComplete;

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleCardChange = (e) => {
        let { name, value } = e.target;
        if (name === "number") value = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
        if (name === "expiry") value = value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
        if (name === "cvv") value = value.replace(/\D/g, "").slice(0, 4);
        setCardDetails(prev => ({ ...prev, [name]: value }));
        if (submitAttempted) setCardErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validateCard = () => {
        const errors = { name: "", number: "", expiry: "", cvv: "" };
        let valid = true;

        if (!cardDetails.name.trim()) {
            errors.name = "Cardholder name is required"; valid = false;
        }
        const raw = cardDetails.number.replace(/\s/g, "");
        if (!raw) {
            errors.number = "Card number is required"; valid = false;
        } else if (raw.length < 16) {
            errors.number = "Card number must be 16 digits"; valid = false;
        }
        if (!cardDetails.expiry) {
            errors.expiry = "Expiry date is required"; valid = false;
        } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
            errors.expiry = "Invalid format (MM/YY)"; valid = false;
        }
        if (!cardDetails.cvv) {
            errors.cvv = "CVV is required"; valid = false;
        } else if (cardDetails.cvv.length < 3) {
            errors.cvv = "CVV must be 3–4 digits"; valid = false;
        }

        setCardErrors(errors);
        return valid;
    };

    const handleNewAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handlePlaceOrder = async () => {
        setSubmitAttempted(true);

        if (!validateCard()) return;

        if (belowMinimum) {
            toast.error("Minimum order not met", {
                description: `Add $${(vendorData.minimumOrderAmount - cartTotal).toFixed(2)} more to proceed.`,
            });
            return;
        }

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
            if (fulfillment === "delivery" && showNewAddress) {
                await CustomerAPI.addAddress(newAddress);
            }
            // TODO: POST /orders
            await new Promise(r => setTimeout(r, 1200));
            clearCart();
            router.push("/orders");
        } catch (e) {
            toast.error("Failed to place order", {
                description: e.message || "Please try again.",
            });
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
                            <span className="font-semibold">${vendorData.minimumOrderAmount.toFixed(2)}</span>.
                            Add <span className="font-semibold">${(vendorData.minimumOrderAmount - cartTotal).toFixed(2)}</span> more to proceed.
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
                                        value: "delivery",
                                        label: "Delivery",
                                        sub: vendorData?.offersDelivery
                                            ? vendorDeliveryFee === 0 ? "Free delivery" : `+$${vendorDeliveryFee.toFixed(2)}`
                                            : "Not available",
                                        disabled: !vendorData?.offersDelivery,
                                    },
                                    {
                                        value: "pickup",
                                        label: "Pickup",
                                        sub: vendorData?.offersPickup ? "Free" : "Not available",
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
                                                type="text"
                                                name="addressLine"
                                                value={newAddress.addressLine}
                                                onChange={handleNewAddressChange}
                                                placeholder="Street address"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    name="city"
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
                                                type="text"
                                                name="postalCode"
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
                                                    type="checkbox"
                                                    name="defaultAddress"
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

                        {/* ── Pickup address — shown when fulfillment is pickup ── */}
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
                                            <p className="text-sm font-medium text-gray-900">
                                                {vendorData.restaurantName}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                {vendorData.address.formattedAddress}
                                            </p>
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

                        {/* Payment */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center">
                                    <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                                </div>
                                <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Credit or debit card</p>
                            </div>
                            <div className="p-4 space-y-3">

                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={cardDetails.name}
                                        onChange={handleCardChange}
                                        placeholder="Cardholder name"
                                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 ${
                                            cardErrors.name ? "border-red-400 bg-red-50" : "border-gray-300"
                                        }`}
                                    />
                                    {cardErrors.name && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />{cardErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        name="number"
                                        value={cardDetails.number}
                                        onChange={handleCardChange}
                                        placeholder="Card number"
                                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-mono ${
                                            cardErrors.number ? "border-red-400 bg-red-50" : "border-gray-300"
                                        }`}
                                    />
                                    {cardErrors.number && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />{cardErrors.number}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <input
                                            type="text"
                                            name="expiry"
                                            value={cardDetails.expiry}
                                            onChange={handleCardChange}
                                            placeholder="MM/YY"
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-mono ${
                                                cardErrors.expiry ? "border-red-400 bg-red-50" : "border-gray-300"
                                            }`}
                                        />
                                        {cardErrors.expiry && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />{cardErrors.expiry}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            name="cvv"
                                            value={cardDetails.cvv}
                                            onChange={handleCardChange}
                                            placeholder="CVV"
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-mono ${
                                                cardErrors.cvv ? "border-red-400 bg-red-50" : "border-gray-300"
                                            }`}
                                        />
                                        {cardErrors.cvv && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />{cardErrors.cvv}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs text-gray-400">Your card details are encrypted and secure.</p>
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
                                                    width={40}
                                                    height={40}
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
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="px-5 py-4 border-t border-gray-100 space-y-2.5">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${cartTotal.toFixed(2)}</span>
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
                                                : `$${vendorDeliveryFee.toFixed(2)}`
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
                                    <span>${taxAmount.toFixed(2)}</span>
                                </div>

                                <div className="pt-2 border-t border-gray-100 flex justify-between">
                                    <span className="text-sm font-semibold text-gray-900">Total</span>
                                    <span className="text-sm font-bold text-gray-900">${total.toFixed(2)} CAD</span>
                                </div>

                                {fulfillment === "delivery" && vendorData?.minimumOrderAmount > 0 && (
                                    <p className={`text-xs ${belowMinimum ? "text-red-500" : "text-gray-400"}`}>
                                        Minimum order: ${vendorData.minimumOrderAmount.toFixed(2)}
                                    </p>
                                )}
                            </div>

                            {/* Blocked reasons — shown only after first submit attempt */}
                            {submitAttempted && !canSubmit && (
                                <div className="px-5 pb-3">
                                    <div className="flex items-start gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                                        <AlertCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                        <div className="text-xs text-gray-600 space-y-0.5">
                                            {belowMinimum && (
                                                <p>Minimum order of ${vendorData.minimumOrderAmount.toFixed(2)} not met.</p>
                                            )}
                                            {!cardComplete && (
                                                <p>Please complete your card details.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Place order button */}
                            <div className="px-5 pb-5">
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={placing}
                                    className={`w-full py-3 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95 ${
                                        !canSubmit
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-md hover:shadow-lg"
                                    }`}
                                >
                                    {placing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Placing order...
                                        </>
                                    ) : (
                                        `Place order · $${total.toFixed(2)}`
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