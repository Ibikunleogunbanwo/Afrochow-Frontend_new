"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrderAPI } from "@/lib/api/order/order.api";
import { useAuth } from "@/hooks/useAuth";
import {
    Package, Clock, CheckCircle2, XCircle, Truck,
    Store, ChevronRight, AlertCircle, Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/Breadcrumb";

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

const TABS = [
    { key: "all",      label: "All" },
    { key: "active",   label: "Active" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "CANCELLED", label: "Cancelled" },
];

function StatusBadge({ status, statusLabel }) {
    const cfg = STATUS_CONFIG[status] || { color: "text-gray-600 bg-gray-50 border-gray-200", icon: Package };
    const Icon = cfg.icon;
    const label = statusLabel || status?.replace(/_/g, " ");
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
            <Icon className="w-3 h-3 shrink-0" />
            {label}
        </span>
    );
}

function OrderCard({ order, onCancel, cancelling }) {
    const isActive  = ACTIVE_STATUSES.has(order.status);
    const isDelivery = order.fulfillmentType === "DELIVERY";

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{order.vendorName}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">
                            #{order.publicOrderId} · {order.orderTime
                                ? new Date(order.orderTime).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })
                                : "—"}
                        </p>
                    </div>
                    <StatusBadge status={order.status} statusLabel={order.statusLabel} />
                </div>

                {/* Fulfillment type */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                    {isDelivery
                        ? <><Truck className="w-3.5 h-3.5" /> Delivery</>
                        : <><Store className="w-3.5 h-3.5" /> Pickup</>
                    }
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-lg font-black text-orange-600">
                        CA${order.totalAmount?.toFixed(2) ?? "—"}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                    <Link
                        href={`/order-confirmation/${order.publicOrderId}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
                    >
                        View details
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    {order.canBeCancelled && (
                        <button
                            onClick={() => onCancel(order.publicOrderId)}
                            disabled={cancelling === order.publicOrderId}
                            className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            {cancelling === order.publicOrderId
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : "Cancel"
                            }
                        </button>
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

    const totalSpent   = orders.filter(o => o.status === "DELIVERED").reduce((s, o) => s + (o.totalAmount ?? 0), 0);
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
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Total",     value: orders.length },
                            { label: "Active",    value: activeCount },
                            { label: "Spent",     value: `CA$${totalSpent.toFixed(2)}` },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                                <p className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">{s.value}</p>
                                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
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
                            {tab === "all" && "Start exploring delicious African cuisine!"}
                        </p>
                        {tab === "all" && (
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
                            >
                                Browse restaurants
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(order => (
                            <OrderCard
                                key={order.publicOrderId}
                                order={order}
                                onCancel={handleCancel}
                                cancelling={cancelling}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
