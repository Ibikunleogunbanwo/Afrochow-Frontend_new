'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, LayoutDashboard, ChevronRight, RefreshCw, TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Store } from 'lucide-react';
import { AdminAnalyticsAPI } from '@/lib/api/admin.api';
import AdminPageError from '@/components/admin/AdminPageError';

const MetricCard = ({ label, value, sub, trend }) => {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-black text-gray-900">{value ?? '—'}</p>
            {(sub || TrendIcon) && (
                <div className="flex items-center gap-1 mt-1">
                    {TrendIcon && <TrendIcon className={`w-3.5 h-3.5 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />}
                    {sub && <p className="text-xs text-gray-400">{sub}</p>}
                </div>
            )}
        </div>
    );
};

export default function AdminAnalyticsPage() {
    const [platform, setPlatform]   = useState(null);
    const [trends, setTrends]       = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [platformRes, trendsRes] = await Promise.all([
                AdminAnalyticsAPI.getPlatform(),
                AdminAnalyticsAPI.getTrends(),
            ]);
            setPlatform(platformRes?.data ?? platformRes);
            setTrends(trendsRes?.data ?? trendsRes);
        } catch (e) {
            setError(e.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const fmt$ = (n) => n != null ? `$${Number(n).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
    const fmtN = (n) => n != null ? Number(n).toLocaleString() : '—';

    return (
        <div className="space-y-6">
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
                <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
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
            ) : (
                <>
                    {/* Platform Overview */}
                    {platform && (
                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Platform Overview</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                <MetricCard label="Total Revenue"    value={fmt$(platform.totalRevenue)}   icon={DollarSign} />
                                <MetricCard label="Total Orders"     value={fmtN(platform.totalOrders)}    icon={ShoppingBag} />
                                <MetricCard label="Total Users"      value={fmtN(platform.totalUsers)}     icon={Users} />
                                <MetricCard label="Active Vendors"   value={fmtN(platform.activeVendors)}  icon={Store} />
                                <MetricCard label="Avg Order Value"  value={fmt$(platform.avgOrderValue)} />
                                <MetricCard label="Completed Orders" value={fmtN(platform.completedOrders)} />
                                <MetricCard label="Cancelled Orders" value={fmtN(platform.cancelledOrders)} />
                                <MetricCard label="New Users (30d)"  value={fmtN(platform.newUsersLast30Days ?? platform.newUsers)} />
                            </div>
                        </section>
                    )}

                    {/* Sales Trends */}
                    {trends && (
                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Sales Trends</h2>
                            {Array.isArray(trends) && trends.length > 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                    <div className="grid grid-cols-4 px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <span>Period</span>
                                        <span className="text-right">Revenue</span>
                                        <span className="text-right">Orders</span>
                                        <span className="text-right">Avg Value</span>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {trends.map((t, i) => (
                                            <div key={i} className="grid grid-cols-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                                                <span className="text-sm font-medium text-gray-900">{t.period ?? t.date ?? t.month ?? `Period ${i + 1}`}</span>
                                                <span className="text-sm text-right text-gray-700">{fmt$(t.revenue ?? t.totalRevenue)}</span>
                                                <span className="text-sm text-right text-gray-700">{fmtN(t.orders ?? t.totalOrders)}</span>
                                                <span className="text-sm text-right text-gray-700">{fmt$(t.avgOrderValue ?? t.averageValue)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* Trends is an object (summary) */
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {Object.entries(trends).map(([key, val]) => (
                                        <MetricCard
                                            key={key}
                                            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                                            value={typeof val === 'number' ? (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('value') ? fmt$(val) : fmtN(val)) : String(val)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {!platform && !trends && (
                        <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
                            <BarChart3 className="h-16 w-16 text-gray-200" />
                            <p className="text-gray-400">No analytics data available yet</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
