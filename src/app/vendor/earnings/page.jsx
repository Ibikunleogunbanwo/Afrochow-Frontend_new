"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { VendorOrdersAPI } from '@/lib/api/vendor/orders.api';
import {
    DollarSign,
    TrendingUp,
    Package,
    ShoppingBag,
    RefreshCw,
    LayoutDashboard,
    ChevronRight,
    CheckCircle2,
    User,
    CalendarDays,
    UtensilsCrossed,
    Truck,
    Store,
    MapPin,
    Clock,
    XCircle,
    BarChart3,
} from 'lucide-react';

// ─── helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
    `CA$${parseFloat(amount || 0).toLocaleString('en-CA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-CA', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatAddress = (addr) => {
    if (!addr) return null;
    if (typeof addr === 'string') return addr;
    return (
        addr.formattedAddress ||
        [addr.addressLine, addr.city, addr.province, addr.postalCode]
            .filter(Boolean)
            .join(', ')
    );
};

const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
};

const isWithinDays = (dateString, days) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return d >= cutoff;
};

// ─── component ───────────────────────────────────────────────────────────────

const DATE_RANGE_OPTIONS = [
    { value: 'all', label: 'All time' },
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
];

const VendorEarningsPage = () => {
    const [loading, setLoading] = useState(true);
    const [allDeliveredOrders, setAllDeliveredOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [dateRange, setDateRange] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([fetchRevenueToday(), fetchOrders()]);
        } catch (error) {
            console.error('Error fetching earnings data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Today's revenue still comes from the dedicated backend endpoint (accurate even if
    // getVendorOrders is paginated or excludes very old records).
    const fetchRevenueToday = async () => {
        try {
            const response = await VendorOrdersAPI.getOrdersRevenue();
            if (response?.success && response.data) {
                setTodayRevenue(parseFloat(response.data.todayRevenue || 0));
            }
        } catch (error) {
            console.error('Error fetching revenue stats:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await VendorOrdersAPI.getVendorOrders();
            if (!response?.success) return;

            const orders = response.data || [];
            setAllOrders(orders);

            // Delivered orders are the source of truth for earnings metrics.
            const delivered = orders.filter(
                (o) => o.status === 'DELIVERED' || o.orderStatus === 'DELIVERED'
            );

            // Enrich the 10 most-recent delivered orders with full detail.
            const top10 = delivered.slice(0, 10);
            const detailResults = await Promise.allSettled(
                top10.map((o) => VendorOrdersAPI.getVendorOrderById(o.publicOrderId))
            );

            const enriched = top10.map((order, i) => {
                const result = detailResults[i];
                if (result.status === 'fulfilled' && result.value?.success) {
                    const d = result.value.data;
                    return {
                        ...order,
                        customerName: d.customerName ?? order.customerName,
                        fulfillmentType: d.fulfillmentType ?? order.fulfillmentType,
                        deliveryAddress: d.deliveryAddress ?? order.deliveryAddress,
                        specialInstructions:
                            d.specialInstructions ?? order.specialInstructions,
                        orderLines: d.orderLines ?? order.orderLines,
                    };
                }
                return order;
            });

            // Store the full delivered list; display uses the enriched top-10 slice.
            setAllDeliveredOrders(
                delivered.map((o, i) => (i < 10 ? enriched[i] : o))
            );
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAllData();
        setRefreshing(false);
    };

    // ── derived metrics (respect date-range filter) ──────────────────────────

    const filteredDelivered = useMemo(() => {
        if (dateRange === 'all') return allDeliveredOrders;
        const days = parseInt(dateRange, 10);
        return allDeliveredOrders.filter((o) =>
            isWithinDays(o.orderTime ?? o.createdAt, days)
        );
    }, [allDeliveredOrders, dateRange]);

    const totalRevenue = useMemo(
        () => filteredDelivered.reduce((s, o) => s + (o.totalAmount ?? 0), 0),
        [filteredDelivered]
    );

    const averageOrderValue = useMemo(
        () => (filteredDelivered.length > 0 ? totalRevenue / filteredDelivered.length : 0),
        [filteredDelivered, totalRevenue]
    );

    const todayDeliveredCount = useMemo(
        () =>
            allDeliveredOrders.filter((o) => isToday(o.orderTime ?? o.createdAt)).length,
        [allDeliveredOrders]
    );

    const pendingCount = useMemo(
        () =>
            allOrders.filter((o) => {
                const s = o.status || o.orderStatus || '';
                return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(s);
            }).length,
        [allOrders]
    );

    const cancelledCount = useMemo(
        () =>
            allOrders.filter((o) => {
                const s = o.status || o.orderStatus || '';
                return s === 'CANCELLED';
            }).length,
        [allOrders]
    );

    const pickupCount = useMemo(
        () =>
            filteredDelivered.filter((o) => {
                const ft = (o.fulfillmentType || '').toUpperCase();
                return ft === 'PICKUP';
            }).length,
        [filteredDelivered]
    );

    const deliveryCount = filteredDelivered.length - pickupCount;
    const pickupPct =
        filteredDelivered.length > 0
            ? Math.round((pickupCount / filteredDelivered.length) * 100)
            : 0;
    const deliveryPct = 100 - pickupPct;

    const growthPct =
        totalRevenue > 0
            ? parseFloat(((todayRevenue / totalRevenue) * 100).toFixed(1))
            : 0;

    // ── stat cards ───────────────────────────────────────────────────────────

    const statCards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            icon: DollarSign,
            description: dateRange === 'all' ? 'All-time earnings' : `Last ${dateRange} days`,
            trend: null,
        },
        {
            title: "Today's Revenue",
            value: formatCurrency(todayRevenue),
            icon: TrendingUp,
            description: 'Earnings today',
            trend: growthPct > 0 ? 'up' : 'neutral',
        },
        {
            title: 'Delivered Orders',
            value: filteredDelivered.length.toLocaleString(),
            icon: ShoppingBag,
            description: dateRange === 'all' ? 'Total completed orders' : `Completed in last ${dateRange} days`,
            trend: null,
        },
        {
            title: 'Avg Order Value',
            value: formatCurrency(averageOrderValue),
            icon: Package,
            description: 'Per delivered order',
            trend: null,
        },
    ];

    // ── render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                <Link
                    href="/vendor/dashboard"
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium"
                >
                    <LayoutDashboard className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Earnings</span>
            </nav>

            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Earnings</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Revenue &amp; order stats</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {/* Date range filter */}
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        {DATE_RANGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gray-900 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`}
                        />
                        <span className="hidden xs:inline">
                            {refreshing ? 'Refreshing…' : 'Refresh'}
                        </span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-400 border-t-transparent mb-4" />
                    <p className="text-sm text-gray-500">Loading earnings data…</p>
                </div>
            ) : (
                <>
                    {/* ── Stat Cards ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {statCards.map((stat, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-5"
                            >
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <div className="w-8 h-8 sm:w-11 sm:h-11 bg-gray-100 rounded-xl flex items-center justify-center">
                                        <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                                    </div>
                                    {stat.trend === 'up' && (
                                        <div className="flex items-center gap-0.5 text-green-600 text-xs font-semibold">
                                            <TrendingUp className="h-3 w-3" />
                                            +{growthPct}%
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] sm:text-sm text-gray-500 mb-0.5">
                                    {stat.title}
                                </p>
                                <p className="text-base sm:text-2xl font-black text-gray-900 mb-0.5 break-all leading-tight">
                                    {stat.value}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-400">{stat.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Revenue Breakdown ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-5">
                            Revenue Breakdown
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div className="border-l-4 border-gray-300 pl-4">
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Revenue</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 break-all">
                                    {formatCurrency(totalRevenue)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {dateRange === 'all' ? 'All-time earnings' : `Last ${dateRange} days`}
                                </p>
                            </div>
                            <div className="border-l-4 border-gray-300 pl-4">
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Today's Revenue</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 break-all">
                                    {formatCurrency(todayRevenue)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {totalRevenue > 0
                                        ? `${((todayRevenue / totalRevenue) * 100).toFixed(1)}% of total`
                                        : 'No revenue yet'}
                                </p>
                            </div>
                            <div className="border-l-4 border-gray-300 pl-4">
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Avg Order Value</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 break-all">
                                    {formatCurrency(averageOrderValue)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Per delivered order</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Order Statistics ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4 sm:mb-5">
                            <BarChart3 className="h-4 w-4 text-gray-500" />
                            <h2 className="text-base sm:text-lg font-bold text-gray-900">Order Statistics</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
                            {/* Delivered */}
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                    <p className="text-xs text-green-700 font-medium">Delivered</p>
                                </div>
                                <p className="text-2xl font-black text-green-800">
                                    {filteredDelivered.length}
                                </p>
                                <p className="text-xs text-green-600 mt-0.5">
                                    {dateRange === 'all' ? 'All time' : `Last ${dateRange} days`}
                                </p>
                            </div>

                            {/* Today */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                                    <p className="text-xs text-blue-700 font-medium">Today</p>
                                </div>
                                <p className="text-2xl font-black text-blue-800">{todayDeliveredCount}</p>
                                <p className="text-xs text-blue-600 mt-0.5">Delivered today</p>
                            </div>

                            {/* Active / Pending */}
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <p className="text-xs text-amber-700 font-medium">Active</p>
                                </div>
                                <p className="text-2xl font-black text-amber-800">{pendingCount}</p>
                                <p className="text-xs text-amber-600 mt-0.5">In progress</p>
                            </div>

                            {/* Cancelled */}
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                                    <p className="text-xs text-red-600 font-medium">Cancelled</p>
                                </div>
                                <p className="text-2xl font-black text-red-700">{cancelledCount}</p>
                                <p className="text-xs text-red-500 mt-0.5">All time</p>
                            </div>
                        </div>

                        {/* Fulfillment breakdown */}
                        {filteredDelivered.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Fulfillment mix
                                </p>
                                <div className="flex rounded-full overflow-hidden h-3 mb-3">
                                    <div
                                        className="bg-gray-800 transition-all"
                                        style={{ width: `${deliveryPct}%` }}
                                    />
                                    <div
                                        className="bg-gray-300 transition-all"
                                        style={{ width: `${pickupPct}%` }}
                                    />
                                </div>
                                <div className="flex gap-4 text-xs text-gray-600">
                                    <span className="flex items-center gap-1.5">
                                        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-800" />
                                        Delivery — {deliveryCount} ({deliveryPct}%)
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-300 border border-gray-400" />
                                        Pickup — {pickupCount} ({pickupPct}%)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Recent Delivered Orders ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Recent Delivered Orders
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Latest {Math.min(allDeliveredOrders.length, 10)} of{' '}
                                    {allDeliveredOrders.length} completed orders
                                </p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {allDeliveredOrders.length} delivered
                            </span>
                        </div>

                        {allDeliveredOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                                <Package className="h-12 w-12 text-gray-200 mb-3" />
                                <h3 className="text-base font-bold text-gray-900 mb-1">
                                    No delivered orders yet
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Delivered orders will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {allDeliveredOrders.slice(0, 10).map((order, idx) => {
                                    const isPickup =
                                        (order.fulfillmentType || '').toUpperCase() === 'PICKUP';
                                    return (
                                        <div
                                            key={order.publicOrderId ?? idx}
                                            className="px-3 sm:px-6 py-3 sm:py-5 hover:bg-gray-50 transition-colors border-l-4 border-l-green-300"
                                        >
                                            {/* Top row: order ID + badges + amount */}
                                            <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-xs sm:text-sm font-bold text-gray-900">
                                                        #{order.publicOrderId?.slice(-8) ?? '—'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                                                        <CheckCircle2 className="w-3 h-3" /> Delivered
                                                    </span>
                                                    {isPickup ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                                            <Store className="w-3 h-3" /> Pickup
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                                            <Truck className="w-3 h-3" /> Delivery
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-base sm:text-lg font-black text-gray-900 whitespace-nowrap shrink-0">
                                                    {formatCurrency(order.totalAmount)}
                                                </span>
                                            </div>

                                            {/* Meta row */}
                                            <div className="flex flex-col gap-1 mb-3 text-sm">
                                                <div className="flex flex-wrap gap-x-5 gap-y-1">
                                                    <span className="flex items-center gap-1.5 text-gray-600">
                                                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span className="font-medium text-gray-800">
                                                            {order.customerName || '—'}
                                                        </span>
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-gray-500">
                                                        <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        {formatDate(order.orderTime ?? order.createdAt)}
                                                    </span>
                                                </div>
                                                {formatAddress(order.deliveryAddress) && (
                                                    <span className="flex items-start gap-1.5 text-gray-500 text-xs">
                                                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                                        {formatAddress(order.deliveryAddress)}
                                                    </span>
                                                )}
                                                {order.specialInstructions && (
                                                    <span className="text-xs text-gray-400 italic pl-5">
                                                        Note: {order.specialInstructions}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Items */}
                                            {order.itemNames?.length > 0 ? (
                                                <div className="flex items-start gap-1.5">
                                                    <UtensilsCrossed className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {order.itemNames.map((name, i) => (
                                                            <span
                                                                key={i}
                                                                className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full"
                                                            >
                                                                {name}
                                                            </span>
                                                        ))}
                                                        {order.itemCount > order.itemNames.length && (
                                                            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                +{order.itemCount - order.itemNames.length} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : order.itemCount > 0 ? (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
                                                    {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default VendorEarningsPage;
