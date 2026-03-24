"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
    ShoppingBag, DollarSign, Users, Calendar,
    ChevronDown, Clock, Store, Eye, CheckCircle,
    XCircle, AlertCircle, Loader2, TrendingUp, ShieldOff, Filter,
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { AdminVendorsAPI, AdminAnalyticsAPI, AdminUsersAPI } from '@/lib/api/admin.api';

/* ─── helpers ──────────────────────────────────────────────────────────── */
const fmt$ = (n) =>
    n != null ? `$${Number(n).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—';
const fmtN = (n) =>
    n != null ? Number(n).toLocaleString() : '—';
const is403 = (msg = '') =>
    /permission|access|forbidden|403/i.test(msg);

const DATE_OPTIONS = [
    { value: 'today',      label: 'Today' },
    { value: 'yesterday',  label: 'Yesterday' },
    { value: 'last7days',  label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth',  label: 'This Month' },
    { value: 'lastMonth',  label: 'Last Month' },
    { value: 'custom',     label: 'Custom Range' },
];

/** Convert a UI dateRange selection to { startDate, endDate } ISO strings for the API. */
const toISORange = (dateRange, customStart, customEnd) => {
    const pad = (d) => d.toISOString().slice(0, 10);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateRange) {
        case 'today':
            return { startDate: `${pad(today)}T00:00:00`, endDate: `${pad(today)}T23:59:59` };

        case 'yesterday': {
            const y = new Date(today);
            y.setDate(y.getDate() - 1);
            return { startDate: `${pad(y)}T00:00:00`, endDate: `${pad(y)}T23:59:59` };
        }
        case 'last7days': {
            const s = new Date(today);
            s.setDate(s.getDate() - 6);
            return { startDate: `${pad(s)}T00:00:00`, endDate: `${pad(today)}T23:59:59` };
        }
        case 'last30days': {
            const s = new Date(today);
            s.setDate(s.getDate() - 29);
            return { startDate: `${pad(s)}T00:00:00`, endDate: `${pad(today)}T23:59:59` };
        }
        case 'thisMonth': {
            const s = new Date(today.getFullYear(), today.getMonth(), 1);
            return { startDate: `${pad(s)}T00:00:00`, endDate: `${pad(today)}T23:59:59` };
        }
        case 'lastMonth': {
            const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const e = new Date(today.getFullYear(), today.getMonth(), 0);
            return { startDate: `${pad(s)}T00:00:00`, endDate: `${pad(e)}T23:59:59` };
        }
        case 'custom':
            if (customStart && customEnd) {
                return { startDate: `${customStart}T00:00:00`, endDate: `${customEnd}T23:59:59` };
            }
            return null;
        default:
            return null;
    }
};

const fmtDateRange = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* ─── custom tooltip ────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, isCurrency }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.name}: {isCurrency ? fmt$(p.value) : fmtN(p.value)}
                </p>
            ))}
        </div>
    );
};

/* ─── main component ────────────────────────────────────────────────────── */
const AdminDashboardContent = () => {
    const [dateRange, setDateRange]           = useState('last30days');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customStart, setCustomStart]       = useState('');
    const [customEnd, setCustomEnd]           = useState('');

    const [platform, setPlatform]             = useState(null);
    const [trendObj, setTrendObj]             = useState(null);  // raw trends object from backend
    const [userStats, setUserStats]           = useState(null);
    const [pendingVendors, setPendingVendors] = useState([]);

    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [loadingVendors, setLoadingVendors]      = useState(true);
    const [analyticsError, setAnalyticsError]      = useState(null);
    const [vendorError, setVendorError]            = useState(null);
    const [actionLoading, setActionLoading]        = useState({});

    /* ── fetch analytics ─────────────────────────────────────────────── */
    const fetchAnalytics = useCallback(async () => {
        // For custom range, don't fetch until both dates are set
        if (dateRange === 'custom' && (!customStart || !customEnd)) return;

        setLoadingAnalytics(true);
        setAnalyticsError(null);
        const dateParams = toISORange(dateRange, customStart, customEnd);
        try {
            const [platformRes, trendsRes, statsRes] = await Promise.all([
                AdminAnalyticsAPI.getPlatform(dateParams),
                AdminAnalyticsAPI.getTrends(dateParams),
                AdminUsersAPI.getStats(),
            ]);
            setPlatform(platformRes?.data ?? platformRes ?? null);
            // Trends response is always an object (never an array)
            const raw = trendsRes?.data ?? trendsRes ?? {};
            setTrendObj(typeof raw === 'object' && !Array.isArray(raw) ? raw : {});
            setUserStats(statsRes?.data ?? statsRes ?? null);
        } catch (e) {
            setAnalyticsError(e.message || 'Failed to load analytics');
        } finally {
            setLoadingAnalytics(false);
        }
    }, [dateRange, customStart, customEnd]);

    /* ── fetch pending vendors separately (403 here doesn't kill the page) */
    const fetchVendors = useCallback(async () => {
        setLoadingVendors(true);
        setVendorError(null);
        try {
            const res = await AdminVendorsAPI.getPending();
            const data = res?.data ?? res ?? [];
            setPendingVendors(Array.isArray(data) ? data : []);
        } catch (e) {
            setVendorError(e.message || 'Failed to load vendors');
        } finally {
            setLoadingVendors(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    /* ── derived state ───────────────────────────────────────────────── */
    const isFiltered = !!(platform?.filterStartDate);

    // Date picker label
    const dateLabel = (() => {
        if (dateRange === 'custom' && customStart && customEnd) return `${customStart} – ${customEnd}`;
        return DATE_OPTIONS.find(o => o.value === dateRange)?.label ?? 'Last 30 Days';
    })();

    // Revenue comparison bars (always 2 standard + optional "Selected" bucket)
    const revenueData = trendObj ? [
        { label: 'Last 7d',  revenue: trendObj.revenueLast7Days  ?? 0 },
        { label: 'Last 30d', revenue: trendObj.revenueLast30Days ?? 0 },
        ...(trendObj.revenueInDateRange != null
            ? [{ label: 'Selected', revenue: trendObj.revenueInDateRange }]
            : []),
    ] : [];

    // Orders comparison bars
    const ordersData = trendObj ? [
        { label: 'Last 7d',  orders: trendObj.ordersLast7Days  ?? 0 },
        { label: 'Last 30d', orders: trendObj.ordersLast30Days ?? 0 },
        ...(trendObj.ordersInDateRange != null
            ? [{ label: 'Selected', orders: trendObj.ordersInDateRange }]
            : []),
    ] : [];

    // Stat cards — Revenue & Orders show filtered values when date range applied
    const stats = [
        {
            name:     'Total Users',
            value:    loadingAnalytics ? null : fmtN(userStats?.totalUsers),
            icon:     Users,
            allTime:  true,
        },
        {
            name:     'Active Vendors',
            value:    loadingAnalytics ? null : fmtN(platform?.activeVendors ?? userStats?.totalVendors),
            icon:     Store,
            allTime:  true,
        },
        {
            name:     isFiltered ? 'Revenue (filtered)' : 'Platform Revenue',
            value:    loadingAnalytics ? null : fmt$(platform?.totalRevenue),
            icon:     DollarSign,
            allTime:  !isFiltered,
        },
        {
            name:     isFiltered ? 'Orders (filtered)' : 'Total Orders',
            value:    loadingAnalytics ? null : fmtN(platform?.totalOrders),
            icon:     ShoppingBag,
            allTime:  !isFiltered,
        },
    ];

    /* ── vendor actions ──────────────────────────────────────────────── */
    const handleVendorAction = async (vendor, action) => {
        const key = `${vendor.publicVendorId}-${action}`;
        setActionLoading(p => ({ ...p, [key]: true }));
        try {
            if (action === 'verify') await AdminVendorsAPI.verify(vendor.publicVendorId);
            if (action === 'reject') await AdminVendorsAPI.deactivate(vendor.publicVendorId);
            setPendingVendors(p => p.filter(v => v.publicVendorId !== vendor.publicVendorId));
        } catch (e) {
            alert(e.message || `Failed: ${action}`);
        } finally {
            setActionLoading(p => ({ ...p, [key]: false }));
        }
    };

    const getInitials = (name) =>
        (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="space-y-6">

            {/* ── Header + date filter ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Here&apos;s your platform overview.</p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowDatePicker(v => !v)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 rounded-xl hover:border-gray-300 transition-all font-medium text-gray-700 min-w-48 justify-between ${
                            isFiltered ? 'border-gray-400' : 'border-gray-200'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {isFiltered
                                ? <Filter className="w-4 h-4 text-gray-600" />
                                : <Calendar className="w-4 h-4 text-gray-400" />
                            }
                            <span className="text-sm">{dateLabel}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {showDatePicker && (
                        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                            <div className="p-2">
                                {DATE_OPTIONS.map(o => (
                                    <button
                                        key={o.value}
                                        onClick={() => {
                                            setDateRange(o.value);
                                            if (o.value !== 'custom') setShowDatePicker(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            dateRange === o.value
                                                ? 'bg-gray-100 text-gray-900 font-semibold'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >{o.label}</button>
                                ))}
                            </div>

                            {dateRange === 'custom' && (
                                <div className="p-4 border-t border-gray-200 space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={customStart}
                                            onChange={e => setCustomStart(e.target.value)}
                                            style={{ color: 'black', backgroundColor: 'white' }}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={customEnd}
                                            onChange={e => setCustomEnd(e.target.value)}
                                            style={{ color: 'black', backgroundColor: 'white' }}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                        />
                                    </div>
                                    <button
                                        onClick={() => { if (customStart && customEnd) setShowDatePicker(false); }}
                                        disabled={!customStart || !customEnd}
                                        className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        Apply Range
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Active filter badge ───────────────────────────────────── */}
            {isFiltered && platform?.filterStartDate && (
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 w-fit">
                    <Filter className="w-3.5 h-3.5 text-gray-500" />
                    <span>
                        Showing data for&nbsp;
                        <span className="font-semibold text-gray-900">
                            {fmtDateRange(platform.filterStartDate)} – {fmtDateRange(platform.filterEndDate)}
                        </span>
                    </span>
                </div>
            )}

            {/* ── Stat cards ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.name} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-gray-700" />
                                </div>
                                {s.allTime && (
                                    <span className="text-xs text-gray-400 font-medium">all-time</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{s.name}</p>
                            {s.value === null ? (
                                <div className="h-9 w-24 bg-gray-100 animate-pulse rounded-lg" />
                            ) : (
                                <p className="text-3xl font-black text-gray-900">{s.value}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Analytics error ──────────────────────────────────────── */}
            {analyticsError && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
                    is403(analyticsError)
                        ? 'bg-gray-50 border-gray-200 text-gray-600'
                        : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {is403(analyticsError)
                        ? <ShieldOff className="w-4 h-4 mt-0.5 shrink-0" />
                        : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    }
                    <div>
                        <p className="font-semibold mb-0.5">
                            {is403(analyticsError) ? 'Analytics permission denied' : 'Analytics unavailable'}
                        </p>
                        <p>
                            {is403(analyticsError)
                                ? "Update @PreAuthorize to hasAnyRole('ADMIN', 'SUPERADMIN') on the analytics controller."
                                : analyticsError}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Charts ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Platform Revenue */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-bold text-gray-900">Platform Revenue</h2>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-5">7-day vs 30-day comparison{trendObj?.revenueInDateRange != null ? ' + selected range' : ''}</p>

                    {loadingAnalytics ? (
                        <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
                    ) : revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={192}>
                            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#111827" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis
                                    tickFormatter={n => `$${n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n}`}
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false} tickLine={false} width={52}
                                />
                                <Tooltip content={<ChartTooltip isCurrency />} />
                                <Area
                                    type="monotone" dataKey="revenue" name="Revenue"
                                    stroke="#111827" strokeWidth={2}
                                    fill="url(#revenueGrad)" dot={{ r: 4, fill: '#111827', strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-sm text-gray-400">No trend data available</p>
                        </div>
                    )}
                </div>

                {/* Orders Trend */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-bold text-gray-900">Orders Trend</h2>
                        <ShoppingBag className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-5">7-day vs 30-day comparison{trendObj?.ordersInDateRange != null ? ' + selected range' : ''}</p>

                    {loadingAnalytics ? (
                        <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
                    ) : ordersData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={192}>
                            <BarChart data={ordersData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={36} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="orders" name="Orders" fill="#111827" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-sm text-gray-400">No trend data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Pending vendor approvals ──────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Pending Vendor Approvals</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {loadingVendors
                                ? 'Loading…'
                                : vendorError
                                    ? 'Unable to load'
                                    : `${pendingVendors.length} vendor${pendingVendors.length !== 1 ? 's' : ''} awaiting verification`}
                        </p>
                    </div>
                    <a href="/admin/vendors" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        View All
                    </a>
                </div>

                <div className="p-4 space-y-4">
                    {loadingVendors ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                    ) : vendorError ? (
                        <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm m-2 ${
                            is403(vendorError)
                                ? 'bg-gray-50 border-gray-200 text-gray-600'
                                : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                            <ShieldOff className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold mb-0.5">
                                    {is403(vendorError) ? 'Permission denied' : 'Failed to load pending vendors'}
                                </p>
                                <p className="text-xs">
                                    {is403(vendorError)
                                        ? "Update AdminVendorManagementController: @PreAuthorize(\"hasAnyRole('ADMIN', 'SUPERADMIN')\")"
                                        : vendorError}
                                </p>
                                <button onClick={fetchVendors} className="mt-2 text-xs font-semibold underline">
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : pendingVendors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <CheckCircle className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-semibold">All caught up</p>
                            <p className="text-sm text-gray-400 mt-1">No vendors pending approval</p>
                        </div>
                    ) : (
                        pendingVendors.map(vendor => {
                            const verifyKey   = `${vendor.publicVendorId}-verify`;
                            const rejectKey   = `${vendor.publicVendorId}-reject`;
                            const isVerifying = actionLoading[verifyKey];
                            const isRejecting = actionLoading[rejectKey];
                            const anyLoading  = isVerifying || isRejecting;
                            return (
                                <div key={vendor.publicVendorId} className="p-4 sm:p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                {getInitials(vendor.restaurantName)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{vendor.restaurantName || 'Unnamed Vendor'}</p>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Applied {vendor.createdAt
                                                        ? new Date(vendor.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
                                                        : '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 shrink-0">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Pending
                                        </span>
                                    </div>

                                    {vendor.cuisineType && (
                                        <div className="bg-gray-50 rounded-xl px-3 py-2 mb-4 flex items-center justify-between text-xs">
                                            <span className="text-gray-500">Cuisine</span>
                                            <span className="font-semibold text-gray-900">{vendor.cuisineType}</span>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleVendorAction(vendor, 'verify')}
                                            disabled={anyLoading}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                        >
                                            {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            Approve
                                        </button>
                                        <a
                                            href={`/admin/vendors`}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Review
                                        </a>
                                        <button
                                            onClick={() => handleVendorAction(vendor, 'reject')}
                                            disabled={anyLoading}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
                                        >
                                            {isRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardContent;
