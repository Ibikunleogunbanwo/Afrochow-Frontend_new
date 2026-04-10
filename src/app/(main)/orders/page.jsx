"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrderAPI } from "@/lib/api/order/order.api";
import { useAuth } from "@/hooks/useAuth";
import {
    Package, Clock, CheckCircle2, XCircle, Truck,
    Store, ChevronRight, AlertCircle, Loader2,
    MapPin, Star, Ban, RefreshCw, ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from '@/components/ui/toast';
import Breadcrumb from "@/components/ui/Breadcrumb";
import WriteReviewModal from "@/components/register/vendor/vendorComponent/WriteReviewModal";

// ── Status config — matches backend OrderStatus enum ─────────────────────────

const STATUS_CONFIG = {
    PENDING:          { color: "text-amber-700  bg-amber-50  border-amber-200",  icon: Clock },
    CONFIRMED:        { color: "text-blue-700   bg-blue-50   border-blue-200",   icon: CheckCircle2 },
    PREPARING:        { color: "text-orange-700 bg-orange-50 border-orange-200", icon: Clock },
    READY_FOR_PICKUP: { color: "text-green-700  bg-green-50  border-green-200",  icon: CheckCircle2 },
    OUT_FOR_DELIVERY: { color: "text-blue-700   bg-blue-50   border-blue-200",   icon: Truck },
    DELIVERED:        { color: "text-green-700  bg-green-50  border-green-200",  icon: CheckCircle2 },
    CANCELLED:        { color: "text-red-700    bg-red-50    border-red-200",    icon: XCircle },
    REFUNDED:         { color: "text-purple-700 bg-purple-50 border-purple-200", icon: XCircle },
};

const ACTIVE_STATUSES = new Set(["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"]);
const FINAL_STATUSES  = new Set(["DELIVERED", "CANCELLED", "REFUNDED"]);

const TABS = [
    { key: "all",       label: "All"       },
    { key: "active",    label: "Active"    },
    { key: "DELIVERED", label: "Delivered" },
    { key: "CANCELLED", label: "Cancelled" },
];

// Left-border accent colour per status
const STATUS_ACCENT = {
    PENDING:          "border-l-amber-400",
    CONFIRMED:        "border-l-blue-400",
    PREPARING:        "border-l-orange-400",
    READY_FOR_PICKUP: "border-l-green-400",
    OUT_FOR_DELIVERY: "border-l-blue-500",
    DELIVERED:        "border-l-green-300",
    CANCELLED:        "border-l-red-300",
    REFUNDED:         "border-l-purple-300",
};

// Avatar background per status
const STATUS_AVATAR_BG = {
    PENDING:          "bg-amber-100  text-amber-700",
    CONFIRMED:        "bg-blue-100   text-blue-700",
    PREPARING:        "bg-orange-100 text-orange-700",
    READY_FOR_PICKUP: "bg-green-100  text-green-700",
    OUT_FOR_DELIVERY: "bg-blue-100   text-blue-700",
    DELIVERED:        "bg-green-50   text-green-600",
    CANCELLED:        "bg-red-50     text-red-400",
    REFUNDED:         "bg-purple-50  text-purple-400",
};

function StatusBadge({ status, statusLabel }) {
    const cfg  = STATUS_CONFIG[status] || { color: "text-gray-600 bg-gray-50 border-gray-200", icon: Package };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
            <Icon className="w-3 h-3 shrink-0" />
            {statusLabel || status?.replace(/_/g, " ")}
        </span>
    );
}

// Vendor initials avatar
function VendorAvatar({ name, status }) {
    const initials = (name ?? "?")
        .split(" ").slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? "")
        .join("");
    const bg = STATUS_AVATAR_BG[status] ?? "bg-gray-100 text-gray-500";
    return (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${bg}`}>
            {initials}
        </div>
    );
}

function OrderCard({ order, onCancel, cancelling, onReview, reviewed }) {
    const isActive    = ACTIVE_STATUSES.has(order.status);
    const isCancelled = order.status === "CANCELLED";
    const isDelivery  = order.fulfillmentType === "DELIVERY";

    // OrderSummaryResponseDto returns itemNames: List<String> + itemCount: Integer
    // (no orderLines / cancellationReason / cancelledBy on list endpoint)
    const itemNames = order.itemNames ?? [];
    const itemCount = order.itemCount ?? itemNames.length ?? null;
    const shortId   = order.publicOrderId?.slice(-8).toUpperCase();

    const dateTimeStr = order.orderTime
        ? new Date(order.orderTime).toLocaleString("en-CA", {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })
        : "—";

    const accent = STATUS_ACCENT[order.status] ?? "border-l-gray-200";

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${accent}
            overflow-hidden hover:shadow-md transition-all duration-200
            ${isCancelled ? "opacity-75" : ""}`}
        >
            {/* Active pulse bar */}
            {isActive && (
                <div className="h-0.5 w-full bg-gradient-to-r from-orange-400 to-red-500" />
            )}

            <div className="p-4 sm:p-5 space-y-3.5">

                {/* ── Header: avatar + vendor info + status ── */}
                <div className="flex items-start gap-3">
                    <VendorAvatar name={order.vendorName} status={order.status} />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-gray-900 text-sm leading-snug truncate">
                                {order.vendorName ?? "—"}
                            </p>
                            <StatusBadge status={order.status} statusLabel={order.statusLabel} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[11px] text-gray-400 font-mono">#{shortId}</span>
                            <span className="text-gray-200 text-xs">·</span>
                            <span className="text-[11px] text-gray-400">{dateTimeStr}</span>
                        </div>
                    </div>
                </div>

                {/* ── Fulfillment + address ── */}
                <div className="flex items-start gap-2 text-xs text-gray-500">
                    {isDelivery
                        ? <Truck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-400" />
                        : <Store className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-400" />
                    }
                    <span className="font-semibold text-gray-600 shrink-0">
                        {isDelivery ? "Delivery" : "Pickup"}
                    </span>
                    {isDelivery && order.deliveryAddress && (
                        <>
                            <span className="text-gray-300">·</span>
                            <span className="truncate text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {order.deliveryAddress.addressLine
                                    ? `${order.deliveryAddress.addressLine}, ${order.deliveryAddress.city}`
                                    : order.deliveryAddress.formattedAddress ?? ""}
                            </span>
                        </>
                    )}
                </div>

                {/* ── Item name chips — summary DTO: List<String> ── */}
                {itemNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {itemNames.slice(0, 4).map((name, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600 font-medium"
                            >
                                {name}
                            </span>
                        ))}
                        {itemNames.length > 4 && (
                            <span className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-400 font-medium">
                                +{itemNames.length - 4} more
                            </span>
                        )}
                    </div>
                )}

                {/* ── Cancelled nudge — full reason is on the detail page ── */}
                {isCancelled && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl border border-red-100">
                        <Ban className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <p className="text-xs text-red-500">
                            Order cancelled — view details for the full reason.
                        </p>
                    </div>
                )}

                {/* ── Total + item count footer ── */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Package className="w-3.5 h-3.5" />
                        {itemCount != null
                            ? `${itemCount} ${itemCount === 1 ? "item" : "items"}`
                            : "—"
                        }
                    </div>
                    <span className={`text-base font-black ${isCancelled ? "text-gray-400 line-through" : "text-orange-600"}`}>
                        CA${Number(order.totalAmount ?? 0).toFixed(2)}
                    </span>
                </div>

                {/* ── Actions ── */}
                <div className="flex items-center gap-2">
                    {/* Primary — View details */}
                    <Link
                        href={`/order-confirmation/${order.publicOrderId}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors"
                    >
                        View details
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* Cancel */}
                    {order.canBeCancelled && (
                        <button
                            onClick={() => onCancel(order.publicOrderId)}
                            disabled={cancelling === order.publicOrderId}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            {cancelling === order.publicOrderId
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <><XCircle className="w-3.5 h-3.5" /> Cancel</>
                            }
                        </button>
                    )}

                    {/* Review */}
                    {order.status === "DELIVERED" && (
                        reviewed ? (
                            <span className="flex items-center gap-1 px-3 py-2.5 text-xs text-green-600 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                            </span>
                        ) : (
                            <button
                                onClick={() => onReview(order)}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-200 text-amber-600 text-xs font-bold hover:bg-amber-50 transition-colors"
                            >
                                <Star className="w-3.5 h-3.5" /> Review
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [orders, setOrders]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [tab, setTab]             = useState("all");
    const [cancelling, setCancelling] = useState(null); // publicOrderId being cancelled
    const [reviewTarget, setReviewTarget] = useState(null); // order being reviewed
    const [reviewedOrders, setReviewedOrders] = useState(new Set());
    const [page, setPage] = useState(1);

    const PAGE_SIZE = 10;

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) { router.push("/"); return; }

        OrderAPI.getMyOrders()
            .then(res => setOrders(res?.data ?? []))
            .catch(err => setError(err.message || "Could not load orders."))
            .finally(() => setLoading(false));
    }, [isAuthenticated, authLoading, router]);

    const handleCancel = async (publicOrderId) => {
        setCancelling(publicOrderId);
        try {
            const res = await OrderAPI.cancelOrder(publicOrderId);
            setOrders(prev => prev.map(o =>
                o.publicOrderId === publicOrderId ? { ...o, ...res.data, canBeCancelled: false } : o
            ));
            toast.success('Order cancelled', { description: 'Your order has been successfully cancelled.' });
        } catch (e) {
            toast.error("Could not cancel order", { description: e.message });
        } finally {
            setCancelling(null);
        }
    };

    const filtered = orders.filter(o => {
        if (tab === "all")    return true;
        if (tab === "active") return ACTIVE_STATUSES.has(o.status);
        return o.status === tab;
    });

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const totalSpent   = orders.filter(o => o.status === "DELIVERED").reduce((s, o) => s + Number(o.totalAmount ?? 0), 0);
    const completedCount = orders.filter(o => o.status === "DELIVERED").length;
    const activeCount  = orders.filter(o => ACTIVE_STATUSES.has(o.status)).length;

    // ── Loading ───────────────────────────────────────────────────────────────
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center space-y-3 max-w-sm">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                    <p className="text-sm text-gray-600">{error}</p>
                    <button
                        onClick={() => { setError(null); setLoading(true); OrderAPI.getMyOrders().then(res => setOrders(res?.data ?? [])).catch(e => setError(e.message)).finally(() => setLoading(false)); }}
                        className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 space-y-6">

                <Breadcrumb items={[
                    { label: "Profile",  href: "/profile"  },
                    { label: "My orders" },
                ]} />

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
                    <p className="text-gray-500 text-sm mt-1">Track and manage your orders</p>
                </div>

                {/* Stats */}
                {orders.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                            { label: "Orders",      value: orders.length,                 color: "text-gray-900"   },
                            { label: "Active",      value: activeCount,                   color: "text-orange-600" },
                            { label: "Total spent", value: `CA$${totalSpent.toFixed(2)}`, color: "text-green-600"  },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-3 text-center">
                                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => { setTab(t.key); setPage(1); }}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                tab === t.key
                                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            {t.label}
                            {t.key === "active" && activeCount > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{activeCount}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Orders */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="font-semibold text-gray-700">
                            {tab === "all" ? "No orders yet" : `No ${tab.toLowerCase().replace("_", " ")} orders`}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {tab === "all" && "Discover great African products on Afrochow!"}
                        </p>
                        {tab === "all" && (
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
                            >
                                Browse stores
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {paginated.map(order => (
                                <OrderCard
                                    key={order.publicOrderId}
                                    order={order}
                                    onCancel={handleCancel}
                                    cancelling={cancelling}
                                    onReview={setReviewTarget}
                                    reviewed={reviewedOrders.has(order.publicOrderId)}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </button>
                                <span className="text-sm text-gray-500">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>

        {reviewTarget && (
            <WriteReviewModal
                isOpen={!!reviewTarget}
                onClose={() => setReviewTarget(null)}
                vendorPublicId={reviewTarget.vendorPublicId}
                vendorName={reviewTarget.vendorName}
                eligibleOrderId={reviewTarget.publicOrderId}
                onSuccess={() => {
                    setReviewedOrders(prev => new Set(prev).add(reviewTarget.publicOrderId));
                    setReviewTarget(null);
                }}
            />
        )}
        </>
    );
}
