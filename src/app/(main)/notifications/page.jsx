'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Bell, ShoppingBag, Truck, CreditCard, Tag,
    RefreshCw, CheckCheck, Trash2, Home, ChevronRight, X,
    ArrowRight, Package, Info,
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

const fullDate = (dateVal) => {
    if (!dateVal) return '';
    return new Date(dateVal).toLocaleString('en-CA', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const TYPE_META = {
    ORDER_UPDATE:    { Icon: ShoppingBag, bg: 'bg-orange-50',  accent: 'bg-orange-400',  icon: 'text-orange-500', label: 'Order',    baseHref: '/orders'      },
    NEW_ORDER:       { Icon: ShoppingBag, bg: 'bg-orange-50',  accent: 'bg-orange-400',  icon: 'text-orange-500', label: 'Order',    baseHref: '/orders'      },
    ORDER:           { Icon: ShoppingBag, bg: 'bg-orange-50',  accent: 'bg-orange-400',  icon: 'text-orange-500', label: 'Order',    baseHref: '/orders'      },
    DELIVERY_UPDATE: { Icon: Truck,       bg: 'bg-blue-50',    accent: 'bg-blue-400',    icon: 'text-blue-600',   label: 'Delivery', baseHref: '/orders'      },
    DELIVERY:        { Icon: Truck,       bg: 'bg-blue-50',    accent: 'bg-blue-400',    icon: 'text-blue-600',   label: 'Delivery', baseHref: '/orders'      },
    PAYMENT_SUCCESS: { Icon: CreditCard,  bg: 'bg-green-50',   accent: 'bg-green-400',   icon: 'text-green-600',  label: 'Payment',  baseHref: '/orders'      },
    PAYMENT_FAILED:  { Icon: CreditCard,  bg: 'bg-red-50',     accent: 'bg-red-400',     icon: 'text-red-600',    label: 'Failed',   baseHref: '/orders'      },
    PAYMENT_FAILURE: { Icon: CreditCard,  bg: 'bg-red-50',     accent: 'bg-red-400',     icon: 'text-red-600',    label: 'Failed',   baseHref: '/orders'      },
    PAYMENT:         { Icon: CreditCard,  bg: 'bg-green-50',   accent: 'bg-green-400',   icon: 'text-green-600',  label: 'Payment',  baseHref: '/orders'      },
    PROMO:           { Icon: Tag,         bg: 'bg-amber-50',   accent: 'bg-amber-400',   icon: 'text-amber-600',  label: 'Promo',    baseHref: '/restaurants' },
    PROMOTION:       { Icon: Tag,         bg: 'bg-amber-50',   accent: 'bg-amber-400',   icon: 'text-amber-600',  label: 'Promo',    baseHref: '/restaurants' },
    SYSTEM_ALERT:    { Icon: Info,        bg: 'bg-gray-100',   accent: 'bg-gray-300',    icon: 'text-gray-500',   label: 'System',   baseHref: null           },
    SYSTEM:          { Icon: Info,        bg: 'bg-gray-100',   accent: 'bg-gray-300',    icon: 'text-gray-500',   label: 'System',   baseHref: null           },
};

const getMeta = (notification) => {
    const meta = TYPE_META[notification?.type];
    if (!meta) return { Icon: Bell, bg: 'bg-gray-100', accent: 'bg-gray-300', icon: 'text-gray-400', label: 'Notice', href: null };
    // Use the base route only — deep-linking to /order-confirmation/:id can break
    // because relatedEntityId may not match the publicOrderId the page expects.
    return { ...meta, href: meta.baseHref };
};

const TYPE_FILTERS = [
    { key: 'ALL',             label: 'All'      },
    { key: 'ORDER_UPDATE',    label: 'Orders'   },
    { key: 'DELIVERY_UPDATE', label: 'Delivery' },
    { key: 'PAYMENT_SUCCESS', label: 'Payments' },
    { key: 'PROMO',           label: 'Promos'   },
    { key: 'SYSTEM_ALERT',    label: 'System'   },
];

const PAGE_SIZE = 20;

// ─── Notification detail modal ────────────────────────────────────────────────

function NotificationModal({ notification, onClose, onDelete }) {
    if (!notification) return null;
    const meta = getMeta(notification);
    const { Icon, bg, accent, icon, href, label } = meta;
    const isUnread = !notification.isRead;

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl z-10 overflow-hidden">

                {/* Colour strip */}
                <div className={`h-1 w-full ${accent}`} />

                {/* Header */}
                <div className="flex items-start justify-between px-5 pt-5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
                            <Icon className={`w-5 h-5 ${icon}`} />
                        </div>
                        <div>
                            <span className={`text-[11px] font-bold uppercase tracking-wide ${icon}`}>
                                {label}
                            </span>
                            {isUnread && (
                                <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-900 text-white">
                                    New
                                </span>
                            )}
                            <p className="text-[11px] text-gray-400 mt-0.5">{fullDate(notification.createdAt)}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 pb-5 space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 leading-snug">
                        {notification.title}
                    </h3>
                    {notification.message && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {notification.message}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 px-5 pb-6 pt-1 border-t border-gray-100">
                    {href ? (
                        <Link
                            href={href}
                            onClick={onClose}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors"
                        >
                            View details
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    ) : (
                        <div className="flex-1" />
                    )}
                    <button
                        onClick={() => { onDelete(notification.notificationId); onClose(); }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerNotificationsPage() {
    const [all,            setAll]           = useState([]);
    const [loading,        setLoading]       = useState(true);
    const [loadingMore,    setLoadingMore]    = useState(false);
    const [filter,         setFilter]        = useState('ALL');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [serverPage,     setServerPage]    = useState(0);
    const [hasMore,        setHasMore]       = useState(false);
    const [actionLoading,  setActionLoading] = useState({});
    const [stats,          setStats]         = useState(null);
    const [selected,       setSelected]      = useState(null);

    const fetchPage = useCallback(async (page = 0, replace = true) => {
        page === 0 ? setLoading(true) : setLoadingMore(true);
        try {
            const [listRes, statsRes] = await Promise.allSettled([
                NotificationsAPI.getAll(page, PAGE_SIZE),
                page === 0 ? NotificationsAPI.getStats() : Promise.resolve(null),
            ]);
            if (listRes.status === 'fulfilled') {
                const payload = listRes.value?.data;
                const content = Array.isArray(payload?.content)
                    ? payload.content
                    : Array.isArray(payload) ? payload : [];
                setAll(prev => replace ? content : [...prev, ...content]);
                setHasMore(payload?.last === false);
                setServerPage(page);
            }
            if (page === 0 && statsRes.status === 'fulfilled' && statsRes.value) {
                setStats(statsRes.value?.data ?? statsRes.value);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => { fetchPage(0); }, [fetchPage]);

    const filtered = all
        .filter(n => filter === 'ALL' || n.type === filter)
        .filter(n => !showUnreadOnly || !n.isRead)
        .sort((a, b) => {
            if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const unreadCount = all.filter(n => !n.isRead).length;

    const markRead = useCallback(async (id) => {
        setAll(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
        setSelected(prev => prev?.notificationId === id ? { ...prev, isRead: true } : prev);
        setActionLoading(p => ({ ...p, [id + 'r']: true }));
        try { await NotificationsAPI.markRead(id); }
        catch { fetchPage(0); }
        finally { setActionLoading(p => ({ ...p, [id + 'r']: false })); }
    }, [fetchPage]);

    const deleteOne = useCallback(async (id) => {
        setAll(prev => prev.filter(n => n.notificationId !== id));
        setActionLoading(p => ({ ...p, [id + 'd']: true }));
        try { await NotificationsAPI.deleteOne(id); }
        catch { fetchPage(0); }
        finally { setActionLoading(p => ({ ...p, [id + 'd']: false })); }
    }, [fetchPage]);

    const markAllRead = async () => {
        setAll(prev => prev.map(n => ({ ...n, isRead: true })));
        try { await NotificationsAPI.markAllRead(); } catch { fetchPage(0); }
    };

    const clearRead = async () => {
        setAll(prev => prev.filter(n => !n.isRead));
        try { await NotificationsAPI.deleteAllRead(); } catch { fetchPage(0); }
    };

    const openNotification = (n) => {
        setSelected(n);
        if (!n.isRead) markRead(n.notificationId);
    };

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
                            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'You\'re all caught up'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchPage(0)}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Mark all read
                            </button>
                        )}
                        {all.some(n => n.isRead) && (
                            <button
                                onClick={clearRead}
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear read
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats cards */}
                {!loading && stats && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Total',  value: stats.totalNotifications  ?? all.length,              color: 'text-gray-900' },
                            { label: 'Unread', value: stats.unreadNotifications ?? unreadCount,             color: 'text-orange-600' },
                            { label: 'Read',   value: stats.readNotifications   ?? (all.length - unreadCount), color: 'text-green-600' },
                        ].map(s => (
                            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
                                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="space-y-3">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {TYPE_FILTERS.map(f => {
                            const count = f.key !== 'ALL' ? all.filter(n => n.type === f.key).length : null;
                            return (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                                        filter === f.key
                                            ? 'bg-gray-900 text-white shadow-sm'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {f.label}
                                    {count > 0 && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                                            filter === f.key ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                                        }`}>{count}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
                        </p>
                        <button
                            onClick={() => setShowUnreadOnly(p => !p)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                                showUnreadOnly
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${showUnreadOnly ? 'bg-white' : 'bg-gray-400'}`} />
                            Unread only
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Loading notifications…</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                                <Bell className="w-7 h-7 text-gray-300" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-700">
                                    {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {showUnreadOnly ? 'All caught up — nothing new to read.' : 'Order updates and alerts will appear here.'}
                                </p>
                            </div>
                            {showUnreadOnly && (
                                <button onClick={() => setShowUnreadOnly(false)} className="text-xs font-semibold text-orange-600 hover:underline">
                                    Show all notifications
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filtered.map(n => {
                                const meta     = getMeta(n);
                                const { Icon, bg, icon, href, label } = meta;
                                const isUnread = !n.isRead;
                                return (
                                    <button
                                        key={n.notificationId}
                                        onClick={() => openNotification(n)}
                                        className={`group w-full text-left flex items-start gap-3 px-4 py-4 transition-colors ${
                                            isUnread ? 'bg-orange-50/40 hover:bg-orange-50/70' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        {/* Unread indicator bar */}
                                        <div className={`absolute left-0 w-0.5 h-full rounded-r ${isUnread ? 'bg-orange-400' : 'bg-transparent'}`} />

                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${bg}`}>
                                            <Icon className={`w-4.5 h-4.5 ${icon}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-0.5">
                                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                    <p className={`text-sm leading-snug truncate ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                                        {n.title}
                                                    </p>
                                                    {isUnread && (
                                                        <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">
                                                    {relativeTime(n.createdAt)}
                                                </p>
                                            </div>
                                            {n.message && (
                                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 text-left">
                                                    {n.message}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full ${bg} ${icon}`}>
                                                    {label}
                                                </span>
                                                {href && (
                                                    <span className="text-[10px] text-gray-400 group-hover:text-orange-500 font-medium transition-colors">
                                                        Tap to view details
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete */}
                                        <div
                                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={e => { e.stopPropagation(); deleteOne(n.notificationId); }}
                                        >
                                            <span className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors block">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </span>
                                        </div>
                                    </button>
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
                                    : 'Load more notifications'
                                }
                            </button>
                        </div>
                    )}

                    {/* Mobile clear-read footer */}
                    {!loading && all.some(n => n.isRead) && (
                        <div className="px-4 py-3 border-t border-gray-100 sm:hidden">
                            <button
                                onClick={clearRead}
                                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear all read notifications
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* Notification detail modal */}
            {selected && (
                <NotificationModal
                    notification={selected}
                    onClose={() => setSelected(null)}
                    onDelete={deleteOne}
                />
            )}
        </div>
    );
}
