'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Star, LayoutDashboard, ChevronRight, Search, RefreshCw, Eye, EyeOff, Trash2 } from 'lucide-react';
import { AdminReviewsAPI } from '@/lib/api/admin.api';
import AdminPageError from '@/components/admin/AdminPageError';

const StarRating = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
            <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
        ))}
    </div>
);

export default function AdminReviewsPage() {
    const [reviews, setReviews]         = useState([]);
    const [stats, setStats]             = useState(null);
    const [filter, setFilter]           = useState('all');
    const [search, setSearch]           = useState('');
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = filter === 'hidden'
                ? await AdminReviewsAPI.getHidden()
                : await AdminReviewsAPI.getAll();
            const data = res?.data ?? res ?? [];
            setReviews(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await AdminReviewsAPI.getStats();
            setStats(res?.data ?? res);
        } catch (_) {}
    }, []);

    useEffect(() => { fetchReviews(); fetchStats(); }, [fetchReviews, fetchStats]);

    const doAction = async (id, fn, label) => {
        setActionLoading(p => ({ ...p, [id + label]: true }));
        try {
            await fn(id);
            await fetchReviews();
            await fetchStats();
        } catch (e) {
            alert(e.message || `Failed: ${label}`);
        } finally {
            setActionLoading(p => ({ ...p, [id + label]: false }));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Permanently delete this review? This cannot be undone.')) return;
        await doAction(id, AdminReviewsAPI.delete, 'delete');
    };

    const filtered = reviews.filter(r => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            r.comment?.toLowerCase().includes(q) ||
            r.customerName?.toLowerCase().includes(q) ||
            r.vendorName?.toLowerCase().includes(q) ||
            r.productName?.toLowerCase().includes(q)
        );
    });

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Reviews</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Review Moderation</h1>
                    <p className="text-gray-500 mt-1">Hide, restore, or remove inappropriate reviews</p>
                </div>
                <button onClick={() => { fetchReviews(); fetchStats(); }} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Reviews',  value: stats.totalReviews  ?? stats.total    ?? reviews.length },
                        { label: 'Avg Rating',     value: stats.averageRating != null ? Number(stats.averageRating).toFixed(1) : '—' },
                        { label: 'Hidden',         value: stats.hiddenReviews ?? stats.hidden   ?? 0 },
                        { label: 'This Month',     value: stats.thisMonth     ?? stats.monthly  ?? 0 },
                    ].map(s => (
                        <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <p className="text-2xl font-black text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reviews…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'hidden'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl capitalize transition-colors ${
                                    filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >{f === 'all' ? 'All Reviews' : 'Hidden'}</button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading reviews…</span>
                    </div>
                ) : error ? (
                    <AdminPageError error={error} onRetry={fetchReviews} />
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Star className="h-12 w-12 text-gray-200" />
                        <p className="text-sm text-gray-400">No reviews found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map(r => (
                            <div key={r.publicReviewId ?? r.id} className={`px-5 py-4 hover:bg-gray-50 transition-colors ${r.hidden ? 'opacity-60' : ''}`}>
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <StarRating rating={r.rating ?? 0} />
                                            {r.hidden && (
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full border border-gray-200">Hidden</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-900 mb-1">{r.comment || <span className="text-gray-400 italic">No comment</span>}</p>
                                        <p className="text-xs text-gray-400">
                                            {r.customerName || 'Unknown'} · {r.vendorName || r.productName || 'Unknown'} · {formatDate(r.createdAt)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {r.hidden ? (
                                            <button
                                                onClick={() => doAction(r.publicReviewId ?? r.id, AdminReviewsAPI.show, 'show')}
                                                disabled={!!actionLoading[(r.publicReviewId ?? r.id) + 'show']}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Restore
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => doAction(r.publicReviewId ?? r.id, AdminReviewsAPI.hide, 'hide')}
                                                disabled={!!actionLoading[(r.publicReviewId ?? r.id) + 'hide']}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <EyeOff className="w-3.5 h-3.5" />
                                                Hide
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(r.publicReviewId ?? r.id)}
                                            disabled={!!actionLoading[(r.publicReviewId ?? r.id) + 'delete']}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Delete review"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
