"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Bell, ShoppingBag, Star, Truck, CreditCard,
    CheckCheck, Trash2, RefreshCcw, Filter, ChevronDown,
} from "lucide-react";
import { NotificationsAPI } from "@/lib/api/notifications.api";

// ─── helpers ──────────────────────────────────────────────────────────────────

const relativeTime = (dateVal) => {
    if (!dateVal) return "";
    const diff = Date.now() - new Date(dateVal).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  <  1)  return "just now";
    if (mins  < 60)  return `${mins} min ago`;
    if (hours < 24)  return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    if (days  <  7)  return `${days} day${days > 1 ? "s" : ""} ago`;
    return new Date(dateVal).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const TYPE_CONFIG = {
    NEW_ORDER:      { Icon: ShoppingBag, bg: "bg-gray-100",  icon: "text-gray-600",  label: "New Order"       },
    ORDER_UPDATE:   { Icon: ShoppingBag, bg: "bg-gray-100",  icon: "text-gray-600",  label: "Order Update"    },
    DELIVERY_UPDATE:{ Icon: Truck,       bg: "bg-gray-100",  icon: "text-gray-600",  label: "Delivery"        },
    PAYMENT_SUCCESS:{ Icon: CreditCard,  bg: "bg-gray-100",  icon: "text-gray-600",  label: "Payment"         },
    PROMO:          { Icon: Bell,        bg: "bg-gray-100",  icon: "text-gray-600",  label: "Promo"           },
    SYSTEM_ALERT:   { Icon: Bell,        bg: "bg-gray-100",  icon: "text-gray-500",  label: "System"          },
};
const DEFAULT_CONFIG = { Icon: Bell, bg: "bg-gray-100", icon: "text-gray-400", label: "Notification" };

const hrefFor = (dto) => {
    if (["NEW_ORDER","ORDER_UPDATE","DELIVERY_UPDATE"].includes(dto.type)) return `/vendor/orders${dto.relatedEntityId ? `?highlight=${dto.relatedEntityId}` : ""}`;
    if (dto.type === "PAYMENT_SUCCESS") return "/vendor/orders";
    if (dto.relatedEntityType === "REVIEW") return "/vendor/reviews";
    return "#";
};

const FILTER_OPTIONS = [
    { value: "all",    label: "All" },
    { value: "unread", label: "Unread" },
    { value: "NEW_ORDER",       label: "New Orders" },
    { value: "ORDER_UPDATE",    label: "Order Updates" },
    { value: "DELIVERY_UPDATE", label: "Delivery" },
    { value: "PAYMENT_SUCCESS", label: "Payments" },
    { value: "SYSTEM_ALERT",    label: "System" },
];

// ─── page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [stats,         setStats]         = useState(null);
    const [loading,       setLoading]       = useState(true);
    const [filter,        setFilter]        = useState("all");
    const [page,          setPage]          = useState(0);
    const [totalPages,    setTotalPages]    = useState(0);
    const [filterOpen,    setFilterOpen]    = useState(false);
    const PAGE_SIZE = 20;

    const fetchPage = useCallback(async (p = 0, activeFilter = filter) => {
        setLoading(true);
        try {
            let res;
            if (activeFilter === "unread") {
                res = await NotificationsAPI.getUnread();
                if (res?.success) {
                    setNotifications(res.data ?? []);
                    setTotalPages(1);
                }
            } else if (activeFilter !== "all") {
                res = await NotificationsAPI.getByType(activeFilter);
                if (res?.success) {
                    setNotifications(res.data ?? []);
                    setTotalPages(1);
                }
            } else {
                res = await NotificationsAPI.getAll(p, PAGE_SIZE);
                if (res?.success) {
                    const pageData = res.data;
                    setNotifications(pageData?.content ?? pageData ?? []);
                    setTotalPages(pageData?.totalPages ?? 1);
                }
            }

            // Refresh stats
            const statsRes = await NotificationsAPI.getStats();
            if (statsRes?.success) setStats(statsRes.data);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchPage(0, filter);
        setPage(0);
    }, [filter]);

    const handleMarkRead = async (id) => {
        setNotifications((prev) => prev.map((n) => n.notificationId === id ? { ...n, isRead: true } : n));
        try { await NotificationsAPI.markRead(id); } catch { fetchPage(page); }
    };

    const handleMarkAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        try {
            await NotificationsAPI.markAllRead();
            setStats((s) => s ? { ...s, unreadNotifications: 0 } : s);
        } catch { fetchPage(page); }
    };

    const handleDelete = async (id) => {
        setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
        try { await NotificationsAPI.deleteOne(id); } catch { fetchPage(page); }
    };

    const handleClearRead = async () => {
        setNotifications((prev) => prev.filter((n) => !n.isRead));
        try { await NotificationsAPI.deleteAllRead(); } catch { fetchPage(page); }
    };

    const unreadCount = stats?.unreadNotifications ?? notifications.filter((n) => !n.isRead).length;
    const activeFilterLabel = FILTER_OPTIONS.find((f) => f.value === filter)?.label ?? "All";

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    {unreadCount > 0 && (
                        <p className="text-sm text-gray-500 mt-0.5">
                            {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                    {notifications.some((n) => n.isRead) && (
                        <button
                            onClick={handleClearRead}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear read
                        </button>
                    )}
                </div>
            </div>

            {/* ── Stats row ───────────────────────────────────────────── */}
            {stats && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: "Total",  value: stats.totalNotifications,  color: "text-gray-900" },
                        { label: "Unread", value: stats.unreadNotifications, color: "text-gray-900" },
                        { label: "Read",   value: stats.readNotifications,   color: "text-green-600" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                            <p className={`text-2xl font-bold ${color}`}>{value ?? 0}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Filter ──────────────────────────────────────────────── */}
            <div className="relative mb-4">
                <button
                    onClick={() => setFilterOpen((o) => !o)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <Filter className="w-4 h-4 text-gray-400" />
                    {activeFilterLabel}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                </button>
                {filterOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[160px] py-1 overflow-hidden">
                        {FILTER_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => { setFilter(opt.value); setFilterOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                    filter === opt.value
                                        ? "bg-gray-100 text-gray-900 font-semibold"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── List ────────────────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                        <RefreshCcw className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading notifications…</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Bell className="w-12 h-12 text-gray-200" />
                        <p className="text-gray-400 text-sm">No notifications found</p>
                        {filter !== "all" && (
                            <button onClick={() => setFilter("all")} className="text-xs text-gray-600 hover:underline">
                                View all notifications
                            </button>
                        )}
                    </div>
                ) : (
                    notifications.map((n) => {
                        const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_CONFIG;
                        const { Icon, bg, icon } = cfg;
                        return (
                            <div
                                key={n.notificationId}
                                className={`group flex items-start gap-4 px-5 py-4 transition-colors ${
                                    !n.isRead ? "bg-gray-50" : "hover:bg-gray-50"
                                }`}
                            >
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${bg}`}>
                                    <Icon className={`w-5 h-5 ${icon}`} />
                                </div>

                                {/* Content */}
                                <Link
                                    href={hrefFor(n)}
                                    onClick={() => !n.isRead && handleMarkRead(n.notificationId)}
                                    className="flex-1 min-w-0"
                                >
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                                        {!n.isRead && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gray-900 text-white rounded-full leading-none">
                                                New
                                            </span>
                                        )}
                                        <span className="ml-auto text-xs text-gray-400 shrink-0">
                                            {relativeTime(n.createdAt)}
                                        </span>
                                    </div>
                                    {n.message && (
                                        <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                                    )}
                                </Link>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    {!n.isRead && (
                                        <button
                                            onClick={() => handleMarkRead(n.notificationId)}
                                            title="Mark as read"
                                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <CheckCheck className="w-4 h-4 text-gray-400" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(n.notificationId)}
                                        title="Delete"
                                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── Pagination ──────────────────────────────────────────── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        disabled={page === 0}
                        onClick={() => { const p = page - 1; setPage(p); fetchPage(p); }}
                        className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                        ← Previous
                    </button>
                    <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => { const p = page + 1; setPage(p); fetchPage(p); }}
                        className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
