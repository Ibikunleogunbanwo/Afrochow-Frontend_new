"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Calendar,
    Download,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Package,
    Star,
    FileText,
    BarChart3,
    PieChart,
    Activity,
    AlertCircle,
    RefreshCw,
    ChevronDown,
    LayoutDashboard,
    ChevronRight,
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

    const handleExportPDF = () => {
        const now = new Date().toLocaleString('en-CA', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
        const rangeLabel = dateRangeOptions.find(o => o.value === dateRange)?.label ?? dateRange;

        const metricsHtml = analytics ? `
            <section>
                <h2>Key Metrics Overview</h2>
                <div class="grid-4">
                    <div class="card">
                        <p class="label">Total Orders</p>
                        <p class="value">${analytics.totalOrders}</p>
                        <p class="sub">Delivered: ${analytics.deliveredOrders} &nbsp;|&nbsp; Pending: ${analytics.pendingOrders}</p>
                    </div>
                    <div class="card">
                        <p class="label">Total Revenue</p>
                        <p class="value">${formatCurrency(analytics.totalRevenue)}</p>
                        <p class="sub">Today: ${formatCurrency(analytics.todayRevenue)}</p>
                    </div>
                    <div class="card">
                        <p class="label">Products</p>
                        <p class="value">${analytics.activeProducts} active</p>
                        <p class="sub">Total: ${analytics.totalProducts}</p>
                    </div>
                    <div class="card">
                        <p class="label">Average Rating</p>
                        <p class="value">${analytics.averageRating.toFixed(1)} / 5</p>
                        <p class="sub">${analytics.totalReviews} reviews</p>
                    </div>
                </div>
            </section>
            <section>
                <h2>Revenue Breakdown</h2>
                <div class="grid-3">
                    <div class="card accent-green">
                        <p class="label">Last 7 Days</p>
                        <p class="value">${formatCurrency(analytics.last7DaysRevenue)}</p>
                    </div>
                    <div class="card accent-blue">
                        <p class="label">Last 30 Days</p>
                        <p class="value">${formatCurrency(analytics.last30DaysRevenue)}</p>
                    </div>
                    <div class="card accent-orange">
                        <p class="label">Order Status</p>
                        <p class="sub" style="margin-top:6px">
                            Delivered: <strong>${analytics.deliveredOrders}</strong> &nbsp;
                            Pending: <strong>${analytics.pendingOrders}</strong> &nbsp;
                            Cancelled: <strong>${analytics.cancelledOrders}</strong>
                        </p>
                    </div>
                </div>
            </section>
        ` : '';

        const salesHtml = salesReport ? `
            <section>
                <h2>Sales Report &mdash; ${rangeLabel}</h2>
                <div class="grid-4">
                    <div class="card accent-orange">
                        <p class="label">Total Orders</p>
                        <p class="value">${salesReport.totalOrders}</p>
                    </div>
                    <div class="card accent-green">
                        <p class="label">Delivered Orders</p>
                        <p class="value">${salesReport.deliveredOrders}</p>
                    </div>
                    <div class="card accent-blue">
                        <p class="label">Total Revenue</p>
                        <p class="value">${formatCurrency(salesReport.totalRevenue)}</p>
                    </div>
                    <div class="card accent-purple">
                        <p class="label">Avg Order Value</p>
                        <p class="value">${formatCurrency(salesReport.averageOrderValue)}</p>
                    </div>
                </div>
            </section>
        ` : '';

        const productsHtml = popularProducts.length > 0 ? `
            <section>
                <h2>Top Popular Products</h2>
                <table class="products-table">
                    <thead>
                        <tr>
                            <th style="width:44px;text-align:center">#</th>
                            <th>Product Name</th>
                            <th style="width:80px;text-align:center">Orders</th>
                            <th style="width:80px;text-align:center">Reviews</th>
                            <th style="width:70px;text-align:center">Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${popularProducts.map((p, i) => `
                            <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
                                <td style="text-align:center;font-weight:700;color:#111">${i + 1}</td>
                                <td><span class="product-name">${p.productName}</span></td>
                                <td style="text-align:center;font-weight:600">${p.orderCount ?? 0}</td>
                                <td style="text-align:center;font-weight:600">${p.reviewCount ?? 0}</td>
                                <td style="text-align:center;font-weight:600">${p.averageRating ? p.averageRating.toFixed(1) : '—'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </section>
        ` : '';

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Reports &amp; Analytics — Afrochow</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111; background: #fff; padding: 32px; font-size: 13px; }
  h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  h2 { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
  .meta { font-size: 11px; color: #6b7280; margin-bottom: 28px; }
  section { margin-bottom: 28px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; }
  .card.accent-green  { border-left: 4px solid #22c55e; }
  .card.accent-blue   { border-left: 4px solid #3b82f6; }
  .card.accent-orange { border-left: 4px solid #f97316; }
  .card.accent-purple { border-left: 4px solid #a855f7; }
  .label { font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: .04em; }
  .value { font-size: 20px; font-weight: 800; color: #111; }
  .sub   { font-size: 11px; color: #6b7280; margin-top: 4px; }
  table  { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #111; color: #fff; text-align: left; padding: 9px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; }
  td { padding: 9px 12px; vertical-align: middle; border-bottom: 1px solid #e5e7eb; color: #111; }
  .products-table tr:last-child td { border-bottom: none; }
  .row-even { background: #fff; }
  .row-odd  { background: #f9fafb; }
  .product-name { font-weight: 600; }
  @media print {
    body { padding: 16px; }
    .grid-4 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
  }
</style>
</head>
<body>
  <h1>Reports &amp; Analytics</h1>
  <p class="meta">Exported on ${now}</p>
  ${metricsHtml}
  ${salesHtml}
  ${productsHtml}
</body>
</html>`;

        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 400);
    };

    const formatCurrency = (amount) => {
        return `CA$${parseFloat(amount || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-CA', {
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
            <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mb-4" />
                <p className="text-sm text-gray-500">Loading reports…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold mb-2">Something went wrong</p>
                <p className="text-gray-500 text-sm mb-6">{error}</p>
                <button
                    onClick={fetchAllData}
                    className="px-5 py-2 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-colors"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/vendor/dashboard" className="flex items-center gap-1 hover:text-orange-600 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Reports</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Reports &amp; Analytics</h1>
                    <p className="text-gray-600 mt-1">Comprehensive insights into your business performance</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Export PDF
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Top Popular Products</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Ranked by total orders</p>
                            </div>
                        </div>
                        {popularProducts.length > 0 && (
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                {popularProducts.length} products
                            </span>
                        )}
                    </div>

                    {popularProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Package className="h-14 w-14 text-gray-200 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No products yet</h3>
                            <p className="text-sm text-gray-500">Add products to see popularity metrics</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-900 text-white">
                                    <th className="w-12 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Product Name</th>
                                    <th className="w-24 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Orders</th>
                                    <th className="w-24 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Reviews</th>
                                    <th className="w-20 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {popularProducts.map((product, index) => (
                                    <tr
                                        key={product.productPublicId ?? index}
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'}`}
                                    >
                                        <td className="px-4 py-3 text-center font-bold text-gray-900">{index + 1}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-900">{product.productName}</td>
                                        <td className="px-4 py-3 text-center font-semibold text-gray-700">{product.orderCount ?? 0}</td>
                                        <td className="px-4 py-3 text-center font-semibold text-gray-700">{product.reviewCount ?? 0}</td>
                                        <td className="px-4 py-3 text-center font-semibold text-gray-700">
                                            {product.averageRating > 0 ? product.averageRating.toFixed(1) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
        </div>
    );
};

export default VendorReportsPage;
