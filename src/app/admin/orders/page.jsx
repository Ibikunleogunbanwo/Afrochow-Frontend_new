'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ShoppingBag, LayoutDashboard, ChevronRight, Search, RefreshCw,
    Clock, CheckCircle, XCircle, Truck, Package, Eye, X,
    User, MapPin, DollarSign, CreditCard, Calendar, Store,
    Receipt, AlertCircle, Loader2, Tag,
} from 'lucide-react';
import { AdminOrdersAPI } from '@/lib/api/admin.api';
import AdminPageError from '@/components/admin/AdminPageError';

/* ─── status config ─────────────────────────────────────────────────────── */
// Values must match the backend OrderStatus enum exactly (8 values):
// PENDING | CONFIRMED | PREPARING | READY_FOR_PICKUP | OUT_FOR_DELIVERY | DELIVERED | CANCELLED | REFUNDED
//
// READY_FOR_PICKUP covers both delivery and pickup. The response's `statusLabel`
// field disambiguates: delivery → "Ready for Delivery", pickup → "Available for Pickup".
// The `label` here is only the fallback when statusLabel is absent.
//
// Terminal statuses (isActive: false, canBeCancelled: false): DELIVERED, CANCELLED, REFUNDED
const STATUS_META = {
    PENDING:          { label: 'Pending',          cls: 'bg-yellow-100 text-yellow-700 border-yellow-200',  Icon: Clock },
    CONFIRMED:        { label: 'Confirmed',         cls: 'bg-blue-100   text-blue-700   border-blue-200',    Icon: CheckCircle },
    PREPARING:        { label: 'Preparing',         cls: 'bg-orange-100 text-orange-700 border-orange-200',  Icon: Package },
    READY_FOR_PICKUP: { label: 'Ready',             cls: 'bg-purple-100 text-purple-700 border-purple-200',  Icon: Package },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery',  cls: 'bg-indigo-100 text-indigo-700 border-indigo-200',  Icon: Truck },
    DELIVERED:        { label: 'Delivered',         cls: 'bg-green-100  text-green-700  border-green-200',   Icon: CheckCircle },
    CANCELLED:        { label: 'Cancelled',         cls: 'bg-red-100    text-red-700    border-red-200',     Icon: XCircle },
    REFUNDED:         { label: 'Refunded',          cls: 'bg-gray-100   text-gray-600   border-gray-200',    Icon: Receipt },
};

const TERMINAL_STATUSES = new Set(['DELIVERED', 'CANCELLED', 'REFUNDED']);

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

const StatusBadge = ({ status, statusLabel }) => {
    const meta = STATUS_META[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600 border-gray-200', Icon: Clock };
    const { Icon } = meta;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.cls}`}>
            <Icon className="w-3 h-3" />
            {statusLabel || meta.label}
        </span>
    );
};

/* ─── helpers ───────────────────────────────────────────────────────────── */
const fmt$ = (n) =>
    n != null ? `$${Number(n).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

const fmtDate = (d, opts) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-CA', opts ?? {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const fmtAddress = (addr) => {
    if (!addr) return null;
    if (typeof addr === 'string') return addr;
    return [addr.street, addr.city, addr.province, addr.postalCode, addr.country]
        .filter(Boolean).join(', ');
};

/* ─── Timeline row ──────────────────────────────────────────────────────── */
const TimelineRow = ({ label, ts }) => {
    if (!ts) return null;
    return (
        <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-700">{fmtDate(ts)}</span>
        </div>
    );
};

/* ─── Detail modal ──────────────────────────────────────────────────────── */
const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    const address = fmtAddress(order.deliveryAddress);
    const lines   = order.orderLines ?? [];
    const pay     = order.payment;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-gray-900">Order Details</h2>
                        <StatusBadge status={order.status} statusLabel={order.statusLabel} />
                        {order.fulfillmentType && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                {order.fulfillmentType === 'DELIVERY' ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                                {order.fulfillmentType}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">

                    {/* Order ID + time */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-mono font-medium text-gray-700">{order.publicOrderId}</span>
                        <span>{fmtDate(order.orderTime ?? order.createdAt)}</span>
                    </div>

                    {/* Customer + delivery */}
                    <section className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                            <User className="w-3.5 h-3.5" /> Customer
                        </h3>
                        <p className="text-sm font-semibold text-gray-900">
                            {order.customerName || 'Unknown customer'}
                        </p>
                        {order.customerPublicId && (
                            <p className="text-xs text-gray-400 font-mono">{order.customerPublicId}</p>
                        )}
                        {address && (
                            <p className="text-xs text-gray-600 flex items-start gap-1.5 mt-1">
                                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                                {address}
                            </p>
                        )}
                        {order.specialInstructions && (
                            <p className="text-xs text-gray-500 italic border-t border-gray-200 pt-2 mt-2">
                                Note: {order.specialInstructions}
                            </p>
                        )}
                    </section>

                    {/* Vendor */}
                    <section className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                            <Store className="w-3.5 h-3.5" /> Vendor
                        </h3>
                        <p className="text-sm font-semibold text-gray-900">{order.restaurantName || order.vendorName || '—'}</p>
                        {order.vendorPublicId && (
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{order.vendorPublicId}</p>
                        )}
                    </section>

                    {/* Order items */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                            <Package className="w-3.5 h-3.5" /> Items ({lines.length})
                        </h3>
                        {lines.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No item details available</p>
                        ) : (
                            <div className="space-y-2">
                                {lines.map((line, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {line.productName ?? line.productNameAtPurchase ?? `Item ${i + 1}`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Qty {line.quantity} × {fmt$(line.unitPrice ?? (line.totalPrice / line.quantity))}
                                            </p>
                                            {line.specialInstructions && (
                                                <p className="text-xs text-gray-400 italic">{line.specialInstructions}</p>
                                            )}
                                        </div>
                                        <p className="font-semibold text-gray-900 shrink-0 ml-3">
                                            {fmt$(line.totalPrice ?? line.lineTotal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Totals */}
                    <section className="border-t border-gray-100 pt-4">
                        <div className="space-y-1.5 text-sm">
                            {order.subtotal != null && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span><span>{fmt$(order.subtotal)}</span>
                                </div>
                            )}
                            {order.deliveryFee > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Delivery fee</span>
                                    <span>{fmt$(order.deliveryFee)}</span>
                                </div>
                            )}
                            {order.tax > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span><span>{fmt$(order.tax)}</span>
                                </div>
                            )}
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="flex items-center gap-1">
                                        <Tag className="w-3.5 h-3.5" />
                                        Discount{order.appliedPromoCode ? ` (${order.appliedPromoCode})` : ''}
                                    </span>
                                    <span>−{fmt$(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base">
                                <span>Total</span><span>{fmt$(order.totalAmount)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Payment */}
                    {pay && (
                        <section className="bg-gray-50 rounded-xl p-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                <CreditCard className="w-3.5 h-3.5" /> Payment
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <p className="text-gray-400">Status</p>
                                    <p className={`font-semibold mt-0.5 ${pay.status === 'SUCCESS' ? 'text-green-600' : pay.status === 'FAILED' ? 'text-red-600' : 'text-gray-700'}`}>
                                        {pay.status}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Method</p>
                                    <p className="font-semibold text-gray-700 mt-0.5">{pay.paymentMethod ?? '—'}</p>
                                </div>
                                {pay.transactionReference && (
                                    <div className="col-span-2">
                                        <p className="text-gray-400">Reference</p>
                                        <p className="font-mono font-medium text-gray-700 mt-0.5 break-all">{pay.transactionReference}</p>
                                    </div>
                                )}
                                {pay.paidAt && (
                                    <div className="col-span-2">
                                        <p className="text-gray-400">Paid at</p>
                                        <p className="font-medium text-gray-700 mt-0.5">{fmtDate(pay.paidAt)}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Timeline */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <Calendar className="w-3.5 h-3.5" /> Timeline
                        </h3>
                        <div className="bg-gray-50 rounded-xl px-4 py-1">
                            <TimelineRow label="Order placed"        ts={order.orderTime} />
                            <TimelineRow label="Confirmed"           ts={order.confirmedAt} />
                            <TimelineRow label="Preparing"           ts={order.preparingAt} />
                            <TimelineRow label="Ready"               ts={order.readyAt} />
                            <TimelineRow label="Out for delivery"    ts={order.outForDeliveryAt} />
                            <TimelineRow label="Est. delivery"       ts={order.estimatedDeliveryTime} />
                            <TimelineRow label="Delivered"           ts={order.deliveredAt} />
                            <TimelineRow label="Cancelled"           ts={order.cancelledAt} />
                        </div>
                        {order.canBeCancelled && (
                            <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                This order can still be cancelled
                            </p>
                        )}
                    </section>

                </div>
            </div>
        </div>
    );
};

/* ─── main page ─────────────────────────────────────────────────────────── */
export default function AdminOrdersPage() {
    const [orders, setOrders]               = useState([]);
    const [statusFilter, setStatusFilter]   = useState('ALL');
    const [search, setSearch]               = useState('');
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalLoading, setModalLoading]   = useState(false);
    const [modalError, setModalError]       = useState(null);

    /* ── fetch list ── */
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (statusFilter === 'ALL')                 res = await AdminOrdersAPI.getAll();
            else if (statusFilter === 'ACTIVE')         res = await AdminOrdersAPI.getActive();
            else                                        res = await AdminOrdersAPI.getByStatus(statusFilter);
            const data = res?.data ?? res ?? [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    /* ── open detail modal ── */
    const openDetail = async (publicOrderId) => {
        setSelectedOrder(null);
        setModalError(null);
        setModalLoading(true);
        try {
            const res  = await AdminOrdersAPI.getById(publicOrderId);
            const data = res?.data ?? res;
            setSelectedOrder(data);
        } catch (e) {
            setModalError(e.message || 'Failed to load order details');
        } finally {
            setModalLoading(false);
        }
    };

    /* ── filter ── */
    const filtered = orders.filter(o => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            o.publicOrderId?.toLowerCase().includes(q) ||
            o.customerName?.toLowerCase().includes(q)  ||
            o.vendorName?.toLowerCase().includes(q)    ||
            o.restaurantName?.toLowerCase().includes(q)
        );
    });

    /* ── stat counts from current list ── */
    const statCounts = {
        total:     orders.length,
        active:    orders.filter(o => !TERMINAL_STATUSES.has(o.status)).length,
        delivered: orders.filter(o => o.status === 'DELIVERED').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Orders</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Order Management</h1>
                    <p className="text-gray-500 mt-1">View and monitor all platform orders</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total',     value: statCounts.total },
                    { label: 'Active',    value: statCounts.active },
                    { label: 'Delivered', value: statCounts.delivered },
                    { label: 'Cancelled', value: statCounts.cancelled },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-2xl font-black text-gray-900">{s.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer, vendor…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {STATUS_TABS.map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                                    statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {s === 'ALL' ? 'All' : (STATUS_META[s]?.label ?? s)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading modal overlay for single order fetch */}
                {modalLoading && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                        <div className="bg-white rounded-2xl p-6 flex items-center gap-3 shadow-xl">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Loading order details…</span>
                        </div>
                    </div>
                )}

                {/* Modal error toast */}
                {modalError && (
                    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl shadow-lg">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{modalError}</span>
                        <button onClick={() => setModalError(null)} className="ml-2 text-red-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading orders…</span>
                    </div>
                ) : error ? (
                    <AdminPageError error={error} onRetry={fetchOrders} />
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <ShoppingBag className="h-12 w-12 text-gray-200" />
                        <p className="text-sm text-gray-400">No orders found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map(o => {
                            const meta    = STATUS_META[o.status];
                            const customer = o.customerName || null;
                            const vendor   = o.restaurantName || o.vendorName || null;
                            const amount   = o.totalAmount ?? o.total;
                            const time     = o.orderTime ?? o.createdAt;

                            return (
                                <div
                                    key={o.publicOrderId}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                                    onClick={() => openDetail(o.publicOrderId)}
                                >
                                    {/* Left — IDs + meta */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <p className="text-sm font-bold text-gray-900 font-mono">{o.publicOrderId}</p>
                                            <StatusBadge status={o.status} statusLabel={o.statusLabel} />
                                            {o.fulfillmentType && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                                    {o.fulfillmentType === 'DELIVERY' ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                                                    {o.fulfillmentType}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                            {customer && (
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />{customer}
                                                </span>
                                            )}
                                            {vendor && (
                                                <span className="flex items-center gap-1">
                                                    <Store className="w-3 h-3" />{vendor}
                                                </span>
                                            )}
                                            {time && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />{fmtDate(time, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                            {o.itemCount != null && (
                                                <span className="flex items-center gap-1">
                                                    <Package className="w-3 h-3" />{o.itemCount} item{o.itemCount !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        {/* Item names preview */}
                                        {Array.isArray(o.itemNames) && o.itemNames.length > 0 && (
                                            <p className="text-xs text-gray-400 mt-1 truncate">
                                                {o.itemNames.slice(0, 3).join(', ')}{o.itemNames.length > 3 ? ` +${o.itemNames.length - 3} more` : ''}
                                            </p>
                                        )}
                                    </div>

                                    {/* Right — amount + view */}
                                    <div className="shrink-0 flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">
                                                {amount != null ? fmt$(amount) : '—'}
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 group-hover:bg-gray-200 rounded-lg transition-colors">
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {selectedOrder && (
                <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    );
}
