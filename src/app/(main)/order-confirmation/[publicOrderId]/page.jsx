"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrderAPI } from "@/lib/api/order/order.api";
import {
    CheckCircle2, Clock, MapPin, ShoppingBag, ChevronRight,
    Loader2, AlertCircle, Truck, Store, RefreshCw, XCircle,
    Calendar, Ban, Package,
} from "lucide-react";
import Link from "next/link";
import { toast } from '@/components/ui/toast';

// ── Per-status hero config ────────────────────────────────────────────────────

const HERO = {
    PENDING: {
        gradient: 'from-orange-500 to-red-600',
        ringColor: 'ring-orange-300',
        Icon: Clock,
        title: 'Order Placed!',
        subtitle: (isDelivery) =>
            isDelivery
                ? 'Waiting for the restaurant to confirm your order. We\'ll notify you when it\'s accepted.'
                : 'Waiting for the restaurant to confirm your order for pickup.',
    },
    CONFIRMED: {
        gradient: 'from-blue-500 to-blue-700',
        ringColor: 'ring-blue-300',
        Icon: CheckCircle2,
        title: 'Order Confirmed!',
        subtitle: (isDelivery) =>
            isDelivery
                ? 'Great news — the vendor has accepted your order and will start preparing it shortly.'
                : 'Great news — the vendor has confirmed your order and will have it ready for pickup.',
    },
    PREPARING: {
        gradient: 'from-orange-400 to-amber-600',
        ringColor: 'ring-amber-300',
        Icon: Clock,
        title: 'Being Prepared',
        subtitle: () => 'Your order is being prepared right now. Sit tight!',
    },
    READY_FOR_PICKUP: {
        gradient: 'from-green-500 to-teal-600',
        ringColor: 'ring-green-300',
        Icon: Store,
        title: 'Ready for Pickup!',
        subtitle: () => 'Your order is packed and waiting for you at the restaurant. Head over whenever you\'re ready.',
    },
    OUT_FOR_DELIVERY: {
        gradient: 'from-blue-500 to-indigo-600',
        ringColor: 'ring-indigo-300',
        Icon: Truck,
        title: 'On the Way!',
        subtitle: () => 'Your order has been picked up and is heading your way. Shouldn\'t be long now!',
    },
    DELIVERED: {
        gradient: 'from-green-500 to-emerald-600',
        ringColor: 'ring-green-300',
        Icon: CheckCircle2,
        title: 'Delivered!',
        subtitle: () => 'Your order has been delivered. We hope you love it! We\'d love to hear what you thought.',
    },
    CANCELLED: {
        gradient: 'from-gray-500 to-gray-700',
        ringColor: 'ring-gray-300',
        Icon: XCircle,
        title: 'Order Cancelled',
        subtitle: () => 'This order has been cancelled. See below for details.',
    },
    REFUNDED: {
        gradient: 'from-purple-500 to-purple-700',
        ringColor: 'ring-purple-300',
        Icon: AlertCircle,
        title: 'Order Refunded',
        subtitle: () => 'A refund has been issued. Please allow 3–5 business days for it to appear on your statement.',
    },
};

// ── Order progress timeline ───────────────────────────────────────────────────

const DELIVERY_STEPS = [
    { key: 'PENDING',          label: 'Order placed' },
    { key: 'CONFIRMED',        label: 'Confirmed' },
    { key: 'PREPARING',        label: 'Preparing' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
    { key: 'DELIVERED',        label: 'Delivered' },
];

const PICKUP_STEPS = [
    { key: 'PENDING',          label: 'Order placed' },
    { key: 'CONFIRMED',        label: 'Confirmed' },
    { key: 'PREPARING',        label: 'Preparing' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for pickup' },
    { key: 'DELIVERED',        label: 'Picked up' },
];

function OrderTimeline({ status, isDelivery }) {
    if (status === 'CANCELLED' || status === 'REFUNDED') return null;

    const steps = isDelivery ? DELIVERY_STEPS : PICKUP_STEPS;

    // Map DELIVERED onto the last step for pickup (after READY_FOR_PICKUP)
    const activeKey = status === 'DELIVERED' ? 'DELIVERED' : status;
    const activeIdx = steps.findIndex(s => s.key === activeKey);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Order progress</p>
            <div className="flex items-start gap-0">
                {steps.map((step, i) => {
                    const done    = i < activeIdx;
                    const current = i === activeIdx;
                    const last    = i === steps.length - 1;
                    return (
                        <div key={step.key} className="flex-1 flex flex-col items-center relative">
                            {/* Connector line */}
                            {!last && (
                                <div className={`absolute top-3.5 left-1/2 w-full h-0.5 ${done || current ? 'bg-orange-400' : 'bg-gray-200'}`} />
                            )}
                            {/* Dot */}
                            <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors
                                ${done    ? 'bg-orange-500 border-orange-500'
                                : current ? 'bg-white border-orange-500 ring-4 ring-orange-100'
                                :           'bg-white border-gray-200'}`}>
                                {done ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                ) : current ? (
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                                )}
                            </div>
                            {/* Label */}
                            <p className={`mt-2 text-center text-[10px] font-semibold leading-tight px-0.5
                                ${done || current ? 'text-gray-800' : 'text-gray-400'}`}>
                                {step.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_BADGE = {
    PENDING:           { color: "text-amber-600  bg-amber-50  border-amber-200",  Icon: Clock },
    CONFIRMED:         { color: "text-blue-600   bg-blue-50   border-blue-200",   Icon: CheckCircle2 },
    PREPARING:         { color: "text-orange-600 bg-orange-50 border-orange-200", Icon: Clock },
    READY_FOR_PICKUP:  { color: "text-green-600  bg-green-50  border-green-200",  Icon: CheckCircle2 },
    OUT_FOR_DELIVERY:  { color: "text-blue-600   bg-blue-50   border-blue-200",   Icon: Truck },
    DELIVERED:         { color: "text-green-600  bg-green-50  border-green-200",  Icon: CheckCircle2 },
    CANCELLED:         { color: "text-red-600    bg-red-50    border-red-200",    Icon: XCircle },
    REFUNDED:          { color: "text-purple-600 bg-purple-50 border-purple-200", Icon: AlertCircle },
};

function StatusBadge({ status, statusLabel }) {
    const cfg = STATUS_BADGE[status] || STATUS_BADGE.PENDING;
    const { Icon } = cfg;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${cfg.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {statusLabel || status?.replace(/_/g, " ")}
        </span>
    );
}

// ── Cancellation audit trail config ──────────────────────────────────────────

const CANCELLATION_AUDIT = {
    CUSTOMER: {
        badge:   'Cancelled by you',
        badgeCss: 'bg-gray-100 text-gray-700 border-gray-200',
        message: 'You requested the cancellation of this order.',
        refund:  false,
    },
    VENDOR: {
        badge:   'Declined by restaurant',
        badgeCss: 'bg-orange-100 text-orange-700 border-orange-200',
        message: 'The restaurant was unable to accept this order.',
        refund:  true,
    },
    VENDOR_POST_ACCEPT: {
        badge:   'Cancelled by restaurant',
        badgeCss: 'bg-orange-100 text-orange-700 border-orange-200',
        message: 'The restaurant accepted your order but was subsequently unable to fulfil it.',
        refund:  true,
    },
    SYSTEM: {
        badge:   'Auto-cancelled',
        badgeCss: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        message: 'The restaurant did not respond within the required time window, so your order was automatically cancelled.',
        refund:  true,
    },
    ADMIN: {
        badge:   'Cancelled by Afrochow',
        badgeCss: 'bg-purple-100 text-purple-700 border-purple-200',
        message: 'This order was cancelled by the Afrochow support team.',
        refund:  null, // case-by-case — don't assume
    },
};

// ── "What's happening now" status messages ────────────────────────────────────
// Shown as a calm inline note beneath the progress tracker for mid-flow statuses

const STATUS_NOTE = {
    PENDING:          (isDelivery) => isDelivery
                          ? 'The restaurant typically responds within 10–15 minutes. You\'ll receive a notification as soon as your order is accepted.'
                          : 'The restaurant will confirm your order shortly.',
    CONFIRMED:        ()  => 'Your order is confirmed. The restaurant will start preparing it soon.',
    PREPARING:        ()  => 'Your order is being freshly prepared. Sit tight!',
    READY_FOR_PICKUP: ()  => 'Head to the restaurant — your order is packed and ready.',
    OUT_FOR_DELIVERY: ()  => 'Your delivery driver is on the way. Keep an eye out!',
};

// ── Loading skeleton ──────────────────────────────────────────────────────────

function Skeleton({ className }) {
    return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />;
}

// ── PolicyRow helper ──────────────────────────────────────────────────────────

function PolicyRow({ icon, title, body }) {
    return (
        <div className="flex items-start gap-3">
            <span className="text-base shrink-0 mt-0.5">{icon}</span>
            <div>
                <p className="font-semibold text-amber-900 mb-0.5">{title}</p>
                <p className="text-amber-800 leading-relaxed">{body}</p>
            </div>
        </div>
    );
}

// ── Row helper ────────────────────────────────────────────────────────────────

function Row({ label, value, bold, highlight }) {
    return (
        <div className={`flex items-center justify-between text-sm
            ${bold ? "font-semibold text-gray-900 pt-2 border-t border-gray-100 mt-1" : "text-gray-500"}`}>
            <span>{label}</span>
            <span className={bold || highlight ? "text-orange-600 font-bold" : ""}>{value}</span>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrderConfirmationPage() {
    const { publicOrderId } = useParams();
    const router = useRouter();

    const [order,      setOrder]      = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error,      setError]      = useState(null);

    const FINAL_STATUSES = new Set(["DELIVERED", "CANCELLED", "REFUNDED"]);

    const fetchOrder = (opts = {}) => {
        const { silent = false } = opts;
        if (silent) setRefreshing(true); else setLoading(true);
        return OrderAPI.getOrder(publicOrderId)
            .then(res => {
                if (!res?.data?.publicOrderId) {
                    const e = new Error("This order is no longer available.");
                    e.status = 404;
                    throw e;
                }
                setOrder(res.data);
                setError(null);
                return res.data;
            })
            .catch(err => setError({ message: err.message || "Could not load order details.", status: err.status }))
            .finally(() => { setLoading(false); setRefreshing(false); });
    };

    useEffect(() => { if (publicOrderId) fetchOrder(); }, [publicOrderId]);

    // Poll every 30 s while order is still active
    useEffect(() => {
        if (!order || FINAL_STATUSES.has(order.status)) return;
        const id = setInterval(() => fetchOrder({ silent: true }), 30_000);
        return () => clearInterval(id);
    }, [order?.status]);

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this order? Your payment will be refunded.")) return;
        setCancelling(true);
        try {
            const res = await OrderAPI.cancelOrder(publicOrderId);
            setOrder(res.data);
            toast.success("Order cancelled", { description: "Your refund has been initiated." });
        } catch (e) {
            toast.error("Could not cancel order", { description: e.message || "Please try again or contact support." });
        } finally {
            setCancelling(false);
        }
    };

    // ── Error ─────────────────────────────────────────────────────────────────
    if (!loading && error) {
        const isGone = error.status === 404 || error.status === 410;
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-sm">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${isGone ? 'bg-gray-100' : 'bg-red-50'}`}>
                        {isGone ? <XCircle className="w-7 h-7 text-gray-400" /> : <AlertCircle className="w-7 h-7 text-red-500" />}
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {isGone ? 'Order no longer available' : 'Could not load order'}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {isGone ? 'This order has been removed or is no longer accessible.' : error.message}
                    </p>
                    <div className="flex gap-3 justify-center">
                        {!isGone && (
                            <button onClick={() => router.back()} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                                Go back
                            </button>
                        )}
                        <Link href="/orders" className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors">
                            My orders
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const status     = order?.status;
    const isDelivery = order?.fulfillmentType === "DELIVERY";
    const isFinal    = status && FINAL_STATUSES.has(status);
    const hero       = HERO[status] ?? HERO.PENDING;
    const { Icon: HeroIcon } = hero;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-xl mx-auto space-y-4">

                {/* ── Hero banner — fully dynamic ────────────────────────── */}
                <div className={`bg-gradient-to-r ${hero.gradient} rounded-2xl p-7 text-center text-white shadow-lg`}>
                    <div className={`w-16 h-16 rounded-full bg-white/20 ring-4 ${hero.ringColor} flex items-center justify-center mx-auto mb-4`}>
                        {loading
                            ? <Loader2 className="w-8 h-8 text-white animate-spin" />
                            : <HeroIcon className="w-8 h-8 text-white" />
                        }
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {loading ? 'Loading order…' : hero.title}
                    </h1>
                    {!loading && (
                        <p className="text-white/80 text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">
                            {hero.subtitle(isDelivery)}
                        </p>
                    )}
                    {loading
                        ? <Skeleton className="h-4 w-44 mx-auto mt-4 bg-white/20" />
                        : (
                            <p className="text-xs text-white/60 mt-4 font-mono tracking-widest">
                                #{order?.publicOrderId}
                            </p>
                        )
                    }
                </div>

                {/* ── Status + fulfillment row ───────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
                    {loading ? (
                        <><Skeleton className="h-7 w-28" /><Skeleton className="h-7 w-24" /></>
                    ) : (
                        <>
                            <StatusBadge status={status} statusLabel={order?.statusLabel} />
                            <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${isDelivery ? 'text-blue-600' : 'text-purple-600'}`}>
                                {isDelivery
                                    ? <><Truck className="w-4 h-4" /> Delivery</>
                                    : <><Store className="w-4 h-4" /> Pickup</>
                                }
                            </span>
                        </>
                    )}
                </div>

                {/* ── Order progress timeline ────────────────────────────── */}
                {!loading && <OrderTimeline status={status} isDelivery={isDelivery} />}

                {/* ── Status note (active orders only) ──────────────────── */}
                {!loading && STATUS_NOTE[status] && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3.5 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800 leading-relaxed">{STATUS_NOTE[status](isDelivery)}</p>
                    </div>
                )}

                {/* ── Cancellation audit trail ───────────────────────────── */}
                {!loading && status === 'CANCELLED' && (() => {
                    const audit = CANCELLATION_AUDIT[order.cancelledBy] ?? null;
                    return (
                        <div className="bg-red-50 border border-red-200 rounded-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-red-100">
                                <Ban className="w-4 h-4 text-red-600 shrink-0" />
                                <h2 className="text-sm font-bold text-red-800 flex-1">Order Cancelled</h2>
                                {order.cancelledAt && (
                                    <span className="text-xs text-red-400 font-mono">
                                        {new Date(order.cancelledAt).toLocaleString('en-CA', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                )}
                            </div>

                            <div className="px-5 py-4 space-y-3">
                                {/* Cancelled-by badge */}
                                <div className="flex items-start gap-3">
                                    <span className="text-xs font-semibold text-red-400 w-16 shrink-0 pt-0.5">Source</span>
                                    {audit ? (
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${audit.badgeCss}`}>
                                            {audit.badge}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-red-700">{order.cancelledBy ?? 'Unknown'}</span>
                                    )}
                                </div>

                                {/* Explanation */}
                                {audit && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-xs font-semibold text-red-400 w-16 shrink-0 pt-0.5">Reason</span>
                                        <p className="text-sm text-red-700 leading-relaxed">{audit.message}</p>
                                    </div>
                                )}

                                {/* Vendor-supplied reason (shown for vendor/admin cancellations) */}
                                {order.cancellationReason && order.cancelledBy !== 'CUSTOMER' && order.cancelledBy !== 'SYSTEM' && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-xs font-semibold text-red-400 w-16 shrink-0 pt-0.5">Note</span>
                                        <p className="text-sm text-red-600 italic leading-relaxed">
                                            &ldquo;{order.cancellationReason}&rdquo;
                                        </p>
                                    </div>
                                )}

                                {/* Refund notice */}
                                {audit?.refund === true && (
                                    <div className="flex items-start gap-3 pt-1 border-t border-red-100">
                                        <span className="text-xs font-semibold text-red-400 w-16 shrink-0 pt-0.5">Refund</span>
                                        <p className="text-xs text-red-700 leading-relaxed">
                                            A full refund has been issued to your original payment method and will appear within <strong>3–5 business days</strong>.
                                        </p>
                                    </div>
                                )}
                                {audit?.refund === false && (
                                    <div className="flex items-start gap-3 pt-1 border-t border-red-100">
                                        <span className="text-xs font-semibold text-red-400 w-16 shrink-0 pt-0.5">Refund</span>
                                        <p className="text-xs text-red-700">No refund applicable for customer-initiated cancellations at this stage.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* ── Requested fulfilment time ──────────────────────────── */}
                {!loading && order?.requestedFulfillmentTime && !isFinal && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-blue-700 mb-0.5">Requested Fulfilment Time</p>
                            <p className="text-sm text-blue-800 font-medium">
                                {new Date(order.requestedFulfillmentTime).toLocaleString(undefined, {
                                    weekday: 'long', year: 'numeric', month: 'long',
                                    day: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                            </p>
                            <p className="text-xs text-blue-600 mt-0.5">
                                The vendor will aim to have your order ready by this time.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Order items ────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                        <ShoppingBag className="w-4 h-4 text-orange-500" />
                        <h2 className="text-sm font-semibold text-gray-800">Your order</h2>
                        {!loading && order?.vendorName && (
                            <span className="ml-auto text-xs text-gray-400 font-medium">{order.vendorName}</span>
                        )}
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
                                <div key={idx} className="px-5 py-3.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0">
                                            {item.quantity}
                                        </span>
                                        <span className="text-sm text-gray-800 truncate">{item.productNameAtPurchase ?? "Item"}</span>
                                    </div>
                                    {item.priceAtPurchase != null && (
                                        <span className="text-sm text-gray-500 shrink-0">
                                            CA${(item.priceAtPurchase * item.quantity).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Totals */}
                    {!loading && order && (
                        <div className="border-t border-gray-100 px-5 py-4 space-y-1.5">
                            {order.subtotal != null && <Row label="Subtotal" value={`CA$${order.subtotal.toFixed(2)}`} />}
                            {order.discount != null && order.discount > 0 && (
                                <Row label={`Promo${order.appliedPromoCode ? ` (${order.appliedPromoCode})` : ''}`} value={`-CA$${order.discount.toFixed(2)}`} />
                            )}
                            {order.deliveryFee != null && order.deliveryFee > 0 && (
                                <Row label="Delivery fee" value={`CA$${order.deliveryFee.toFixed(2)}`} />
                            )}
                            {order.tax != null && <Row label="Tax" value={`CA$${order.tax.toFixed(2)}`} />}
                            {order.totalAmount != null && (
                                <Row label="Total" value={`CA$${order.totalAmount.toFixed(2)}`} bold />
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
                            {order.deliveryAddress.addressLine}<br />
                            {order.deliveryAddress.city}, {order.deliveryAddress.province} {order.deliveryAddress.postalCode}
                        </p>
                    </div>
                )}

                {/* ── Special instructions ───────────────────────────────── */}
                {!loading && order?.specialInstructions && !isFinal && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
                        <p className="text-xs font-semibold text-amber-700 mb-1">Note to vendor</p>
                        <p className="text-sm text-amber-800">{order.specialInstructions}</p>
                    </div>
                )}

                {/* ── Delivered — celebration message ───────────────────── */}
                {!loading && status === 'DELIVERED' && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-center space-y-1">
                        <p className="text-sm font-semibold text-green-800">Hope you love your order! 🎉</p>
                        <p className="text-xs text-green-700">
                            Leave a review to help others discover great African products on Afrochow.
                        </p>
                    </div>
                )}

                {/* ── Payment & Refund policy — status-aware ────────────── */}
                {!loading && !isFinal && (() => {
                    const isPending    = status === 'PENDING';
                    const isConfirmed  = status === 'CONFIRMED';
                    const isPreparing  = status === 'PREPARING';
                    const isLate       = status === 'READY_FOR_PICKUP' || status === 'OUT_FOR_DELIVERY';
                    const canCancel    = order?.canBeCancelled;

                    return (
                        <div className="border border-amber-200 rounded-2xl overflow-hidden">
                            <div className="bg-amber-50 px-5 py-3 border-b border-amber-200">
                                <h2 className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                                    Payment &amp; Refund Policy
                                </h2>
                            </div>

                            <div className="bg-amber-50/50 px-5 py-4 space-y-3 text-xs text-amber-900">

                                {/* ── PENDING: hold not a charge ── */}
                                {isPending && (
                                    <>
                                        <PolicyRow
                                            icon="💳"
                                            title="Authorization hold placed"
                                            body="Your card has an authorization hold — no money has been charged yet. The hold will appear as a pending transaction on your statement but no funds are taken until the restaurant confirms your order."
                                        />
                                        <PolicyRow
                                            icon="✅"
                                            title="Free to cancel"
                                            body="You can cancel this order at any time before the restaurant accepts it. The authorization hold will be released immediately — no charge will ever appear."
                                        />
                                        <PolicyRow
                                            icon="⏱"
                                            title="If the restaurant doesn't respond"
                                            body="If the restaurant does not accept within the required window, your order is automatically cancelled and the hold is released. If not processed immediately, the hold expires on its own within 7 business days."
                                        />
                                    </>
                                )}

                                {/* ── CONFIRMED: charged, window open ── */}
                                {isConfirmed && canCancel && (
                                    <>
                                        <PolicyRow
                                            icon="💳"
                                            title="Your card has been charged"
                                            body="When the restaurant confirmed your order, the authorization hold was converted to a real charge. The full order amount has been collected by Afrochow and is held securely until delivery."
                                        />
                                        <PolicyRow
                                            icon="✅"
                                            title="Cancellation window is open"
                                            body="You can still cancel this order for a full refund — your 6-hour cancellation window is active. Refunds are initiated immediately and typically appear on your statement within 5–10 business days."
                                        />
                                        <PolicyRow
                                            icon="🍽"
                                            title="If the restaurant can't fulfil"
                                            body="If the restaurant becomes unable to complete your order, you will receive a full automatic refund within 5–10 business days."
                                        />
                                    </>
                                )}

                                {/* ── CONFIRMED: charged, window closed ── */}
                                {isConfirmed && !canCancel && (
                                    <>
                                        <PolicyRow
                                            icon="💳"
                                            title="Your card has been charged"
                                            body="Your card was charged when the restaurant confirmed your order. The amount is held by Afrochow and will be released to the restaurant upon delivery."
                                        />
                                        <PolicyRow
                                            icon="🔒"
                                            title="Cancellation window has closed"
                                            body="Your 6-hour cancellation window has passed. Self-service cancellation is no longer available. If you need to cancel, please contact Afrochow support."
                                        />
                                        <PolicyRow
                                            icon="🍽"
                                            title="If the restaurant can't fulfil"
                                            body="If the restaurant is unable to complete your order, you will receive a full automatic refund within 5–10 business days."
                                        />
                                    </>
                                )}

                                {/* ── PREPARING: captured, window definitely closed ── */}
                                {isPreparing && (
                                    <>
                                        <PolicyRow
                                            icon="💳"
                                            title="Your card has been charged"
                                            body="Your card was charged when the vendor confirmed your order. Your items are now actively being prepared."
                                        />
                                        <PolicyRow
                                            icon="🔒"
                                            title="Self-service cancellation unavailable"
                                            body="Your order is being prepared and can no longer be self-cancelled. If something has come up, contact Afrochow support as soon as possible."
                                        />
                                        <PolicyRow
                                            icon="🍽"
                                            title="If the restaurant can't fulfil"
                                            body="In the rare case the restaurant cannot complete your order at this stage, you will receive a full automatic refund within 5–10 business days."
                                        />
                                    </>
                                )}

                                {/* ── READY / OUT_FOR_DELIVERY: almost done ── */}
                                {isLate && (
                                    <>
                                        <PolicyRow
                                            icon="💳"
                                            title="Your card has been charged"
                                            body="Your card was charged when the restaurant confirmed your order. Payment will be released to the restaurant once your order is marked as delivered."
                                        />
                                        <PolicyRow
                                            icon="🚫"
                                            title="Cancellation not available at this stage"
                                            body="Your order is nearly complete and can no longer be cancelled. If you experience an issue upon delivery, please contact Afrochow support."
                                        />
                                    </>
                                )}

                            </div>
                        </div>
                    );
                })()}

                {/* ── Actions ────────────────────────────────────────────── */}
                <div className="flex gap-3">
                    {/* Refresh — only for active orders */}
                    {!isFinal && (
                        <button
                            onClick={() => fetchOrder({ silent: true })}
                            disabled={refreshing || cancelling}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold shadow-md hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-70"
                        >
                            {refreshing
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</>
                                : <><RefreshCw className="w-4 h-4" /> Refresh status</>
                            }
                        </button>
                    )}

                    <Link
                        href="/orders"
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        <Package className="w-4 h-4" />
                        {isFinal ? 'View all orders' : 'All orders'}
                    </Link>
                </div>

                {/* ── Cancel order ────────────────────────────────────────── */}
                {!loading && order?.canBeCancelled && (
                    <button
                        onClick={handleCancel}
                        disabled={cancelling || refreshing}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                        {cancelling
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling…</>
                            : <><XCircle className="w-4 h-4" /> Cancel order</>
                        }
                    </button>
                )}

            </div>
        </div>
    );
}
