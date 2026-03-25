'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const TYPE_META = {
    ORDER_UPDATE:    { Icon: ShoppingBag, bg: 'bg-gray-100',   icon: 'text-gray-700',   label: 'Order',   href: '/orders'      },
    DELIVERY_UPDATE: { Icon: Truck,       bg: 'bg-blue-50',    icon: 'text-blue-600',   label: 'Delivery', href: '/orders'     },
    PAYMENT_SUCCESS: { Icon: CreditCard,  bg: 'bg-green-50',   icon: 'text-green-600',  label: 'Payment',  href: '/orders'     },
    PAYMENT_FAILED:  { Icon: CreditCard,  bg: 'bg-red-50',     icon: 'text-red-600',    label: 'Failed',   href: '/orders'     },
    PROMO:           { Icon: Tag,         bg: 'bg-orange-50',  icon: 'text-orange-500', label: 'Promo',    href: '/restaurants'},
    SYSTEM_ALERT:    { Icon: Bell,        bg: 'bg-gray-100',   icon: 'text-gray-400',   label: 'System',   href: '/profile'    },
};
const getMeta = (type) =>
    TYPE_META[type] ?? { Icon: Bell, bg: 'bg-gray-100', icon: 'text-gray-400', label: 'Notice', href: '/profile' };

const TYPE_FILTERS = [
    { key: 'ALL',            label: 'All'      },
    { key: 'ORDER_UPDATE',   label: 'Orders'   },
    { key: 'DELIVERY_UPDATE',label: 'Delivery' },
    { key: 'PAYMENT_SUCCESS',label: 'Payments' },
    { key: 'PROMO',          label: 'Promos'   },
    { key: 'SYSTEM_ALERT',   label: 'System'   },
];

const PAGE_SIZE = 20;

// ─── component ────────────────────────────────────────────────────────────────

export default function CustomerNotificationsPage() {
    const [all,            setAll]            = useState([]);   // master list
    const [loading,        setLoading]        = useState(true);
    const [loadingMore,    setLoadingMore]     = useState(false);
    const [filter,         setFilter]         = useState('ALL');
    const [showUnreadOnly, setShowUnreadOnly]  = useState(false);
    const [serverPage,     setServerPage]      = useState(0);
    const [hasMore,        setHasMore]         = useState(false);
    const [actionLoading,  setActionLoading]   = useState({});
    const [stats,          setStats]           = useState(null);

    // ── initial fetch ─────────────────────────────────────────────────────────
    const fetchPage = useCallback(async (page = 0, replace = true) => {
        page === 0 ? setLoading(true) : setLoadingMore(true);
        try {
            // Always load ALL types from server — filter client-side so tab
            // switching is instant. getAll returns Page<NotificationDto>.
            const [listRes, statsRes] = await Promise.allSettled([
                NotificationsAPI.getAll(page, PAGE_SIZE),
                page === 0 ? NotificationsAPI.getStats() : Promise.resolve(null),
            ]);

            if (listRes.status === 'fulfilled') {
                const payload  = listRes.value?.data;
                // Backend returns a Spring Page: { content: [...], totalElements, last }
                const content  = Array.isArray(payload?.content)
                    ? payload.content
                    : Array.isArray(payload) ? payload : [];   // fallback if not paginated

                setAll(prev => replace ? content : [...prev, ...content]);
                setHasMore(payload?.last === false);           // last===false → more pages
                setServerPage(page);
            }

            if (page === 0 && statsRes.status === 'fulfilled' && statsRes.value) {
                const s = statsRes.value?.data ?? statsRes.value;
                setStats(s);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => { fetchPage(0); }, [fetchPage]);

    // ── derived view — type filter + unread toggle applied client-side ─────────
    const filtered = all
        .filter(n => filter === 'ALL' || n.type === filter)
        .filter(n => !showUnreadOnly || !n.isRead)
        .sort((a, b) => {
            if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const unreadCount = all.filter(n => !n.isRead).length;

    // ── actions ───────────────────────────────────────────────────────────────
    const markRead = async (id) => {
        setAll(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
        setActionLoading(p => ({ ...p, [id + 'r']: true }));
        try { await NotificationsAPI.markRead(id); }
        catch { fetchPage(0); }
        finally { setActionLoading(p => ({ ...p, [id + 'r']: false })); }
    };

    const deleteOne = async (id) => {
        setAll(prev => prev.filter(n => n.notificationId !== id));
        setActionLoading(p => ({ ...p, [id + 'd']: true }));
        try { await NotificationsAPI.deleteOne(id); }
        catch { fetchPage(0); }
        finally { setActionLoading(p => ({ ...p, [id + 'd']: false })); }
    };

    const markAllRead = async () => {
        setAll(prev => prev.map(n => ({ ...n, isRead: true })));
        try { await NotificationsAPI.markAllRead(); }
        catch { fetchPage(0); }
    };

    const clearRead = async () => {
        setAll(prev => prev.filter(n => !n.isRead));
        try { await NotificationsAPI.deleteAllRead(); }
        catch { fetchPage(0); }
    };

    const handleFilterChange = (key) => {
        setFilter(key);
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-5">

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
                        <p className="text-sm text-gray-500 mt-0.5">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchPage(0)}
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
                                <span className="hidden sm:inline">Mark all read</span>
                                <span className="sm:hidden">Read all</span>
                            </button>
                        )}
                        {all.some(n => n.isRead) && (
                            <button
                                onClick={clearRead}
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear read
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                {!loading && stats && (
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                            { label: 'Total',  value: stats.totalNotifications  ?? all.length },
                            { label: 'Unread', value: stats.unreadNotifications ?? unreadCount },
                            { label: 'Read',   value: stats.readNotifications   ?? (all.length - unreadCount) },
                        ].map(s => (
                            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
                                <p className="text-xl sm:text-2xl font-black text-gray-900">{s.value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Filters ─────────────────────────────────────────────────── */}
                <div className="space-y-2">
                    {/* Type filters — 2 rows on mobile, single row on sm+ */}
                    <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                        {TYPE_FILTERS.map(f => {
                            const count = f.key !== 'ALL'
                                ? all.filter(n => n.type === f.key).length
                                : null;
                            return (
                                <button
                                    key={f.key}
                                    onClick={() => handleFilterChange(f.key)}
                                    className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded-xl transition-colors ${
                                        filter === f.key
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {f.label}
                                    {count > 0 && (
                                        <span className={`text-[10px] font-bold px-1 py-0.5 rounded-full leading-none ${
                                            filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Unread toggle + result count */}
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
                        </p>
                        <button
                            onClick={() => setShowUnreadOnly(p => !p)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                                showUnreadOnly
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${showUnreadOnly ? 'bg-white' : 'bg-gray-400'}`} />
                            Unread only
                        </button>
                    </div>
                </div>

                {/* ── List ─────────────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Loading…</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Bell className="w-12 h-12 text-gray-200" />
                            <p className="text-sm font-semibold text-gray-500">
                                {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
                            </p>
                            {showUnreadOnly && (
                                <button
                                    onClick={() => setShowUnreadOnly(false)}
                                    className="text-xs text-gray-500 underline"
                                >
                                    Show all
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filtered.map(n => {
                                const meta    = getMeta(n.type);
                                const { Icon, bg, icon } = meta;
                                const isUnread = !n.isRead;
                                return (
                                    <div
                                        key={n.notificationId}
                                        className={`group flex items-start gap-3 px-4 py-3.5 transition-colors ${
                                            isUnread ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${bg}`}>
                                            <Icon className={`w-4 h-4 ${icon}`} />
                                        </div>

                                        {/* Content — tappable area */}
                                        <Link
                                            href={meta.href}
                                            onClick={() => isUnread && markRead(n.notificationId)}
                                            className="flex-1 min-w-0"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                                                    <p className="text-sm font-semibold text-gray-900 leading-snug">
                                                        {n.title}
                                                    </p>
                                                    {isUnread && (
                                                        <span className="w-2 h-2 rounded-full bg-gray-900 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                                                    {relativeTime(n.createdAt)}
                                                </p>
                                            </div>
                                            {n.message && (
                                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                                                    {n.message}
                                                </p>
                                            )}
                                            <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full ${bg} ${icon}`}>
                                                {meta.label}
                                            </span>
                                        </Link>

                                        {/* Row actions — visible on hover (desktop) or always on mobile */}
                                        <div className="flex flex-col items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            {isUnread && (
                                                <button
                                                    onClick={() => markRead(n.notificationId)}
                                                    disabled={!!actionLoading[n.notificationId + 'r']}
                                                    title="Mark read"
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
                    {!loading && hasMore && (
                        <div className="px-4 py-4 border-t border-gray-100 text-center">
                            <button
                                onClick={() => fetchPage(serverPage + 1, false)}
                                disabled={loadingMore}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                            >
                                {loadingMore
                                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading…</>
                                    : 'Load more'
                                }
                            </button>
                        </div>
                    )}

                    {/* Mobile clear-read footer */}
                    {!loading && all.some(n => n.isRead) && (
                        <div className="px-4 py-3 border-t border-gray-100 sm:hidden">
                            <button
                                onClick={clearRead}
                                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear all read notifications
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
