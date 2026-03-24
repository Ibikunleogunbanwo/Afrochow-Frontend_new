'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingBag, LayoutDashboard, ChevronRight, Search, RefreshCw, Clock, CheckCircle, XCircle, Truck, Package } from 'lucide-react';
import { AdminOrdersAPI } from '@/lib/api/admin.api';
import AdminPageError from '@/components/admin/AdminPageError';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED'];

const StatusBadge = ({ status }) => {
    const map = {
        PENDING:    'bg-yellow-100 text-yellow-700 border-yellow-200',
        CONFIRMED:  'bg-blue-100 text-blue-700 border-blue-200',
        PREPARING:  'bg-orange-100 text-orange-700 border-orange-200',
        READY:      'bg-purple-100 text-purple-700 border-purple-200',
        DELIVERING: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        DELIVERED:  'bg-green-100 text-green-700 border-green-200',
        CANCELLED:  'bg-red-100 text-red-700 border-red-200',
    };
    const icons = {
        PENDING:    Clock,
        CONFIRMED:  CheckCircle,
        PREPARING:  Package,
        READY:      Package,
        DELIVERING: Truck,
        DELIVERED:  CheckCircle,
        CANCELLED:  XCircle,
    };
    const Icon = icons[status] ?? Clock;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
    );
};

export default function AdminOrdersPage() {
    const [orders, setOrders]       = useState([]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [search, setSearch]       = useState('');
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (statusFilter === 'ALL')    res = await AdminOrdersAPI.getAll();
            else if (statusFilter === 'ACTIVE') res = await AdminOrdersAPI.getActive();
            else                           res = await AdminOrdersAPI.getByStatus(statusFilter);
            const data = res?.data ?? res ?? [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const filtered = orders.filter(o => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            o.publicOrderId?.toLowerCase().includes(q) ||
            o.customerName?.toLowerCase().includes(q) ||
            o.vendorName?.toLowerCase().includes(q)
        );
    });

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'N/A';

    const formatCurrency = (n) =>
        n != null ? `$${Number(n).toFixed(2)}` : 'N/A';

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
                <button onClick={fetchOrders} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total',     value: orders.length },
                    { label: 'Active',    value: orders.filter(o => !['DELIVERED','CANCELLED'].includes(o.status)).length },
                    { label: 'Delivered', value: orders.filter(o => o.status === 'DELIVERED').length },
                    { label: 'Cancelled', value: orders.filter(o => o.status === 'CANCELLED').length },
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
                        {STATUS_OPTIONS.map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                                    statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >{s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</button>
                        ))}
                    </div>
                </div>

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
                        {filtered.map(o => (
                            <div key={o.publicOrderId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-bold text-gray-900 font-mono">{o.publicOrderId}</p>
                                        <StatusBadge status={o.status} />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {o.customerName || 'Unknown customer'} · {o.vendorName || 'Unknown vendor'} · {formatDate(o.createdAt)}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-sm font-bold text-gray-900">{formatCurrency(o.totalAmount ?? o.total)}</p>
                                    {o.itemCount != null && (
                                        <p className="text-xs text-gray-400">{o.itemCount} item{o.itemCount !== 1 ? 's' : ''}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
