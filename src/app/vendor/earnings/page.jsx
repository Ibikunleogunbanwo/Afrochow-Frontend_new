"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { VendorOrdersAPI } from '@/lib/api/vendor/orders.api';
import { formatDateTime } from "@/lib/utils/dateUtils";
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
} from 'lucide-react';

const VendorEarningsPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        todayRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0
    });
    const [dateRange, setDateRange] = useState('all');
    const [recentOrders, setRecentOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchRevenueStats(),
                fetchOrderCountStats(),
                fetchRecentOrders()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRevenueStats = async () => {
        try {
            const response = await VendorOrdersAPI.getOrdersRevenue();
            if (response?.success && response.data) {
                setStats(prev => ({
                    ...prev,
                    totalRevenue: parseFloat(response.data.totalRevenue || 0),
                    todayRevenue: parseFloat(response.data.todayRevenue || 0)
                }));
            }
        } catch (error) {
            console.error('Error fetching revenue stats:', error);
        }
    };

    const fetchOrderCountStats = async () => {
        try {
            const response = await VendorOrdersAPI.getOrderCountStats();
            if (response?.success && response.data) {
                setStats(prev => ({
                    ...prev,
                    totalOrders: parseInt(response.data.totalOrders || 0)
                }));
            }
        } catch (error) {
            console.error('Error fetching order count:', error);
        }
    };

    const fetchRecentOrders = async () => {
        try {
            const response = await VendorOrdersAPI.getVendorOrders();
            if (response?.success) {
                const orders = response.data || [];
                // Backend uses 'status' not 'orderStatus'
                const deliveredOrders = orders.filter(o => o.status === 'DELIVERED' || o.orderStatus === 'DELIVERED');
                const top10 = deliveredOrders.slice(0, 10);

                // Compute avg directly from this order list to avoid race condition with stats state
                const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
                const avg = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;
                setStats(prev => ({ ...prev, averageOrderValue: avg }));

                // Enrich each order with full detail (customerName, fulfillmentType, address, etc.)
                // Same call the dashboard modal uses — fired in parallel for all orders at once.
                const detailResults = await Promise.allSettled(
                    top10.map(o => VendorOrdersAPI.getVendorOrderById(o.publicOrderId))
                );

                const enriched = top10.map((order, i) => {
                    const result = detailResults[i];
                    if (result.status === 'fulfilled' && result.value?.success) {
                        const d = result.value.data;
                        return {
                            ...order,
                            customerName:        d.customerName        ?? order.customerName,
                            fulfillmentType:     d.fulfillmentType     ?? order.fulfillmentType,
                            deliveryAddress:     d.deliveryAddress     ?? order.deliveryAddress,
                            specialInstructions: d.specialInstructions ?? order.specialInstructions,
                            orderLines:          d.orderLines          ?? order.orderLines,
                        };
                    }
                    return order;
                });

                setRecentOrders(enriched);
            }
        } catch (error) {
            console.error('Error fetching recent orders:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAllData();
        setRefreshing(false);
    };

    const formatCurrency = (amount) => {
        return `CA$${parseFloat(amount || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-CA', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAddress = (addr) => {
        if (!addr) return null;
        if (typeof addr === 'string') return addr;
        return addr.formattedAddress ||
            [addr.addressLine, addr.city, addr.province, addr.postalCode].filter(Boolean).join(', ');
    };

    const calculateGrowth = () => {
        if (stats.totalRevenue === 0) return 0;
        const growthRate = ((stats.todayRevenue / stats.totalRevenue) * 100).toFixed(1);
        return parseFloat(growthRate);
    };

    const statCards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-700',
            description: 'All-time earnings',
            trend: null
        },
        {
            title: "Today's Revenue",
            value: formatCurrency(stats.todayRevenue),
            icon: TrendingUp,
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-700',
            description: 'Earnings today',
            trend: calculateGrowth() > 0 ? 'up' : 'neutral'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders.toLocaleString(),
            icon: ShoppingBag,
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-700',
            description: 'All completed orders',
            trend: null
        },
        {
            title: 'Average Order Value',
            value: formatCurrency(stats.averageOrderValue),
            icon: Package,
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-700',
            description: 'Per order average',
            trend: null
        }
    ];

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                <Link href="/vendor/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
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
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Revenue & order stats</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gray-900 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-50 shrink-0"
                >
                    <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden xs:inline">{refreshing ? 'Refreshing…' : 'Refresh'}</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-400 border-t-transparent mb-4" />
                    <p className="text-sm text-gray-500">Loading earnings data…</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards — 2-col on mobile, 4-col on lg */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {statCards.map((stat, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-5">
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <div className={`w-8 h-8 sm:w-11 sm:h-11 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                                    </div>
                                    {stat.trend === 'up' && (
                                        <div className="flex items-center gap-0.5 text-green-600 text-xs font-semibold">
                                            <TrendingUp className="h-3 w-3" />
                                            +{calculateGrowth()}%
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] sm:text-sm text-gray-500 mb-0.5">{stat.title}</p>
                                <p className="text-base sm:text-2xl font-black text-gray-900 mb-0.5 break-all leading-tight">{stat.value}</p>
                                <p className="text-[10px] sm:text-xs text-gray-400">{stat.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-5">Revenue Breakdown</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                <div className="border-l-4 border-gray-300 pl-4">
                                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Revenue</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-all">{formatCurrency(stats.totalRevenue)}</p>
                                    <p className="text-xs text-gray-500 mt-1">All-time earnings</p>
                                </div>
                                <div className="border-l-4 border-gray-300 pl-4">
                                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Today's Revenue</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-all">{formatCurrency(stats.todayRevenue)}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.totalRevenue > 0
                                            ? `${((stats.todayRevenue / stats.totalRevenue) * 100).toFixed(1)}% of total`
                                            : 'No revenue yet'}
                                    </p>
                                </div>
                                <div className="border-l-4 border-gray-300 pl-4">
                                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Order Value</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-all">{formatCurrency(stats.averageOrderValue)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Per order average</p>
                                </div>
                            </div>
                        </div>

                    {/* Order Statistics */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Statistics</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-5 flex items-center gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Total Orders</p>
                                    <p className="text-2xl font-black text-gray-900">{stats.totalOrders}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">All delivered orders</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-5 flex items-center gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Avg Order Value</p>
                                    <p className="text-2xl font-black text-gray-900">{formatCurrency(stats.averageOrderValue)}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Per order average</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Delivered Orders */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Recent Delivered Orders</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Latest {recentOrders.length} completed orders</p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {recentOrders.length} delivered
                            </span>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                                <Package className="h-12 w-12 text-gray-200 mb-3" />
                                <h3 className="text-base font-bold text-gray-900 mb-1">No delivered orders yet</h3>
                                <p className="text-sm text-gray-500">Delivered orders will appear here</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentOrders.map((order, idx) => {
                                    const isPickup = order.fulfillmentType === 'PICKUP' || order.fulfillmentType === 'pickup';
                                    return (
                                        <div key={order.publicOrderId ?? idx} className="px-3 sm:px-6 py-3 sm:py-5 hover:bg-gray-50 transition-colors border-l-4 border-l-green-300">
                                            {/* Top row: order ID + badge + amount */}
                                            <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-xs sm:text-sm font-bold text-gray-900">
                                                        #{order.publicOrderId?.slice(-8) ?? '—'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
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

                                            {/* Meta row: customer + date + address */}
                                            <div className="flex flex-col gap-1 mb-3 text-sm">
                                                <div className="flex flex-wrap gap-x-5 gap-y-1">
                                                    <span className="flex items-center gap-1.5 text-gray-600">
                                                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span className="font-medium text-gray-800">{order.customerName || '—'}</span>
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
                                                            <span key={i} className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
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
