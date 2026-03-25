'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Bell, ShoppingBag, Truck, CreditCard, Tag,
    RefreshCw, CheckCheck, Trash2, Home, ChevronRight,
} from 'lucide-react';
import { NotificationsAPI } from '@/lib/api/notifications.api';

// ─── helpers ──────────────────────────────────────────────────────────────────

const relativeTime = (dateVal) => {
    if (!dateVal) return '';
    const diff  = Date.now() - new Date(dateVal).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  <  1) return 'just now';
    if (mins  < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
};

const TYPE_META = {
    ORDER_UPDATE:    { Icon: ShoppingBag, bg: 'bg-gray-100',    icon: 'text-gray-700',    label: 'Order Update',   href: '/orders'      },
    DELIVERY_UPDATE: { Icon: Truck,       bg: 'bg-blue-50',     icon: 'text-blue-600',    label: 'Delivery',       href: '/orders'      },
    PAYMENT_SUCCESS: { Icon: CreditCard,  bg: 'bg-green-50',    icon: 'text-green-600',   label: 'Payment',        href: '/orders'      },
    PAYMENT_FAILED:  { Icon: CreditCard,  bg: 'bg-red-50',      icon: 'text-red-600',     label: 'Payment Failed', href: '/orders'      },
    PROMO:           { Icon: Tag,         bg: 'bg-orange-50',   icon: 'text-orange-500',  label: 'Promotion',      href: '/restaurants' },
    SYSTEM_ALERT:    { Icon: Bell,        bg: 'bg-gray-100',    icon: 'text-gray-400',    label: 'System',         href: '/profile'     },
};

const getMeta = (type) => TYPE_META[type] ?? { Icon: Bell, bg: 'bg-gray-100', icon: 'text-gray-400', label: 'Notification', href: '/profile' };

const FILTERS = [
    { key: 'ALL',            label: 'All' },
    { key: 'ORDER_UPDATE',   label: 'Orders' },
    { key: 'DELIVERY_UPDATE',label: 'Delivery' },
    { key: 'PAYMENT_SUCCESS',label: 'Payments' },
    { key: 'PROMO',          label: 'Promos' },
    { key: 'SYSTEM_ALERT',   label: 'System' },
];

const PAGE_SIZE = 20;

// ─── component ────────────────────────────────────────────────────────────────

export default function CustomerNotificationsPage() {
    const [all,           setAll]           = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [filter,        setFilter]        = useState('ALL');
    const [showUnreadOnly,setShowUnreadOnly] = useState(false);
    const [page,          setPage]          = useState(0);
    const [actionLoading, setActionLoading] = useState({});
    const [stats,         setStats]         = useState(null);

    // ── fetch ─────────────────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [listRes, statsRes] = await Promise.allSettled([
                NotificationsAPI.getAll(),
                NotificationsAPI.getStats(),
            ]);
            if (listRes.status === 'fulfilled') {
                const data = listRes.value?.data ?? listRes.value ?? [];
                setAll(Array.isArray(data) ? data : []);
            }
            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value?.data ?? statsRes.value ?? null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── derived list ──────────────────────────────────────────────────────────
    const filtered = all
        .filter(n => filter === 'ALL' || n.type === filter)
        .filter(n => !showUnreadOnly || !n.isRead)
        .sort((a, b) => {
            if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const paginated   = filtered.slice(0, (page + 1) * PAGE_SIZE);
    const hasMore     = paginated.length < filtered.length;
    const unreadCount = all.filter(n => !n.isRead).length;

    // ── actions ───────────────────────────────────────────────────────────────
    const markRead = async (id) => {
        setAll(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
        setActionLoading(p => ({ ...p, [id + 'r']: true }));
        try { await NotificationsAPI.markRead(id); }
        catch { await fetchAll(); }
        finally { setActionLoading(p => ({ ...p, [id + 'r']: false })); }
    };

    const deleteOne = async (id) => {
        setAll(prev => prev.filter(n => n.notificationId !== id));
        setActionLoading(p => ({ ...p, [id + 'd']: true }));
        try { await NotificationsAPI.deleteOne(id); }
        catch { await fetchAll(); }
        finally { setActionLoading(p => ({ ...p, [id + 'd']: false })); }
    };

    const markAllRead = async () => {
        setAll(prev => prev.map(n => ({ ...n, isRead: true })));
        try { await NotificationsAPI.markAllRead(); }
        catch { await fetchAll(); }
    };

    const clearRead = async () => {
        const readIds = all.filter(n => n.isRead).map(n => n.notificationId);
        setAll(prev => prev.filter(n => !n.isRead));
        for (const id of readIds) {
            try { await NotificationsAPI.deleteOne(id); } catch { /* best effort */ }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Link href="/" className="flex items-center gap-1 hover:text-gray-900 font-medium transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        Home
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <span className="font-semibold text-gray-900">Notifications</span>
                </nav>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchAll}
                            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Mark all read
                            </button>
                        )}
                        {all.some(n => n.isRead) && (
                            <button
                                onClick={clearRead}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear read
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Total',  value: stats.total   ?? all.length },
                            { label: 'Unread', value: stats.unread  ?? unreadCount },
                            { label: 'Read',   value: stats.read    ?? (all.length - unreadCount) },
                        ].map(s => (
                            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
                                <p className="text-xl font-black text-gray-900">{s.value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => { setFilter(f.key); setPage(0); }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                                filter === f.key
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                    <button
                        onClick={() => { setShowUnreadOnly(p => !p); setPage(0); }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ml-auto ${
                            showUnreadOnly
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        Unread only
                    </button>
                </div>

                {/* List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Loading…</span>
                        </div>
                    ) : paginated.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Bell className="w-12 h-12 text-gray-200" />
                            <p className="text-sm text-gray-400">
                                {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {paginated.map(n => {
                                const meta = getMeta(n.type);
                                const { Icon, bg, icon } = meta;
                                const isUnread = !n.isRead;
                                return (
                                    <div
                                        key={n.notificationId}
                                        className={`group flex items-start gap-4 px-5 py-4 transition-colors ${
                                            isUnread ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${bg}`}>
                                            <Icon className={`w-5 h-5 ${icon}`} />
                                        </div>

                                        {/* Content */}
                                        <Link
                                            href={meta.href}
                                            onClick={() => isUnread && markRead(n.notificationId)}
                                            className="flex-1 min-w-0"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                                                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 rounded-full">
                                                        {meta.label}
                                                    </span>
                                                    {isUnread && (
                                                        <span className="w-2 h-2 rounded-full bg-gray-900 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">
                                                    {relativeTime(n.createdAt)}
                                                </p>
                                            </div>
                                            {n.message && (
                                                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                                                    {n.message}
                                                </p>
                                            )}
                                        </Link>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isUnread && (
                                                <button
                                                    onClick={() => markRead(n.notificationId)}
                                                    disabled={!!actionLoading[n.notificationId + 'r']}
                                                    title="Mark as read"
                                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <CheckCheck className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteOne(n.notificationId)}
                                                disabled={!!actionLoading[n.notificationId + 'd']}
                                                title="Delete"
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Load more */}
                    {hasMore && (
                        <div className="px-5 py-4 border-t border-gray-100 text-center">
                            <button
                                onClick={() => setPage(p => p + 1)}
                                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Load more ({filtered.length - paginated.length} remaining)
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
