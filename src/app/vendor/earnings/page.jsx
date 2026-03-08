"use client";
import React, { useState, useEffect } from 'react';
import { AuthAPI } from '@/lib/api/auth';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Download,
    Package,
    ShoppingBag,
    Clock,
    RefreshCw,
    AlertCircle
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
            const response = await AuthAPI.getOrdersRevenue();
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
            const response = await AuthAPI.getOrderCountStats();
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
            const response = await AuthAPI.getVendorOrders();
            if (response?.success) {
                const orders = response.data || [];
                const deliveredOrders = orders.filter(order => order.orderStatus === 'DELIVERED');
                setRecentOrders(deliveredOrders.slice(0, 10));

                if (stats.totalOrders > 0) {
                    const avgValue = stats.totalRevenue / stats.totalOrders;
                    setStats(prev => ({
                        ...prev,
                        averageOrderValue: avgValue
                    }));
                }
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
        return `$${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            description: 'All-time earnings',
            trend: null
        },
        {
            title: "Today's Revenue",
            value: formatCurrency(stats.todayRevenue),
            icon: TrendingUp,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            description: 'Earnings today',
            trend: calculateGrowth() > 0 ? 'up' : 'neutral'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders.toLocaleString(),
            icon: ShoppingBag,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            description: 'All completed orders',
            trend: null
        },
        {
            title: 'Average Order Value',
            value: formatCurrency(stats.averageOrderValue),
            icon: Package,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            description: 'Per order average',
            trend: null
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings & Analytics</h1>
                        <p className="text-gray-600">Track your revenue and order statistics</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                    </button>
                </div>

                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-600">Loading earnings data...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statCards.map((stat, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`${stat.iconBg} rounded-lg p-3`}>
                                            <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                                        </div>
                                        {stat.trend === 'up' && (
                                            <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                                                <TrendingUp className="h-4 w-4" />
                                                <span>+{calculateGrowth()}%</span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                    <p className="text-xs text-gray-500">{stat.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Revenue Breakdown */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Breakdown</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="border-l-4 border-green-500 pl-4">
                                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                                    <p className="text-xs text-gray-500 mt-1">All-time earnings</p>
                                </div>
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todayRevenue)}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.totalRevenue > 0
                                            ? `${((stats.todayRevenue / stats.totalRevenue) * 100).toFixed(1)}% of total`
                                            : 'No revenue yet'}
                                    </p>
                                </div>
                                <div className="border-l-4 border-orange-500 pl-4">
                                    <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Per order average</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Statistics */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Statistics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-purple-50 rounded-lg p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="bg-purple-100 rounded-full p-3">
                                            <ShoppingBag className="h-8 w-8 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Total Orders</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">All completed orders</p>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="bg-orange-100 rounded-full p-3">
                                            <DollarSign className="h-8 w-8 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Revenue per Order</p>
                                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">Average value per order</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Delivered Orders */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Recent Delivered Orders</h2>
                                <span className="text-sm text-gray-500">{recentOrders.length} orders</span>
                            </div>

                            {recentOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No delivered orders yet</h3>
                                    <p className="text-gray-600">Delivered orders will appear here</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Order ID
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Customer
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Items
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {recentOrders.map((order) => (
                                                <tr key={order.publicOrderId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            #{order.publicOrderId?.slice(-8)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900">{order.customerName || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatDate(order.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900">{order.itemCount || 0}</span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-right">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {formatCurrency(order.totalAmount)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Info Banner */}
                        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">About Your Earnings</h3>
                                    <p className="text-sm text-blue-800">
                                        Revenue statistics are updated in real-time based on delivered orders.
                                        Today's revenue includes all orders delivered today. Average order value is calculated
                                        from your total revenue divided by total completed orders.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VendorEarningsPage;
