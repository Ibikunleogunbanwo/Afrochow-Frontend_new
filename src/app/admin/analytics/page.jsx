'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    BarChart3, LayoutDashboard, ChevronRight, RefreshCw,
    DollarSign, ShoppingBag, Users, Store, Clock, CheckCircle,
    Package, Truck, XCircle, Receipt, CreditCard, Star, Tag,
    TrendingUp, AlertCircle,
} from 'lucide-react';
import { AdminAnalyticsAPI } from '@/lib/api/admin.api';
import AdminPageError from '@/components/admin/AdminPageError';

/* ─── helpers ───────────────────────────────────────────────────────────── */
const fmt$ = (n) =>
    n != null ? `$${Number(n).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
const fmtN = (n) =>
    n != null ? Number(n).toLocaleString() : '—';

/* ─── small components ───────────────────────────────────────────────────── */
const SectionHeading = ({ children }) => (
    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{children}</h2>
);

const KpiCard = ({ label, value, icon: Icon, iconCls = 'text-gray-600', sub }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            {Icon && (
                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className={`w-3.5 h-3.5 ${iconCls}`} />
                </div>
            )}
        </div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
);

const StatusRow = ({ icon: Icon, iconCls, label, value, barPct, barCls }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconCls ?? 'bg-gray-100'}`}>
            <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <span className="text-sm font-bold text-gray-900 ml-2">{fmtN(value)}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${barCls ?? 'bg-gray-400'}`}
                    style={{ width: `${Math.min(barPct ?? 0, 100)}%` }}
                />
            </div>
        </div>
    </div>
);

const TrendRow = ({ label, orders, revenue }) => (
    <div className="grid grid-cols-3 px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-sm">
        <span className="font-medium text-gray-900">{label}</span>
        <span className="text-right text-gray-700">{revenue != null ? fmt$(revenue) : '—'}</span>
        <span className="text-right text-gray-700">{orders != null ? fmtN(orders) : '—'}</span>
    </div>
);

/* ─── main page ─────────────────────────────────────────────────────────── */
export default function AdminAnalyticsPage() {
    const [platform, setPlatform] = useState(null);
    const [trends, setTrends]     = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [platformRes, trendsRes] = await Promise.all([
                AdminAnalyticsAPI.getPlatform(),
                AdminAnalyticsAPI.getTrends(),
            ]);
            setPlatform(platformRes?.data ?? platformRes ?? null);
            const raw = trendsRes?.data ?? trendsRes ?? null;
            setTrends(raw);
        } catch (e) {
            setError(e.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Bar widths for order status — relative to totalOrders
    const pct = (n) => platform?.totalOrders > 0 ? (n / platform.totalOrders) * 100 : 0;

    return (
        <div className="space-y-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Analytics</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Analytics</h1>
                    <p className="text-gray-500 mt-1">Platform-wide performance metrics</p>
                </div>
                <button
                    onClick={fetchData}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32 gap-2 text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading analytics…</span>
                </div>
            ) : error ? (
                <AdminPageError error={error} onRetry={fetchData} />
            ) : !platform ? (
                <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
                    <BarChart3 className="h-16 w-16 text-gray-200" />
                    <p className="text-gray-400">No analytics data available yet</p>
                </div>
            ) : (
                <>
                    {/* ── Top KPIs ── */}
                    <section>
                        <SectionHeading>Revenue &amp; Activity</SectionHeading>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <KpiCard
                                label="Total Revenue"
                                value={fmt$(platform.totalRevenue)}
                                icon={DollarSign}
                            />
                            <KpiCard
                                label="Total Orders"
                                value={fmtN(platform.totalOrders)}
                                icon={ShoppingBag}
                                sub={`${fmtN(platform.activeOrders)} active now`}
                            />
                            <KpiCard
                                label="Today's Orders"
                                value={fmtN(platform.todayOrders)}
                                icon={TrendingUp}
                            />
                            <KpiCard
                                label="Total Discount Given"
                                value={fmt$(platform.totalDiscountGiven)}
                                icon={Tag}
                            />
                        </div>
                    </section>

                    {/* ── Order Status Pipeline ── */}
                    <section>
                        <SectionHeading>Order Status Breakdown</SectionHeading>
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <StatusRow icon={Clock}       iconCls="bg-yellow-400" barCls="bg-yellow-400" label="Pending (unconfirmed)"  value={platform.pendingOrders}          barPct={pct(platform.pendingOrders)} />
                            <StatusRow icon={CheckCircle} iconCls="bg-blue-500"   barCls="bg-blue-500"   label="Confirmed"              value={platform.confirmedOrders}        barPct={pct(platform.confirmedOrders)} />
                            <StatusRow icon={Package}     iconCls="bg-orange-500" barCls="bg-orange-500" label="Preparing"              value={platform.preparingOrders}        barPct={pct(platform.preparingOrders)} />
                            <StatusRow icon={Package}     iconCls="bg-purple-500" barCls="bg-purple-500" label="Ready for Pickup"        value={platform.readyOrders}            barPct={pct(platform.readyOrders)} />
                            <StatusRow icon={Truck}       iconCls="bg-indigo-500" barCls="bg-indigo-500" label="Out for Delivery"        value={platform.outForDeliveryOrders}   barPct={pct(platform.outForDeliveryOrders)} />
                            <StatusRow icon={CheckCircle} iconCls="bg-green-500"  barCls="bg-green-500"  label="Delivered"              value={platform.deliveredOrders}        barPct={pct(platform.deliveredOrders)} />
                            <StatusRow icon={XCircle}     iconCls="bg-red-400"    barCls="bg-red-400"    label="Cancelled"              value={platform.cancelledOrders}        barPct={pct(platform.cancelledOrders)} />
                            <StatusRow icon={Receipt}     iconCls="bg-gray-400"   barCls="bg-gray-400"   label="Refunded"               value={platform.refundedOrders}         barPct={pct(platform.refundedOrders)} />
                        </div>
                    </section>

                    {/* ── Users + Products + Payments ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Users */}
                        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <SectionHeading>Users</SectionHeading>
                            <div className="space-y-3">
                                {[
                                    { label: 'Total Users',     value: fmtN(platform.totalUsers),     sub: null },
                                    { label: 'Active Users',    value: fmtN(platform.activeUsers),    sub: 'currently active' },
                                    { label: 'Customers',       value: fmtN(platform.totalCustomers), sub: null },
                                    { label: 'Vendors',         value: fmtN(platform.totalVendors),   sub: null },
                                ].map(r => (
                                    <div key={r.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-sm text-gray-600">{r.label}</span>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-gray-900">{r.value}</span>
                                            {r.sub && <p className="text-xs text-gray-400">{r.sub}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Products */}
                        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <SectionHeading>Products</SectionHeading>
                            <div className="space-y-3">
                                {[
                                    { label: 'Total Products',     value: fmtN(platform.totalProducts) },
                                    { label: 'Available Products', value: fmtN(platform.availableProducts) },
                                    { label: 'Unavailable',        value: fmtN((platform.totalProducts ?? 0) - (platform.availableProducts ?? 0)) },
                                ].map(r => (
                                    <div key={r.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-sm text-gray-600">{r.label}</span>
                                        <span className="text-sm font-bold text-gray-900">{r.value}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Payments & Promotions */}
                        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <SectionHeading>Payments &amp; Promotions</SectionHeading>
                            <div className="space-y-3">
                                {[
                                    { label: 'Successful Payments', value: fmtN(platform.successfulPayments) },
                                    { label: 'Failed Payments',     value: fmtN(platform.failedPayments) },
                                    { label: 'Total Reviews',       value: fmtN(platform.totalReviews) },
                                    { label: 'Active Promotions',   value: `${fmtN(platform.activePromotions)} / ${fmtN(platform.totalPromotions)}` },
                                ].map(r => (
                                    <div key={r.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-sm text-gray-600">{r.label}</span>
                                        <span className="text-sm font-bold text-gray-900">{r.value}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* ── Sales Trends ── */}
                    {trends && (
                        <section>
                            <SectionHeading>Sales Trends</SectionHeading>
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="grid grid-cols-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <span>Period</span>
                                    <span className="text-right">Revenue</span>
                                    <span className="text-right">Orders</span>
                                </div>
                                <TrendRow label="Last 7 Days"  revenue={trends.revenueLast7Days}    orders={trends.ordersLast7Days} />
                                <TrendRow label="Last 30 Days" revenue={trends.revenueLast30Days}   orders={trends.ordersLast30Days} />
                                {trends.revenueInDateRange != null && (
                                    <TrendRow
                                        label={`Custom range${trends.filterStartDate ? ` (${new Date(trends.filterStartDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} – ${new Date(trends.filterEndDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })})` : ''}`}
                                        revenue={trends.revenueInDateRange}
                                        orders={trends.ordersInDateRange}
                                    />
                                )}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
