"use client";
import React, { useState, useEffect, useCallback } from 'react';
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
    BarChart3,
    Activity,
    AlertCircle,
    RefreshCw,
    LayoutDashboard,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Percent,
} from 'lucide-react';
import { VendorAnalyticsAPI } from '@/lib/api/vendor/analytics.api';

// ─── helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
    `CA$${parseFloat(amount || 0).toLocaleString('en-CA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

/** Safe growth: returns a signed number (%) or null when previous is 0 */
const calcGrowth = (current, previous) => {
    if (!previous || previous === 0) return null;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
};

const DATE_RANGE_OPTIONS = [
    { value: 'today',      label: 'Today' },
    { value: 'yesterday',  label: 'Yesterday' },
    { value: 'last7days',  label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth',  label: 'This Month' },
    { value: 'lastMonth',  label: 'Last Month' },
    { value: 'custom',     label: 'Custom Range' },
];

const getDateRange = (range) => {
    const now = new Date();
    switch (range) {
        case 'today': {
            const s = new Date(now); s.setHours(0, 0, 0, 0);
            const e = new Date(now); e.setHours(23, 59, 59, 999);
            return { start: s.toISOString(), end: e.toISOString(), days: 1 };
        }
        case 'yesterday': {
            const d = new Date(now); d.setDate(d.getDate() - 1);
            const s = new Date(d); s.setHours(0, 0, 0, 0);
            const e = new Date(d); e.setHours(23, 59, 59, 999);
            return { start: s.toISOString(), end: e.toISOString(), days: 1 };
        }
        case 'last7days': {
            const s = new Date(now); s.setDate(s.getDate() - 7); s.setHours(0, 0, 0, 0);
            const e = new Date(now); e.setHours(23, 59, 59, 999);
            return { start: s.toISOString(), end: e.toISOString(), days: 7 };
        }
        case 'last30days': {
            const s = new Date(now); s.setDate(s.getDate() - 30); s.setHours(0, 0, 0, 0);
            const e = new Date(now); e.setHours(23, 59, 59, 999);
            return { start: s.toISOString(), end: e.toISOString(), days: 30 };
        }
        case 'thisMonth': {
            const s = new Date(now.getFullYear(), now.getMonth(), 1);
            const e = new Date(now); e.setHours(23, 59, 59, 999);
            const days = Math.ceil((e - s) / 86_400_000) || 1;
            return { start: s.toISOString(), end: e.toISOString(), days };
        }
        case 'lastMonth': {
            const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            const days = Math.ceil((e - s) / 86_400_000) || 1;
            return { start: s.toISOString(), end: e.toISOString(), days };
        }
        default:
            return null;
    }
};

// ─── component ───────────────────────────────────────────────────────────────

const VendorReportsPage = () => {
    const [loading, setLoading]           = useState(true);
    const [refreshing, setRefreshing]     = useState(false);
    const [salesLoading, setSalesLoading] = useState(false);
    const [dateRange, setDateRange]       = useState('last30days');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate]     = useState('');

    const [analytics, setAnalytics]             = useState(null);
    const [salesReport, setSalesReport]         = useState(null);
    const [salesRangeDays, setSalesRangeDays]   = useState(30);
    const [popularProducts, setPopularProducts] = useState([]);
    const [error, setError]                     = useState(null);

    // ── data fetching ────────────────────────────────────────────────────────

    const fetchSalesReport = useCallback(async (start, end, days = 30) => {
        setSalesLoading(true);
        try {
            const res = await VendorAnalyticsAPI.getVendorSalesReport(start, end);
            setSalesReport(res?.data ?? null);
            setSalesRangeDays(days);
        } catch (e) {
            console.error('Error fetching sales report:', e);
        } finally {
            setSalesLoading(false);
        }
    }, []);

    // fetchAllData accepts the current range so Refresh always respects it.
    const fetchAllData = useCallback(async (currentRange = 'last30days') => {
        try {
            setLoading(true);
            setError(null);
            const range = getDateRange(currentRange);
            await Promise.all([
                VendorAnalyticsAPI.getVendorAnalytics().then(r => setAnalytics(r?.data ?? null)),
                VendorAnalyticsAPI.getVendorPopularProducts().then(r => setPopularProducts(r?.data ?? [])),
                range ? fetchSalesReport(range.start, range.end, range.days) : Promise.resolve(),
            ]);
        } catch (err) {
            console.error('Error fetching report data:', err);
            setError('Failed to load reports. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [fetchSalesReport]);

    useEffect(() => {
        fetchAllData('last30days');
    }, [fetchAllData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        // Pass the currently selected range so the sales report isn't reset.
        if (dateRange === 'custom') {
            await fetchAllData('last30days');
        } else {
            await fetchAllData(dateRange);
        }
        setRefreshing(false);
    };

    const handleDateRangeChange = (value) => {
        setDateRange(value);
        if (value === 'custom') return;
        const range = getDateRange(value);
        if (range) fetchSalesReport(range.start, range.end, range.days);
    };

    const handleCustomRangeApply = () => {
        if (!customStartDate || !customEndDate) return;
        const start = new Date(customStartDate);
        const end   = new Date(customEndDate);
        const days  = Math.ceil((end - start) / 86_400_000) || 1;
        fetchSalesReport(start.toISOString(), end.toISOString(), days);
    };

    // ── export ───────────────────────────────────────────────────────────────

    const handleExportPDF = () => {
        const now = new Date().toLocaleString('en-CA', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
        const rangeLabel =
            DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? dateRange;

        const completionRate = analytics && analytics.totalOrders > 0
            ? ((analytics.deliveredOrders / analytics.totalOrders) * 100).toFixed(1)
            : '—';
        const cancellationRate = analytics && analytics.totalOrders > 0
            ? ((analytics.cancelledOrders / analytics.totalOrders) * 100).toFixed(1)
            : '—';

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
                        <p class="label">Completion Rate</p>
                        <p class="value">${completionRate}%</p>
                        <p class="sub">Cancellation: ${cancellationRate}%</p>
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

        const revenuePerDay = salesReport && salesRangeDays > 0
            ? formatCurrency(salesReport.totalRevenue / salesRangeDays)
            : '—';

        const salesHtml = salesReport ? `
            <section>
                <h2>Sales Report — ${rangeLabel}</h2>
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
                <div class="grid-3" style="margin-top:12px">
                    <div class="card">
                        <p class="label">Revenue / Day</p>
                        <p class="value" style="font-size:16px">${revenuePerDay}</p>
                    </div>
                    <div class="card">
                        <p class="label">Completion Rate</p>
                        <p class="value" style="font-size:16px">${salesReport.totalOrders > 0 ? ((salesReport.deliveredOrders / salesReport.totalOrders) * 100).toFixed(1) : '—'}%</p>
                    </div>
                    <div class="card">
                        <p class="label">Cancelled Orders</p>
                        <p class="value" style="font-size:16px">${salesReport.cancelledOrders ?? '—'}</p>
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

    // ── derived metrics ──────────────────────────────────────────────────────

    const completionRate = analytics && analytics.totalOrders > 0
        ? ((analytics.deliveredOrders / analytics.totalOrders) * 100).toFixed(1)
        : null;

    const cancellationRate = analytics && analytics.totalOrders > 0
        ? ((analytics.cancelledOrders / analytics.totalOrders) * 100).toFixed(1)
        : null;

    // Meaningful trend: last-7-day revenue vs prior 7 days (approximated from 30-day data).
    const revenueGrowth = analytics
        ? calcGrowth(analytics.last7DaysRevenue, analytics.last30DaysRevenue / 4)
        : null;

    const salesRevenuePerDay = salesReport && salesRangeDays > 0
        ? salesReport.totalRevenue / salesRangeDays
        : null;

    const salesCompletionRate = salesReport && salesReport.totalOrders > 0
        ? ((salesReport.deliveredOrders / salesReport.totalOrders) * 100).toFixed(1)
        : null;

    // ── render ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-400 border-t-transparent mb-4" />
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
                    onClick={() => fetchAllData(dateRange)}
                    className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
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
                <Link
                    href="/vendor/dashboard"
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium"
                >
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
                <div className="flex gap-3 shrink-0">
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* ── Key Metrics ── */}
            {analytics && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Orders */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="h-5 w-5 text-gray-700" />
                                </div>
                                {analytics.todayOrders > 0 && (
                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                        +{analytics.todayOrders} today
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-0.5">Total Orders</p>
                            <p className="text-2xl font-black text-gray-900">{analytics.totalOrders}</p>
                            <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    {analytics.deliveredOrders} delivered
                                </span>
                                <span>·</span>
                                <span>{analytics.pendingOrders} pending</span>
                            </div>
                        </div>

                        {/* Total Revenue */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-gray-700" />
                                </div>
                                {revenueGrowth !== null && (
                                    <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        revenueGrowth >= 0
                                            ? 'text-green-600 bg-green-50'
                                            : 'text-red-500 bg-red-50'
                                    }`}>
                                        {revenueGrowth >= 0
                                            ? <TrendingUp className="w-3 h-3" />
                                            : <TrendingDown className="w-3 h-3" />}
                                        {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-0.5">Total Revenue</p>
                            <p className="text-2xl font-black text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                            <p className="mt-1.5 text-xs text-gray-500">
                                Today: {formatCurrency(analytics.todayRevenue)}
                            </p>
                        </div>

                        {/* Completion Rate */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <Percent className="h-5 w-5 text-gray-700" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-0.5">Completion Rate</p>
                            <p className="text-2xl font-black text-gray-900">
                                {completionRate !== null ? `${completionRate}%` : '—'}
                            </p>
                            <p className="mt-1.5 text-xs text-gray-500">
                                {cancellationRate !== null
                                    ? `${cancellationRate}% cancellation rate`
                                    : 'No orders yet'}
                            </p>
                        </div>

                        {/* Average Rating */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <Star className="h-5 w-5 text-gray-700" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-0.5">Average Rating</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-black text-gray-900">
                                    {analytics.averageRating.toFixed(1)}
                                </p>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-3.5 w-3.5 ${
                                                i < Math.floor(analytics.averageRating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="mt-1.5 text-xs text-gray-500">{analytics.totalReviews} reviews</p>
                        </div>
                    </div>

                    {/* ── Revenue Breakdown + Order Status ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <h3 className="font-semibold text-gray-900 text-sm">Last 7 Days</h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(analytics.last7DaysRevenue)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Revenue generated</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <h3 className="font-semibold text-gray-900 text-sm">Last 30 Days</h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(analytics.last30DaysRevenue)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Revenue generated</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="h-4 w-4 text-gray-500" />
                                <h3 className="font-semibold text-gray-900 text-sm">Order Status Breakdown</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1.5 text-gray-600">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Delivered
                                    </span>
                                    <span className="font-semibold text-gray-900">{analytics.deliveredOrders}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 pl-5">Pending / Active</span>
                                    <span className="font-semibold text-gray-900">{analytics.pendingOrders}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1.5 text-gray-600">
                                        <XCircle className="w-3.5 h-3.5 text-red-400" /> Cancelled
                                    </span>
                                    <span className="font-semibold text-red-600">{analytics.cancelledOrders}</span>
                                </div>
                                {analytics.totalOrders > 0 && (
                                    <>
                                        <div className="pt-2 mt-2 border-t border-gray-100">
                                            <div className="flex rounded-full overflow-hidden h-2">
                                                <div
                                                    className="bg-green-400"
                                                    style={{ width: `${(analytics.deliveredOrders / analytics.totalOrders) * 100}%` }}
                                                />
                                                <div
                                                    className="bg-amber-300"
                                                    style={{ width: `${(analytics.pendingOrders / analytics.totalOrders) * 100}%` }}
                                                />
                                                <div
                                                    className="bg-red-300"
                                                    style={{ width: `${(analytics.cancelledOrders / analytics.totalOrders) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Sales Report ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-gray-700" />
                        <h2 className="text-lg font-bold text-gray-900">Sales Report</h2>
                    </div>
                    <select
                        value={dateRange}
                        onChange={(e) => handleDateRangeChange(e.target.value)}
                        className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        {DATE_RANGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {dateRange === 'custom' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Start Date</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-gray-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">End Date</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-gray-400 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleCustomRangeApply}
                                disabled={!customStartDate || !customEndDate}
                                className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}

                {salesLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin h-8 w-8 border-4 border-gray-400 border-t-transparent rounded-full" />
                    </div>
                ) : salesReport ? (
                    <>
                        {/* Primary metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="border-l-4 border-gray-800 pl-4">
                                <p className="text-xs text-gray-500 mb-0.5">All Orders</p>
                                <p className="text-2xl font-black text-gray-900">{salesReport.totalOrders}</p>
                                <p className="text-xs text-gray-400">in period</p>
                            </div>
                            <div className="border-l-4 border-green-400 pl-4">
                                <p className="text-xs text-gray-500 mb-0.5">Delivered</p>
                                <p className="text-2xl font-black text-gray-900">{salesReport.deliveredOrders}</p>
                                {salesCompletionRate && (
                                    <p className="text-xs text-green-600 font-medium">{salesCompletionRate}% rate</p>
                                )}
                            </div>
                            <div className="border-l-4 border-gray-300 pl-4">
                                <p className="text-xs text-gray-500 mb-0.5">Total Revenue</p>
                                <p className="text-2xl font-black text-gray-900">{formatCurrency(salesReport.totalRevenue)}</p>
                                <p className="text-xs text-gray-400">from delivered</p>
                            </div>
                            <div className="border-l-4 border-gray-300 pl-4">
                                <p className="text-xs text-gray-500 mb-0.5">Avg Order Value</p>
                                <p className="text-2xl font-black text-gray-900">{formatCurrency(salesReport.averageOrderValue)}</p>
                                <p className="text-xs text-gray-400">per order</p>
                            </div>
                        </div>

                        {/* Secondary metrics */}
                        {salesRevenuePerDay !== null && (
                            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-gray-50 rounded-xl px-4 py-3">
                                    <p className="text-xs text-gray-500">Revenue / Day</p>
                                    <p className="text-lg font-bold text-gray-900 mt-0.5">{formatCurrency(salesRevenuePerDay)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl px-4 py-3">
                                    <p className="text-xs text-gray-500">Orders / Day</p>
                                    <p className="text-lg font-bold text-gray-900 mt-0.5">
                                        {(salesReport.totalOrders / salesRangeDays).toFixed(1)}
                                    </p>
                                </div>
                                {salesReport.cancelledOrders != null && (
                                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                                        <p className="text-xs text-gray-500">Cancelled</p>
                                        <p className="text-lg font-bold text-red-600 mt-0.5">{salesReport.cancelledOrders}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                        Select a date range to view the sales report.
                    </p>
                )}
            </div>

            {/* ── Popular Products ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-gray-700" />
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
                                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                        index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'
                                    }`}
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
