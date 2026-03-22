"use client";
import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Download,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Package,
    Star,
    Users,
    FileText,
    BarChart3,
    PieChart,
    Activity,
    AlertCircle,
    RefreshCw,
    ChevronDown
} from 'lucide-react';
import { VendorAnalyticsAPI } from '@/lib/api/vendor/analytics.api';

const VendorReportsPage = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [salesLoading, setSalesLoading] = useState(false);
    const [dateRange, setDateRange] = useState('last30days');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Analytics Data
    const [analytics, setAnalytics] = useState(null);
    const [salesReport, setSalesReport] = useState(null);
    const [popularProducts, setPopularProducts] = useState([]);
    const [error, setError] = useState(null);

    const dateRangeOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last7days', label: 'Last 7 Days' },
        { value: 'last30days', label: 'Last 30 Days' },
        { value: 'thisMonth', label: 'This Month' },
        { value: 'lastMonth', label: 'Last Month' },
        { value: 'custom', label: 'Custom Range' }
    ];

    // Compute start/end ISO strings for a named date range
    const getDateRange = (range) => {
        const now = new Date();
        switch (range) {
            case 'today': {
                const start = new Date(now); start.setHours(0, 0, 0, 0);
                const end   = new Date(now); end.setHours(23, 59, 59, 999);
                return { start: start.toISOString(), end: end.toISOString() };
            }
            case 'yesterday': {
                const d = new Date(now); d.setDate(d.getDate() - 1);
                const start = new Date(d); start.setHours(0, 0, 0, 0);
                const end   = new Date(d); end.setHours(23, 59, 59, 999);
                return { start: start.toISOString(), end: end.toISOString() };
            }
            case 'last7days': {
                const start = new Date(now); start.setDate(start.getDate() - 7); start.setHours(0, 0, 0, 0);
                const end   = new Date(now); end.setHours(23, 59, 59, 999);
                return { start: start.toISOString(), end: end.toISOString() };
            }
            case 'last30days': {
                const start = new Date(now); start.setDate(start.getDate() - 30); start.setHours(0, 0, 0, 0);
                const end   = new Date(now); end.setHours(23, 59, 59, 999);
                return { start: start.toISOString(), end: end.toISOString() };
            }
            case 'thisMonth': {
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end   = new Date(now); end.setHours(23, 59, 59, 999);
                return { start: start.toISOString(), end: end.toISOString() };
            }
            case 'lastMonth': {
                const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const end   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                return { start: start.toISOString(), end: end.toISOString() };
            }
            default:
                return null;
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);
            const range = getDateRange('last30days');
            await Promise.all([
                fetchVendorAnalytics(),
                fetchPopularProducts(),
                range ? fetchSalesReport(range.start, range.end) : Promise.resolve(),
            ]);
        } catch (err) {
            console.error('Error fetching report data:', err);
            setError('Failed to load reports. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchVendorAnalytics = async () => {
        const res = await VendorAnalyticsAPI.getVendorAnalytics();
        setAnalytics(res?.data ?? null);
    };

    const fetchSalesReport = async (start, end) => {
        setSalesLoading(true);
        try {
            const res = await VendorAnalyticsAPI.getVendorSalesReport(start, end);
            setSalesReport(res?.data ?? null);
        } catch (e) {
            console.error('Error fetching sales report:', e);
        } finally {
            setSalesLoading(false);
        }
    };

    const fetchPopularProducts = async () => {
        const res = await VendorAnalyticsAPI.getVendorPopularProducts();
        setPopularProducts(res?.data ?? []);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAllData();
        setRefreshing(false);
    };

    const handleDateRangeChange = (value) => {
        setDateRange(value);
        if (value === 'custom') return; // wait for user to pick dates
        const range = getDateRange(value);
        if (range) fetchSalesReport(range.start, range.end);
    };

    const handleCustomDateRangeApply = () => {
        if (customStartDate && customEndDate) {
            const start = new Date(customStartDate).toISOString();
            const end = new Date(customEndDate).toISOString();
            fetchSalesReport(start, end);
        }
    };

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const calculateGrowth = (current, previous) => {
        if (!previous) return 0;
        return (((current - previous) / previous) * 100).toFixed(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-600">Loading reports...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <p className="text-gray-700 font-semibold mb-2">Something went wrong</p>
                        <p className="text-gray-500 text-sm mb-6">{error}</p>
                        <button
                            onClick={fetchAllData}
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
                        <p className="text-gray-600">Comprehensive insights into your business performance</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                        <button
                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            <Download className="h-5 w-5" />
                            <span>Export PDF</span>
                        </button>
                    </div>
                </div>

                {/* Key Metrics Overview */}
                {analytics && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Orders */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-orange-100 rounded-lg p-3">
                                        <ShoppingBag className="h-6 w-6 text-orange-600" />
                                    </div>
                                    {analytics.todayOrders > 0 && (
                                        <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                                            <TrendingUp className="h-4 w-4" />
                                            <span>Today: {analytics.todayOrders}</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Orders</h3>
                                <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                    <span>Delivered: {analytics.deliveredOrders}</span>
                                    <span>•</span>
                                    <span>Pending: {analytics.pendingOrders}</span>
                                </div>
                            </div>

                            {/* Total Revenue */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-green-100 rounded-lg p-3">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>+{calculateGrowth(analytics.totalRevenue, analytics.totalRevenue - analytics.last30DaysRevenue)}%</span>
                                    </div>
                                </div>
                                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                                <div className="mt-2 text-xs text-gray-500">
                                    Today: {formatCurrency(analytics.todayRevenue)}
                                </div>
                            </div>

                            {/* Active Products */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-blue-100 rounded-lg p-3">
                                        <Package className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-medium text-gray-600 mb-1">Products</h3>
                                <p className="text-2xl font-bold text-gray-900">{analytics.activeProducts}</p>
                                <div className="mt-2 text-xs text-gray-500">
                                    Total: {analytics.totalProducts}
                                </div>
                            </div>

                            {/* Average Rating */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-purple-100 rounded-lg p-3">
                                        <Star className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-medium text-gray-600 mb-1">Average Rating</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-gray-900">{analytics.averageRating.toFixed(1)}</p>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${
                                                    i < Math.floor(analytics.averageRating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    {analytics.totalReviews} reviews
                                </div>
                            </div>
                        </div>

                        {/* Revenue Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Calendar className="h-5 w-5 text-gray-600" />
                                    <h3 className="font-semibold text-gray-900">Last 7 Days</h3>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 mb-2">
                                    {formatCurrency(analytics.last7DaysRevenue)}
                                </p>
                                <p className="text-sm text-gray-500">Revenue generated</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Calendar className="h-5 w-5 text-gray-600" />
                                    <h3 className="font-semibold text-gray-900">Last 30 Days</h3>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 mb-2">
                                    {formatCurrency(analytics.last30DaysRevenue)}
                                </p>
                                <p className="text-sm text-gray-500">Revenue generated</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Activity className="h-5 w-5 text-gray-600" />
                                    <h3 className="font-semibold text-gray-900">Order Status</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Delivered</span>
                                        <span className="font-semibold text-green-600">{analytics.deliveredOrders}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Pending</span>
                                        <span className="font-semibold text-blue-600">{analytics.pendingOrders}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Cancelled</span>
                                        <span className="font-semibold text-red-600">{analytics.cancelledOrders}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Sales Report Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="h-6 w-6 text-orange-600" />
                            <h2 className="text-xl font-bold text-gray-900">Sales Report</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={dateRange}
                                onChange={(e) => handleDateRangeChange(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                style={{ color: 'black', backgroundColor: 'white' }}
                            >
                                {dateRangeOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {dateRange === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleCustomDateRangeApply}
                                    disabled={!customStartDate || !customEndDate}
                                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}

                    {salesLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
                        </div>
                    ) : salesReport ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="border-l-4 border-orange-500 pl-4">
                                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{salesReport.totalOrders}</p>
                            </div>
                            <div className="border-l-4 border-green-500 pl-4">
                                <p className="text-sm text-gray-600 mb-1">Delivered Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{salesReport.deliveredOrders}</p>
                            </div>
                            <div className="border-l-4 border-blue-500 pl-4">
                                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesReport.totalRevenue)}</p>
                            </div>
                            <div className="border-l-4 border-purple-500 pl-4">
                                <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesReport.averageOrderValue)}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-6">Select a date range to view the sales report.</p>
                    )}
                </div>

                {/* Popular Products */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                        <h2 className="text-xl font-bold text-gray-900">Top 10 Popular Products</h2>
                    </div>

                    {popularProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                            <p className="text-gray-600">Add products to see popularity metrics</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Product Name
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Orders
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Reviews
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Rating
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {popularProducts.map((product, index) => (
                                        <tr key={product.productPublicId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                                                    index === 0 ? 'bg-yellow-500' :
                                                    index === 1 ? 'bg-gray-400' :
                                                    index === 2 ? 'bg-orange-600' :
                                                    'bg-gray-300 text-gray-700'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-medium text-gray-900">{product.productName}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                                                    <ShoppingBag className="h-4 w-4" />
                                                    {product.orderCount}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                                    <Users className="h-4 w-4" />
                                                    {product.reviewCount}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {product.averageRating ? product.averageRating.toFixed(1) : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorReportsPage;
