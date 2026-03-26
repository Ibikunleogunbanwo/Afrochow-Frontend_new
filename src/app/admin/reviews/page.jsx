'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Star, LayoutDashboard, ChevronRight, Search,
    RefreshCw, Eye, EyeOff, Trash2, CalendarDays,
} from 'lucide-react';
import { AdminReviewsAPI } from '@/lib/api/admin.api';
import AdminPageError from '@/components/admin/AdminPageError';
import { AdminTableRoot, AdminTableHeader, AdminTableRow, AdminAvatar } from '@/components/admin/AdminTable';
import Pagination from '@/components/admin/Pagination';

const PAGE_SIZE = 15;

const StarRating = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
        ))}
    </div>
);

// Resolve the correct ID field from whatever the backend returns
const resolveId = (r) => r.reviewId ?? r.publicReviewId ?? r.id;

export default function AdminReviewsPage() {
    const [reviews, setReviews]         = useState([]);
    const [stats, setStats]             = useState(null);
    const [filter, setFilter]           = useState('all'); // 'all' | 'hidden'
    const [search, setSearch]           = useState('');
    const [dateFrom, setDateFrom]       = useState('');
    const [dateTo, setDateTo]           = useState('');
    const [page, setPage]               = useState(1);
    const [showDatePicker, setShowDatePicker] = useState(false);
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
        if (!id && id !== 0) {
            alert('Unable to perform action: review ID is missing.');
            return;
        }
        setActionLoading(p => ({ ...p, [id + label]: true }));
        try {
            await fn(id);
            // Optimistic update — flip isVisible flag or remove the row
            if (label === 'hide') {
                setReviews(prev => prev.map(r =>
                    resolveId(r) === id ? { ...r, isVisible: false } : r
                ));
            } else if (label === 'show') {
                if (filter === 'hidden') {
                    setReviews(prev => prev.filter(r => resolveId(r) !== id));
                } else {
                    setReviews(prev => prev.map(r =>
                        resolveId(r) === id ? { ...r, isVisible: true } : r
                    ));
                }
            } else if (label === 'delete') {
                setReviews(prev => prev.filter(r => resolveId(r) !== id));
            }
            await fetchStats();
        } catch (e) {
            alert(e.message || `Failed: ${label}`);
            await fetchReviews(); // revert to server truth on error
        } finally {
            setActionLoading(p => ({ ...p, [id + label]: false }));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Permanently delete this review? This cannot be undone.')) return;
        await doAction(id, AdminReviewsAPI.delete, 'delete');
    };

    const clearDateFilter = () => { setDateFrom(''); setDateTo(''); setShowDatePicker(false); setPage(1); };

    const filtered = reviews.filter(r => {
        // text search
        if (search) {
            const q = search.toLowerCase();
            const match =
                r.comment?.toLowerCase().includes(q) ||
                r.userName?.toLowerCase().includes(q) ||
                r.restaurantName?.toLowerCase().includes(q) ||
                r.productName?.toLowerCase().includes(q);
            if (!match) return false;
        }
        // date filter
        if (dateFrom || dateTo) {
            const created = r.createdAt ? new Date(r.createdAt) : null;
            if (!created) return false;
            if (dateFrom && created < new Date(dateFrom)) return false;
            if (dateTo) {
                const toEnd = new Date(dateTo);
                toEnd.setHours(23, 59, 59, 999);
                if (created > toEnd) return false;
            }
        }
        return true;
    });

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';

    const dateFilterActive = !!(dateFrom || dateTo);

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
                <button
                    onClick={() => { fetchReviews(); fetchStats(); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Total Reviews — clickable filter */}
                <button
                    onClick={() => { setFilter('all'); clearDateFilter(); setPage(1); }}
                    className={`bg-white border rounded-2xl p-5 shadow-sm text-left transition-all hover:shadow-md ${
                        filter === 'all' && !dateFilterActive ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200'
                    }`}
                >
                    <p className="text-2xl font-black text-gray-900">
                        {search || dateFilterActive
                            ? filtered.length
                            : stats ? (stats.totalReviews ?? stats.total ?? reviews.length) : reviews.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {search || dateFilterActive ? 'Matching Reviews' : 'Total Reviews'}
                    </p>
                </button>

                {/* Hidden — clickable filter */}
                <button
                    onClick={() => { setFilter('hidden'); clearDateFilter(); setPage(1); }}
                    className={`bg-white border rounded-2xl p-5 shadow-sm text-left transition-all hover:shadow-md ${
                        filter === 'hidden' ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200'
                    }`}
                >
                    <p className="text-2xl font-black text-gray-900">
                        {stats ? (stats.hiddenReviews ?? stats.hidden ?? 0) : 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Hidden</p>
                </button>

                {/* Date filter card */}
                <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                    dateFilterActive ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200'
                }`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4 text-gray-500" />
                            <p className="text-xs font-semibold text-gray-700">Filter by Date</p>
                        </div>
                        {dateFilterActive && (
                            <button
                                onClick={clearDateFilter}
                                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                            >Clear</button>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
                            placeholder="From"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => { setDateTo(e.target.value); setPage(1); }}
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
                            placeholder="To"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by reviewer, store, or product…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                    <div className="flex gap-2">
                        {[
                            { key: 'all',    label: 'All Reviews' },
                            { key: 'hidden', label: 'Hidden' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => { setFilter(f.key); setPage(1); }}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                                    filter === f.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >{f.label}</button>
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
                    <AdminTableRoot>
                        <AdminTableHeader columns={[
                            { label: 'Reviewer', className: 'w-40 shrink-0' },
                            { label: 'Review',   className: 'flex-1 min-w-[200px]' },
                            { label: 'Target',   className: 'w-36 shrink-0' },
                            { label: 'Date',     className: 'w-28 shrink-0' },
                            { label: 'Actions',  className: 'w-32 shrink-0' },
                        ]} />
                        {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(r => {
                            const rid = resolveId(r);
                            const isHidden = r.isVisible === false;
                            const initials = (r.userName || 'U').slice(0, 2).toUpperCase();
                            return (
                                <AdminTableRow
                                    key={rid ?? Math.random()}
                                    className={isHidden ? 'opacity-60' : ''}
                                >
                                    {/* Reviewer */}
                                    <div className="w-40 shrink-0 flex items-center gap-2.5 overflow-hidden">
                                        <AdminAvatar initials={initials} size="sm" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-900 truncate">
                                                {r.userName || 'Unknown'}
                                            </p>
                                            <StarRating rating={r.rating ?? 0} />
                                        </div>
                                    </div>

                                    {/* Comment + hidden badge */}
                                    <div className="flex-1 min-w-[200px] overflow-hidden">
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                            {isHidden && (
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                                                    Hidden
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-700 line-clamp-2">
                                            {r.comment || <span className="text-gray-400 italic">No comment</span>}
                                        </p>
                                    </div>

                                    {/* Target (store / product) */}
                                    <div className="w-36 shrink-0 text-xs text-gray-500 overflow-hidden">
                                        {r.restaurantName && (
                                            <p className="truncate">🏪 {r.restaurantName}</p>
                                        )}
                                        {r.productName && (
                                            <p className="truncate">📦 {r.productName}</p>
                                        )}
                                        {!r.restaurantName && !r.productName && (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div className="w-28 shrink-0 text-xs text-gray-500">
                                        {formatDate(r.createdAt)}
                                    </div>

                                    {/* Actions */}
                                    <div className="w-32 shrink-0 flex items-center gap-1.5">
                                        {isHidden ? (
                                            <button
                                                onClick={() => doAction(rid, AdminReviewsAPI.show, 'show')}
                                                disabled={!!actionLoading[rid + 'show']}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Restore
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => doAction(rid, AdminReviewsAPI.hide, 'hide')}
                                                disabled={!!actionLoading[rid + 'hide']}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <EyeOff className="w-3.5 h-3.5" />
                                                Hide
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(rid)}
                                            disabled={!!actionLoading[rid + 'delete']}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Delete review"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </AdminTableRow>
                            );
                        })}
                    </AdminTableRoot>
                )}
                {!loading && !error && filtered.length > PAGE_SIZE && (
                    <Pagination
                        page={page}
                        totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
                        totalItems={filtered.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </div>
    );
}
