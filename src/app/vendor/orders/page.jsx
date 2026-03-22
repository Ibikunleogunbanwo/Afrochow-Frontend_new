"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VendorOrdersAPI } from '@/lib/api/vendor/orders.api';
import { toast } from 'sonner';
import {
    Clock, Package, CheckCircle, XCircle, Truck, Search,
    Filter, ChevronDown, Eye, DollarSign, User, MapPin,
    Calendar, Loader2, Store, RefreshCw,
} from 'lucide-react';

// ── Status config ─────────────────────────────────────────────────────────────
const ORDER_STATUSES = {
    PENDING:          { label: 'Awaiting confirmation', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
    CONFIRMED:        { label: 'Confirmed',             color: 'bg-blue-500',   textColor: 'text-blue-700',   bgColor: 'bg-blue-50'   },
    PREPARING:        { label: 'Preparing',             color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
    READY_FOR_PICKUP: { label: 'Ready',                 color: 'bg-green-500',  textColor: 'text-green-700',  bgColor: 'bg-green-50'  },
    OUT_FOR_DELIVERY: { label: 'Out for delivery',      color: 'bg-indigo-500', textColor: 'text-indigo-700', bgColor: 'bg-indigo-50' },
    DELIVERED:        { label: 'Delivered',             color: 'bg-gray-500',   textColor: 'text-gray-700',   bgColor: 'bg-gray-50'   },
    CANCELLED:        { label: 'Cancelled',             color: 'bg-red-500',    textColor: 'text-red-700',    bgColor: 'bg-red-50'    },
};

const ACTIVE_STATUSES = new Set(['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY']);

// ── Status flow helpers ───────────────────────────────────────────────────────

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];

// API action for each direct step transition
const STEP_ACTION = {
    'PENDING→CONFIRMED':                'accept',
    'CONFIRMED→PREPARING':              'preparing',
    'PREPARING→READY_FOR_PICKUP':       'ready',
    'READY_FOR_PICKUP→OUT_FOR_DELIVERY':'out-for-delivery',
    'READY_FOR_PICKUP→DELIVERED':       'delivered', // pickup shortcut
    'OUT_FOR_DELIVERY→DELIVERED':       'delivered',
    'PENDING→CANCELLED':                'reject',
};

const API_ACTION_MAP = {
    'accept':           (id) => VendorOrdersAPI.acceptOrder(id),
    'reject':           (id) => VendorOrdersAPI.rejectOrder(id),
    'preparing':        (id) => VendorOrdersAPI.startPreparingOrder(id),
    'ready':            (id) => VendorOrdersAPI.markOrderReady(id),
    'out-for-delivery': (id) => VendorOrdersAPI.markOrderOutForDelivery(id),
    'delivered':        (id) => VendorOrdersAPI.markOrderDelivered(id),
};

// Returns the chain of API actions needed to move from current status to target,
// handling pickup orders which skip OUT_FOR_DELIVERY
const buildActionChain = (fromStatus, toStatus, fulfillmentType) => {
    if (toStatus === 'CANCELLED') return fromStatus === 'PENDING' ? ['reject'] : [];

    const isPickup = fulfillmentType === 'PICKUP';
    const fromIdx  = STATUS_FLOW.indexOf(fromStatus);
    const toIdx    = STATUS_FLOW.indexOf(toStatus);
    if (fromIdx === -1 || toIdx === -1 || toIdx <= fromIdx) return [];

    const chain = [];
    let cur = fromIdx;

    while (cur < toIdx) {
        const currentStatus = STATUS_FLOW[cur];
        const nextStatus    = STATUS_FLOW[cur + 1];

        // Pickup: skip OUT_FOR_DELIVERY — jump directly to DELIVERED
        if (isPickup && currentStatus === 'READY_FOR_PICKUP') {
            chain.push('delivered');
            break;
        }

        // Skip OUT_FOR_DELIVERY node in the loop for pickup orders heading past it
        if (isPickup && nextStatus === 'OUT_FOR_DELIVERY') {
            cur++;
            continue;
        }

        const key    = `${currentStatus}→${nextStatus}`;
        const action = STEP_ACTION[key];
        if (action) chain.push(action);
        cur++;
    }

    return chain;
};

// What the dropdown shows for a given order status / fulfillment type
const getStatusOptions = (status, fulfillmentType) => {
    const isPickup = fulfillmentType === 'PICKUP';
    const fromIdx  = STATUS_FLOW.indexOf(status);
    if (fromIdx === -1 || status === 'DELIVERED' || status === 'CANCELLED') return [];

    const options = [];

    for (let i = fromIdx + 1; i < STATUS_FLOW.length; i++) {
        const target = STATUS_FLOW[i];
        // Pickup never shows OUT_FOR_DELIVERY
        if (isPickup && target === 'OUT_FOR_DELIVERY') continue;
        options.push({ status: target, label: ORDER_STATUSES[target]?.label ?? target });
    }

    // Cancel only available from PENDING
    if (status === 'PENDING') {
        options.push({ status: 'CANCELLED', label: 'Cancel order', danger: true });
    }

    return options;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleString('en-CA', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};
const formatCurrency = (v) =>
    `$${parseFloat(v || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatAddress = (addr) => {
    if (!addr) return null;
    if (typeof addr === 'string') return addr;
    return addr.formattedAddress ||
        [addr.addressLine, addr.city, addr.province, addr.postalCode].filter(Boolean).join(', ');
};

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status, statusLabel }) {
    const cfg = ORDER_STATUSES[status] || { label: status, color: 'bg-gray-500' };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cfg.color} text-white`}>
            {statusLabel || cfg.label}
        </span>
    );
}

function FulfillmentBadge({ type }) {
    if (!type) return null;
    const isDelivery = type === 'DELIVERY';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
            ${isDelivery ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
            {isDelivery ? <Truck className="h-3 w-3" /> : <Store className="h-3 w-3" />}
            {isDelivery ? 'Delivery' : 'Pickup'}
        </span>
    );
}

// Dropdown to change order status — shows all reachable statuses, chains API calls for skips
function StatusDropdown({ order, onStatusChange, loading }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const options = getStatusOptions(order.status, order.fulfillmentType);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (options.length === 0) return null;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
            >
                {loading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <><span>Update status</span><ChevronDown className="h-4 w-4" /></>
                }
            </button>

            {open && (
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                    {options.map((opt) => (
                        <button
                            key={opt.status}
                            onClick={() => { setOpen(false); onStatusChange(order.publicOrderId, opt.status, order.fulfillmentType); }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors
                                ${opt.danger
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const VendorOrdersPage = () => {
    const [orders, setOrders]               = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [searchQuery, setSearchQuery]     = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await VendorOrdersAPI.getVendorOrders();
            if (res?.success) setOrders(res.data || []);
        } catch (err) {
            if (!silent) toast.error('Failed to load orders', { description: err.message });
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // Poll every 30s
    useEffect(() => {
        const id = setInterval(() => fetchOrders(true), 30_000);
        return () => clearInterval(id);
    }, [fetchOrders]);

    // ── Filter ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        let f = [...orders];
        if (selectedStatus !== 'ALL') f = f.filter(o => o.status === selectedStatus);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            f = f.filter(o =>
                o.publicOrderId?.toLowerCase().includes(q) ||
                o.customerName?.toLowerCase().includes(q)
            );
        }
        setFilteredOrders(f);
    }, [orders, selectedStatus, searchQuery]);

    // ── Status change (supports skipping via chained API calls) ───────────────
    const handleStatusChange = async (publicOrderId, targetStatus, fulfillmentType) => {
        const order = orders.find(o => o.publicOrderId === publicOrderId);
        if (!order) return;

        const chain = buildActionChain(order.status, targetStatus, fulfillmentType);
        if (chain.length === 0) {
            toast.error('Invalid status transition');
            return;
        }

        setActionLoading(publicOrderId);
        try {
            let lastRes;
            for (const action of chain) {
                lastRes = await API_ACTION_MAP[action](publicOrderId);
                if (!lastRes?.success) throw new Error(`Failed at step: ${action}`);
            }

            const updated = lastRes.data;
            setOrders(prev => prev.map(o => o.publicOrderId === publicOrderId ? { ...o, ...updated } : o));
            if (selectedOrder?.publicOrderId === publicOrderId) setSelectedOrder(prev => ({ ...prev, ...updated }));

            const targetLabel = ORDER_STATUSES[targetStatus]?.label ?? targetStatus;
            toast.success(`Order updated — ${targetLabel}`);
        } catch (err) {
            toast.error('Could not update order', { description: err.message });
        } finally {
            setActionLoading(null);
        }
    };

    // ── View detail ────────────────────────────────────────────────────────────
    const viewOrderDetails = async (publicOrderId) => {
        try {
            const res = await VendorOrdersAPI.getVendorOrderById(publicOrderId);
            if (res?.success) { setSelectedOrder(res.data); setShowDetailModal(true); }
        } catch (err) {
            toast.error('Could not load order details', { description: err.message });
        }
    };

    const activeCount = orders.filter(o => ACTIVE_STATUSES.has(o.status)).length;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Orders</h1>
                        <p className="text-gray-500 text-sm">
                            {activeCount > 0
                                ? `${activeCount} active order${activeCount > 1 ? 's' : ''} · auto-refreshes every 30s`
                                : 'Manage and track all your restaurant orders'}
                        </p>
                    </div>
                    <button
                        onClick={() => fetchOrders()}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by order ID or customer name…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                                style={{ color: 'black', backgroundColor: 'white' }}
                            >
                                <option value="ALL">All orders</option>
                                <option value="PENDING">Awaiting confirmation</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PREPARING">Preparing</option>
                                <option value="READY_FOR_PICKUP">Ready</option>
                                <option value="OUT_FOR_DELIVERY">Out for delivery</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Orders list */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <Loader2 className="h-10 w-10 text-orange-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading orders…</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <Package className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders found</h3>
                        <p className="text-gray-500 text-sm">
                            {searchQuery || selectedStatus !== 'ALL'
                                ? 'Try adjusting your filters'
                                : 'New orders will appear here automatically'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredOrders.map((order) => {
                            const isActioning = actionLoading === order.publicOrderId;
                            return (
                                <div key={order.publicOrderId}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="p-5">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            {/* Order info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <h3 className="text-base font-semibold text-gray-900">
                                                        #{order.publicOrderId?.slice(-10)}
                                                    </h3>
                                                    <StatusBadge status={order.status} statusLabel={order.statusLabel} />
                                                    <FulfillmentBadge type={order.fulfillmentType} />
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                    {order.customerName && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3.5 w-3.5" />
                                                            {order.customerName}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-3.5 w-3.5" />
                                                        <span className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {formatDate(order.orderTime)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => viewOrderDetails(order.publicOrderId)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </button>
                                                <StatusDropdown
                                                    order={order}
                                                    onStatusChange={handleStatusChange}
                                                    loading={isActioning}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Order detail modal ──────────────────────────────────────────── */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

                        {/* Modal header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-gray-900">Order details</h2>
                                <StatusBadge status={selectedOrder.status} statusLabel={selectedOrder.statusLabel} />
                                <FulfillmentBadge type={selectedOrder.fulfillmentType} />
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* ID & time */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 font-mono">{selectedOrder.publicOrderId}</span>
                                <span className="text-gray-500">{formatDate(selectedOrder.orderTime)}</span>
                            </div>

                            {/* Customer */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="h-4 w-4" /> Customer
                                </h3>
                                {selectedOrder.customerName && (
                                    <p className="text-gray-700">{selectedOrder.customerName}</p>
                                )}
                                {selectedOrder.deliveryAddress && (
                                    <p className="flex items-start gap-2 text-gray-600">
                                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                        {formatAddress(selectedOrder.deliveryAddress)}
                                    </p>
                                )}
                                {selectedOrder.specialInstructions && (
                                    <p className="text-gray-600 italic">Note: {selectedOrder.specialInstructions}</p>
                                )}
                            </div>

                            {/* Items */}
                            <div>
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                    <Package className="h-4 w-4" /> Items
                                </h3>
                                <div className="space-y-2">
                                    {(selectedOrder.orderLines || []).map((line, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{line.productNameAtPurchase}</p>
                                                <p className="text-gray-500">Qty {line.quantity}</p>
                                                {line.specialInstructions && (
                                                    <p className="text-gray-400 text-xs italic">{line.specialInstructions}</p>
                                                )}
                                            </div>
                                            <p className="font-semibold text-gray-900">{formatCurrency(line.lineTotal)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                                </div>
                                {selectedOrder.deliveryFee > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Truck className="h-3.5 w-3.5" /> Delivery fee
                                        </span>
                                        <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                                    </div>
                                )}
                                {selectedOrder.tax > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>{selectedOrder.taxLabel || 'Tax'}</span>
                                        <span>{formatCurrency(selectedOrder.tax)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                                </div>
                            </div>

                            {/* Status dropdown in modal */}
                            {getStatusOptions(selectedOrder.status, selectedOrder.fulfillmentType).length > 0 && (
                                <div className="pt-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Move order to
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {getStatusOptions(selectedOrder.status, selectedOrder.fulfillmentType).map((opt) => (
                                            <button
                                                key={opt.status}
                                                onClick={() => handleStatusChange(selectedOrder.publicOrderId, opt.status, selectedOrder.fulfillmentType)}
                                                disabled={actionLoading === selectedOrder.publicOrderId}
                                                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60
                                                    ${opt.danger
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                        : 'bg-orange-600 text-white hover:bg-orange-700'
                                                    }`}
                                            >
                                                {actionLoading === selectedOrder.publicOrderId
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : opt.label
                                                }
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorOrdersPage;
