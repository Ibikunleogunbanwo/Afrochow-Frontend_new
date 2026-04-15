"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users, Star, Calendar, ChevronDown, Clock, MapPin, Package, Eye, MoreVertical, XCircle, Loader2, Truck, Store, User } from 'lucide-react';
import { VendorOrdersAPI } from '@/lib/api/vendor/orders.api';
import { VendorAnalyticsAPI } from '@/lib/api/vendor/analytics.api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';

// ── Date filtering helpers ────────────────────────────────────────────────────

const startOf = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0);          return x; };
const endOf   = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999);     return x; };

const getDateBounds = (range) => {
    const now = new Date();
    switch (range) {
        case 'today':      return { start: startOf(now), end: endOf(now) };
        case 'yesterday': {
            const y = new Date(now); y.setDate(y.getDate() - 1);
            return { start: startOf(y), end: endOf(y) };
        }
        case 'last7days': {
            const s = new Date(now); s.setDate(s.getDate() - 6);
            return { start: startOf(s), end: endOf(now) };
        }
        case 'last30days': {
            const s = new Date(now); s.setDate(s.getDate() - 29);
            return { start: startOf(s), end: endOf(now) };
        }
        case 'thisMonth':
            return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOf(now) };
        case 'lastMonth': {
            const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const e = new Date(now.getFullYear(), now.getMonth(), 0);
            return { start: s, end: endOf(e) };
        }
        default: return null;
    }
};

/** Client-side filter — uses orderTime (falls back to createdAt) on each order. */
const filterOrdersByDateRange = (orders, range, customStart, customEnd) => {
    if (range === 'custom') {
        if (!customStart || !customEnd) return orders;
        const s = new Date(customStart + 'T00:00:00');
        const e = new Date(customEnd   + 'T23:59:59');
        return orders.filter(o => {
            const d = new Date(o.orderTime ?? o.createdAt ?? 0);
            return d >= s && d <= e;
        });
    }
    const bounds = getDateBounds(range);
    if (!bounds) return orders;
    return orders.filter(o => {
        const d = new Date(o.orderTime ?? o.createdAt ?? 0);
        return d >= bounds.start && d <= bounds.end;
    });
};

// ── Component ─────────────────────────────────────────────────────────────────

const DashboardContent = () => {
    // Date filter state
    const [dateRange, setDateRange] = useState('today');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Orders state — full list from API; filtered client-side by dateRange
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showAllModal, setShowAllModal]       = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder]     = useState(null);
    const [detailLoading, setDetailLoading]     = useState(false);
    const [allModalPage, setAllModalPage]       = useState(1);
    const ALL_MODAL_PAGE_SIZE = 10;

    // Only holds values we can't derive from the order list (rating, chart trend data)
    const [stats, setStats] = useState({
        rating: null,
        todayRevenue: 0,
        last7DaysRevenue: 0,
        last30DaysRevenue: 0,
    });

    // Date range options
    const dateRangeOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last7days', label: 'Last 7 Days' },
        { value: 'last30days', label: 'Last 30 Days' },
        { value: 'thisMonth', label: 'This Month' },
        { value: 'lastMonth', label: 'Last Month' },
        { value: 'custom', label: 'Custom Range' },
    ];

    // Fetch all orders once on mount; filtering is done client-side.
    useEffect(() => { fetchOrders(); fetchStats(); }, []);

    // Reset pagination whenever the date filter changes.
    useEffect(() => { setAllModalPage(1); }, [dateRange]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Always fetch the full order list; date filtering is done client-side.
            const response = await VendorOrdersAPI.getVendorOrders();
            if (response?.success) {
                setAllOrders(response.data || []);
            }
        } catch (error) {
            // Error fetching orders
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const [revenueRes, analyticsRes] = await Promise.allSettled([
                VendorOrdersAPI.getOrdersRevenue(),
                VendorAnalyticsAPI.getVendorAnalytics(),
            ]);
            const revenue   = revenueRes.status   === 'fulfilled' ? revenueRes.value?.data   : null;
            const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value?.data : null;

            // Only store values we can't derive from the order list
            setStats(prev => ({
                ...prev,
                rating:            analytics?.averageRating    ?? prev.rating,
                todayRevenue:      analytics?.todayRevenue     ?? revenue?.todayRevenue     ?? prev.todayRevenue,
                last7DaysRevenue:  analytics?.last7DaysRevenue ?? revenue?.last7DaysRevenue ?? prev.last7DaysRevenue,
                last30DaysRevenue: analytics?.last30DaysRevenue ?? revenue?.last30DaysRevenue ?? prev.last30DaysRevenue,
            }));
        } catch (error) {
            // silently fail
        }
    };

    const viewOrderDetail = async (publicOrderId) => {
        setDetailLoading(true);
        setShowDetailModal(true);
        setSelectedOrder(null);
        try {
            const res = await VendorOrdersAPI.getVendorOrderById(publicOrderId);
            if (res?.success) setSelectedOrder(res.data);
        } catch (e) {
            setShowDetailModal(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const formatCurrency = (v) =>
        `CA$${parseFloat(v || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatAddress = (addr) => {
        if (!addr) return null;
        if (typeof addr === 'string') return addr;
        return addr.formattedAddress ||
            [addr.addressLine, addr.city, addr.province, addr.postalCode].filter(Boolean).join(', ');
    };

    // Compute % change: last 7 days vs the 7 days before that (derived from 30-day total)
    const computeTrend = (last7, last30) => {
        if (!last30 || last30 === 0) return null;
        const prev7 = (last30 - last7) * (7 / 23); // approx previous 7-day window
        if (!prev7 || prev7 === 0) return null;
        return (((last7 - prev7) / prev7) * 100).toFixed(1);
    };

    // ── Client-side filtered data ─────────────────────────────────────────────
    const filteredOrders = useMemo(
        () => filterOrdersByDateRange(allOrders, dateRange, customStartDate, customEndDate),
        [allOrders, dateRange, customStartDate, customEndDate]
    );

    // Dashboard "Recent Orders" card — newest 5 only; full list lives in the modal
    const RECENT_LIMIT = 5;
    const recentOrders = useMemo(
        () => [...filteredOrders]
            .sort((a, b) => new Date(b.orderTime ?? b.createdAt ?? 0) - new Date(a.orderTime ?? a.createdAt ?? 0))
            .slice(0, RECENT_LIMIT),
        [filteredOrders]
    );

    const filteredDelivered = filteredOrders.filter(o => o.status === 'DELIVERED');
    const filteredRevenue   = filteredDelivered.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
    const filteredAvg       = filteredDelivered.length > 0 ? filteredRevenue / filteredDelivered.length : 0;

    const revenueTrend    = computeTrend(stats.last7DaysRevenue, stats.last30DaysRevenue);

    const handleOrderAction = async (orderId, action) => {
        try {
            let response;
            switch (action) {
                case 'accept':
                    response = await VendorOrdersAPI.acceptOrder(orderId);
                    break;
                case 'reject':
                    response = await VendorOrdersAPI.rejectOrder(orderId);
                    break;
                case 'preparing':
                    response = await VendorOrdersAPI.startPreparingOrder(orderId);
                    break;
                case 'ready':
                    response = await VendorOrdersAPI.markOrderReady(orderId);
                    break;
                case 'out-for-delivery':
                    response = await VendorOrdersAPI.markOrderOutForDelivery(orderId);
                    break;
                case 'delivered':
                    response = await VendorOrdersAPI.markOrderDelivered(orderId);
                    break;
                default:
                    return;
            }

            if (response?.success) {
                await fetchOrders();
                await fetchStats();
            }
        } catch (error) {
            // Error performing order action
        }
    };

    // Get display text for selected date range
    const getDateRangeDisplay = () => {
        if (dateRange === 'custom' && customStartDate && customEndDate) {
            return `${customStartDate} - ${customEndDate}`;
        }
        return dateRangeOptions.find(opt => opt.value === dateRange)?.label || 'Today';
    };

    const statsDisplay = [
        {
            name: "Total Orders",
            value: filteredOrders.length.toString(),
            change: "—",
            trend: "neutral",
            icon: ShoppingBag,
            color: "gray"
        },
        {
            name: "Total Revenue",
            value: `CA$${filteredRevenue.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: revenueTrend !== null
                ? `${revenueTrend > 0 ? '+' : ''}${revenueTrend}% vs prev 7d`
                : "—",
            trend: revenueTrend !== null ? (revenueTrend >= 0 ? "up" : "down") : "neutral",
            icon: DollarSign,
            color: "green"
        },
        {
            name: "Avg Order Value",
            value: `CA$${filteredAvg.toFixed(2)}`,
            change: "—",
            trend: "neutral",
            icon: Users,
            color: "blue"
        },
        {
            name: "Rating",
            value: stats.rating !== null ? parseFloat(stats.rating).toFixed(1) : "—",
            change: "—",
            trend: "neutral",
            icon: Star,
            color: "yellow",
            // Rating is a global average from the reviews table — no date filter applied
            note: "All time · not date-filtered",
        },
    ];

    // Orders are now fetched from API and stored in state

    const handleDateRangeChange = (value) => {
        setDateRange(value);
        if (value !== 'custom') {
            setShowDatePicker(false);
        } else {
            setShowDatePicker(true);
        }
    };

    const applyCustomDateRange = () => {
        if (customStartDate && customEndDate) {
            setShowDatePicker(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                border: 'border-gray-300',
                label: 'New Order',
                pulse: true
            },
            CONFIRMED: {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                border: 'border-gray-200',
                label: 'Confirmed',
                pulse: false
            },
            PREPARING: {
                bg: 'bg-gray-200',
                text: 'text-gray-700',
                border: 'border-gray-300',
                label: 'Preparing',
                pulse: false
            },
            READY_FOR_PICKUP: {
                bg: 'bg-gray-300',
                text: 'text-gray-800',
                border: 'border-gray-400',
                label: 'Ready',
                pulse: false
            },
            OUT_FOR_DELIVERY: {
                bg: 'bg-gray-200',
                text: 'text-gray-700',
                border: 'border-gray-300',
                label: 'Out for Delivery',
                pulse: false
            },
            DELIVERED: {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                border: 'border-gray-200',
                label: 'Delivered',
                pulse: false
            },
            CANCELLED: {
                bg: 'bg-red-100',
                text: 'text-red-700',
                border: 'border-red-200',
                label: 'Cancelled',
                pulse: false
            },
        };
        return configs[status] ?? configs.PENDING;
    };

    // Generate avatar initials from order ID (e.g. "ORD-A1B2" → "A1")
    const getOrderInitials = (publicOrderId) => {
        if (!publicOrderId) return '?';
        const parts = publicOrderId.split('-');
        return (parts[parts.length - 1] ?? publicOrderId).slice(0, 2).toUpperCase();
    };

    return (
        <>
        <div className="space-y-6">

            {/* Page Header with Date Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here&#39;s what&#39;s happening.</p>
                </div>

                {/* Date Filter */}
                <div className="relative">
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-all font-medium text-gray-700 min-w-50 justify-between"
                    >
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="text-sm">{getDateRangeDisplay()}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* Dropdown */}
                    {showDatePicker && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                            <div className="p-2">
                                {dateRangeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleDateRangeChange(option.value)}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            dateRange === option.value
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {dateRange === 'custom' && (
                                <div className="p-4 border-t border-gray-200">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                style={{ color: 'black', backgroundColor: 'white' }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                style={{ color: 'black', backgroundColor: 'white' }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                                            />
                                        </div>
                                        <button
                                            onClick={applyCustomDateRange}
                                            disabled={!customStartDate || !customEndDate}
                                            className="w-full px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Apply Range
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statsDisplay.map((stat) => {
                    const Icon = stat.icon;
                    const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : null;
                    const trendColor = stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-400';

                    return (
                        <div key={stat.name} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-gray-600">{stat.name}</p>
                                <div className={`flex items-center space-x-1 text-sm font-semibold ${trendColor}`}>
                                    {TrendIcon && <TrendIcon className="w-4 h-4" />}
                                    <span>{stat.change}</span>
                                </div>
                            </div>
                            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                            {stat.note && (
                                <p className="text-[11px] text-gray-400 mt-1.5 italic">{stat.note}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Bar Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Across time periods</p>
                        </div>
                        <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                    {stats.last30DaysRevenue > 0 || stats.last7DaysRevenue > 0 || stats.todayRevenue > 0 ? (
                        <div style={{ width: '100%', height: 240 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { period: 'Today',      revenue: parseFloat((stats.todayRevenue     || 0).toFixed(2)) },
                                    { period: 'Last 7 Days', revenue: parseFloat((stats.last7DaysRevenue  || 0).toFixed(2)) },
                                    { period: 'Last 30 Days',revenue: parseFloat((stats.last30DaysRevenue || 0).toFixed(2)) },
                                ]}
                                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                <YAxis
                                    tickFormatter={(v) => v >= 1000 ? `CA$${(v / 1000).toFixed(1)}k` : `CA$${v}`}
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={55}
                                />
                                <Tooltip
                                    formatter={(value) => [`CA$${parseFloat(value).toLocaleString('en-CA', { minimumFractionDigits: 2 })}`, 'Revenue']}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#fff7ed' }}
                                />
                                <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={72} />
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-60 flex flex-col items-center justify-center text-gray-300">
                            <DollarSign className="w-10 h-10 mb-2" />
                            <p className="text-sm font-medium">No revenue data yet</p>
                        </div>
                    )}
                </div>

                {/* Orders Donut Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Order Breakdown</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Status distribution</p>
                        </div>
                        <ShoppingBag className="w-5 h-5 text-gray-400" />
                    </div>
                    {(() => {
                        const delivered  = filteredOrders.filter(o => o.status === 'DELIVERED').length;
                        const cancelled  = filteredOrders.filter(o => o.status === 'CANCELLED').length;
                        const active     = filteredOrders.filter(o => ['PENDING','CONFIRMED','PREPARING','READY_FOR_PICKUP','OUT_FOR_DELIVERY'].includes(o.status)).length;
                        const hasData    = delivered + cancelled + active > 0;
                        const pieData    = [
                            { name: 'Delivered', value: delivered, color: '#22c55e' },
                            { name: 'Active',    value: active,    color: '#f97316' },
                            { name: 'Cancelled', value: cancelled, color: '#ef4444' },
                        ].filter(d => d.value > 0);

                        return hasData ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [value, name]}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend
                                        formatter={(value, entry) => (
                                            <span style={{ color: '#374151', fontSize: '13px' }}>
                                                {value} ({entry.payload.value})
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-60 flex flex-col items-center justify-center text-gray-300">
                                <ShoppingBag className="w-10 h-10 mb-2" />
                                <p className="text-sm font-medium">No orders yet</p>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Recent Orders - Beautiful Cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Last {RECENT_LIMIT} orders
                                {filteredOrders.length > RECENT_LIMIT && ` — ${filteredOrders.length} total`}
                            </p>
                        </div>
                        <button
                            onClick={() => { setAllModalPage(1); setShowAllModal(true); }}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            View All
                        </button>
                    </div>
                </div>

                {/* Orders List */}
                <div className="p-4 space-y-4">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin h-8 w-8 border-4 border-gray-400 border-t-transparent rounded-full" />
                        </div>
                    )}
                    {!loading && filteredOrders.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p className="font-semibold">No orders yet</p>
                            <p className="text-sm mt-1">Orders will appear here once customers place them.</p>
                        </div>
                    )}
                    {!loading && recentOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        const orderTime = order.orderTime
                            ? new Date(order.orderTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                            : '—';

                        return (
                            <div
                                key={order.publicOrderId}
                                className="p-4 sm:p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all group"
                            >
                                {/* Order Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {getOrderInitials(order.publicOrderId)}
                                        </div>

                                        {/* Order Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                                                <h3 className="font-bold text-gray-900 truncate font-mono">
                                                    #{order.publicOrderId}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                                    <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{orderTime}</span>
                                                </div>
                                                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                                    <Package className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 text-gray-400 shrink-0" />
                                                    <span>{order.fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text} border-2 ${statusConfig.border} relative`}>
                                            {statusConfig.pulse && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-700"></span>
                        </span>
                                            )}
                                            {statusConfig.label}
                                        </div>

                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4">
                                    <div className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                        <Package className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                                        <span>
                                            {order.itemCount ?? 0} {(order.itemCount ?? 0) === 1 ? 'Item' : 'Items'}
                                        </span>
                                    </div>
                                    {order.itemNames?.length > 0 ? (
                                        <div className="space-y-1.5">
                                            {order.itemNames.map((name, idx) => (
                                                <div key={idx} className="text-xs sm:text-sm text-gray-700 truncate">
                                                    • {name}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Tap View to see order items</p>
                                    )}
                                </div>

                                {/* Order Footer */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    {/* Address */}
                                    <div className="flex items-center text-xs sm:text-sm text-gray-600 min-w-0">
                                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400 shrink-0" />
                                        <span className="truncate">
                                            {order.deliveryAddress?.formattedAddress
                                                || order.deliveryAddress?.addressLine
                                                || (order.fulfillmentType === 'PICKUP' ? 'Pickup' : '—')}
                                        </span>
                                    </div>

                                    {/* Price & Button */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                                        <div className="text-left sm:text-right">
                                            <div className="text-xl sm:text-2xl font-black text-gray-900">
                                                CA${parseFloat(order.totalAmount ?? 0).toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.estimatedDeliveryTime ?? ''}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => viewOrderDetail(order.publicOrderId)}
                                            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center space-x-2 whitespace-nowrap"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span className="text-sm">View</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>

        {/* ── View All Orders Modal ──────────────────────────────────────── */}
        {showAllModal && (() => {
            const totalPages  = Math.max(1, Math.ceil(filteredOrders.length / ALL_MODAL_PAGE_SIZE));
            const pageOrders  = filteredOrders.slice(
                (allModalPage - 1) * ALL_MODAL_PAGE_SIZE,
                allModalPage * ALL_MODAL_PAGE_SIZE
            );
            const start = filteredOrders.length === 0 ? 0 : (allModalPage - 1) * ALL_MODAL_PAGE_SIZE + 1;
            const end   = Math.min(allModalPage * ALL_MODAL_PAGE_SIZE, filteredOrders.length);

            return (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">All Orders</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {filteredOrders.length === 0
                                        ? 'No orders'
                                        : `Showing ${start}–${end} of ${filteredOrders.length}`}
                                </p>
                            </div>
                            <button onClick={() => setShowAllModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Order list */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-3">
                            {filteredOrders.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                    <p className="font-semibold">No orders yet</p>
                                </div>
                            ) : pageOrders.map((order) => {
                                const cfg = getStatusConfig(order.status);
                                return (
                                    <div key={order.publicOrderId}
                                        className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {getOrderInitials(order.publicOrderId)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 font-mono text-sm truncate">#{order.publicOrderId}</p>
                                                <p className="text-xs text-gray-500">{formatDate(order.orderTime)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                                                {cfg.label}
                                            </span>
                                            <span className="font-bold text-gray-900">CA${parseFloat(order.totalAmount ?? 0).toFixed(2)}</span>
                                            <button
                                                onClick={() => { setShowAllModal(false); viewOrderDetail(order.publicOrderId); }}
                                                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination footer */}
                        {totalPages > 1 && (
                            <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                                <button
                                    onClick={() => setAllModalPage(p => Math.max(1, p - 1))}
                                    disabled={allModalPage === 1}
                                    className="px-4 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    ← Prev
                                </button>
                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                                        <button
                                            key={pg}
                                            onClick={() => setAllModalPage(pg)}
                                            className={`w-8 h-8 text-sm font-semibold rounded-lg transition-colors ${
                                                pg === allModalPage
                                                    ? 'bg-gray-900 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {pg}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setAllModalPage(p => Math.min(totalPages, p + 1))}
                                    disabled={allModalPage === totalPages}
                                    className="px-4 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next →
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            );
        })()}

        {/* ── Order Detail Modal ─────────────────────────────────────────── */}
        {showDetailModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
                        <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
                        <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6">
                        {detailLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            </div>
                        ) : selectedOrder ? (
                            <div className="space-y-5">
                                {/* ID, time, badges */}
                                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                    <span className="font-mono text-gray-500">{selectedOrder.publicOrderId}</span>
                                    <span className="text-gray-500">{formatDate(selectedOrder.orderTime)}</span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusConfig(selectedOrder.status).bg} ${getStatusConfig(selectedOrder.status).text}`}>
                                        {selectedOrder.statusLabel || getStatusConfig(selectedOrder.status).label}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${selectedOrder.fulfillmentType === 'DELIVERY' ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {selectedOrder.fulfillmentType === 'DELIVERY'
                                            ? <><Truck className="w-3 h-3" /> Delivery</>
                                            : <><Store className="w-3 h-3" /> Pickup</>
                                        }
                                    </span>
                                </div>

                                {/* Customer / address */}
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Customer
                                    </h3>
                                    {selectedOrder.customerName && <p className="text-gray-700">{selectedOrder.customerName}</p>}
                                    {selectedOrder.deliveryAddress && (
                                        <p className="flex items-start gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
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
                                        <Package className="w-4 h-4" /> Items
                                    </h3>
                                    <div className="space-y-2">
                                        {(selectedOrder.orderLines || []).map((line, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                                                <div>
                                                    <p className="font-medium text-gray-900">{line.productNameAtPurchase}</p>
                                                    <p className="text-gray-500 text-xs">Qty {line.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-gray-900">{formatCurrency(line.lineTotal)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span>
                                    </div>
                                    {selectedOrder.deliveryFee > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Delivery fee</span>
                                            <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                                        </div>
                                    )}
                                    {selectedOrder.tax > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>{selectedOrder.taxLabel || 'Tax'}</span>
                                            <span>{formatCurrency(selectedOrder.tax)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base">
                                        <span>Total</span>
                                        <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 py-12">Could not load order details.</p>
                        )}
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default DashboardContent;