"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrderAPI } from "@/lib/api/order/order.api";
import {
    CheckCircle2, Clock, MapPin, ShoppingBag,
    ChevronRight, Loader2, AlertCircle, Truck, Store,
} from "lucide-react";
import Link from "next/link";

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    PENDING:           { label: "Pending",          color: "text-amber-600  bg-amber-50  border-amber-200",  icon: Clock },
    CONFIRMED:         { label: "Confirmed",        color: "text-blue-600   bg-blue-50   border-blue-200",   icon: CheckCircle2 },
    PREPARING:         { label: "Preparing",        color: "text-orange-600 bg-orange-50 border-orange-200", icon: Clock },
    READY_FOR_PICKUP:  { label: "Ready for pickup", color: "text-green-600  bg-green-50  border-green-200",  icon: CheckCircle2 },
    OUT_FOR_DELIVERY:  { label: "Out for delivery", color: "text-blue-600   bg-blue-50   border-blue-200",   icon: Truck },
    DELIVERED:         { label: "Delivered",        color: "text-green-600  bg-green-50  border-green-200",  icon: CheckCircle2 },
    CANCELLED:         { label: "Cancelled",        color: "text-red-600    bg-red-50    border-red-200",    icon: AlertCircle },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${cfg.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
        </span>
    );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function Skeleton({ className }) {
    return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrderConfirmationPage() {
    const { publicOrderId } = useParams();
    const router = useRouter();

    const [order, setOrder]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    useEffect(() => {
        if (!publicOrderId) return;
        OrderAPI.getOrder(publicOrderId)
            .then(res => {
                if (!res?.data?.publicOrderId) throw new Error("Order not found.");
                setOrder(res.data);
            })
            .catch(err => setError(err.message || "Could not load order details."))
            .finally(() => setLoading(false));
    }, [publicOrderId]);

    // ── Error state ───────────────────────────────────────────────────────────
    if (!loading && error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-sm">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-7 h-7 text-red-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Could not load order</h2>
                    <p className="text-sm text-gray-500">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Go back
                        </button>
                        <Link
                            href="/orders"
                            className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                        >
                            My orders
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const isDelivery = order?.fulfillmentType === "DELIVERY";

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-xl mx-auto space-y-4">

                {/* ── Success banner ─────────────────────────────────────── */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-7 text-center text-white shadow-lg">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Order Placed!</h1>
                    <p className="text-orange-100 text-sm mt-1">
                        Your order has been received by the vendor.
                    </p>
                    {loading ? (
                        <Skeleton className="h-5 w-44 mx-auto mt-3 bg-white/20" />
                    ) : (
                        <p className="text-xs text-orange-200 mt-3 font-mono tracking-wide">
                            #{order?.publicOrderId}
                        </p>
                    )}
                </div>

                {/* ── Status + fulfillment ───────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                    {loading ? (
                        <>
                            <Skeleton className="h-7 w-28" />
                            <Skeleton className="h-7 w-24" />
                        </>
                    ) : (
                        <>
                            <StatusBadge status={order?.status} />
                            <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${isDelivery ? "text-blue-600" : "text-purple-600"}`}>
                                {isDelivery
                                    ? <><Truck className="w-4 h-4" /> Delivery</>
                                    : <><Store className="w-4 h-4" /> Pickup</>
                                }
                            </span>
                        </>
                    )}
                </div>

                {/* ── Order items ────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                        <ShoppingBag className="w-4 h-4 text-orange-500" />
                        <h2 className="text-sm font-semibold text-gray-800">Order items</h2>
                    </div>

                    {loading ? (
                        <div className="divide-y divide-gray-50">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {order?.orderLines?.map((item, idx) => (
                                <div key={idx} className="px-5 py-3.5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-5 h-5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold flex items-center justify-center">
                                            {item.quantity}
                                        </span>
                                        <span className="text-sm text-gray-800">{item.productNameAtPurchase ?? "Item"}</span>
                                    </div>
                                    {item.priceAtPurchase != null && (
                                        <span className="text-sm text-gray-500">
                                            ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Totals */}
                    {!loading && order && (
                        <div className="border-t border-gray-100 px-5 py-4 space-y-2">
                            {order.subtotal != null && (
                                <Row label="Subtotal" value={`$${order.subtotal.toFixed(2)}`} />
                            )}
                            {order.deliveryFee != null && order.deliveryFee > 0 && (
                                <Row label="Delivery fee" value={`$${order.deliveryFee.toFixed(2)}`} />
                            )}
                            {order.tax != null && (
                                <Row label="Tax" value={`$${order.tax.toFixed(2)}`} />
                            )}
                            {order.totalAmount != null && (
                                <Row
                                    label="Total"
                                    value={`$${order.totalAmount.toFixed(2)}`}
                                    bold
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* ── Delivery address ───────────────────────────────────── */}
                {!loading && isDelivery && order?.deliveryAddress && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <h2 className="text-sm font-semibold text-gray-800">Delivery address</h2>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {order.deliveryAddress.addressLine}
                            <br />
                            {order.deliveryAddress.city}, {order.deliveryAddress.province} {order.deliveryAddress.postalCode}
                        </p>
                    </div>
                )}

                {/* ── Special instructions ───────────────────────────────── */}
                {!loading && order?.specialInstructions && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
                        <p className="text-xs font-semibold text-amber-700 mb-1">Note to vendor</p>
                        <p className="text-sm text-amber-800">{order.specialInstructions}</p>
                    </div>
                )}

                {/* ── What happens next ──────────────────────────────────── */}
                {!loading && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                        <h2 className="text-sm font-semibold text-gray-800">What happens next</h2>
                        <ol className="space-y-2.5">
                            {[
                                "The vendor reviews and confirms your order.",
                                isDelivery
                                    ? "Your food will be prepared and dispatched for delivery."
                                    : "Your food will be prepared for pickup.",
                                "You will receive updates as your order progresses.",
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                    <span className="w-5 h-5 rounded-full bg-orange-50 text-orange-500 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* ── Actions ────────────────────────────────────────────── */}
                <div className="flex gap-3">
                    <Link
                        href="/orders"
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold shadow-md hover:from-orange-600 hover:to-red-700 transition-all"
                    >
                        Track my order
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Continue shopping
                    </Link>
                </div>

            </div>
        </div>
    );
}

// ── Helper ────────────────────────────────────────────────────────────────────

function Row({ label, value, bold }) {
    return (
        <div className={`flex items-center justify-between text-sm ${bold ? "font-semibold text-gray-900 pt-1 border-t border-gray-100" : "text-gray-500"}`}>
            <span>{label}</span>
            <span className={bold ? "text-orange-600" : ""}>{value}</span>
        </div>
    );
}
