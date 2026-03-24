import React from "react";
import Link from "next/link";
import {
    ShoppingBag,
    Star,
    Truck,
    CreditCard,
    Bell,
    RefreshCcw,
    CheckCheck,
    X,
} from "lucide-react";

const TYPE_CONFIG = {
    new_order:    { Icon: ShoppingBag, bg: "bg-gray-100", icon: "text-gray-700" },
    order_update: { Icon: ShoppingBag, bg: "bg-gray-100", icon: "text-gray-700" },
    delivery:     { Icon: Truck,       bg: "bg-gray-100", icon: "text-gray-700" },
    payment:      { Icon: CreditCard,  bg: "bg-gray-100", icon: "text-gray-700" },
    review:       { Icon: Star,        bg: "bg-gray-100", icon: "text-gray-700" },
    system:       { Icon: Bell,        bg: "bg-gray-100", icon: "text-gray-400" },
    promo:        { Icon: Bell,        bg: "bg-gray-100", icon: "text-gray-700" },
};

const IconBubble = ({ iconKey }) => {
    const cfg = TYPE_CONFIG[iconKey] ?? TYPE_CONFIG.system;
    const { Icon, bg, icon } = cfg;
    return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${bg}`}>
            <Icon className={`w-4 h-4 ${icon}`} />
        </div>
    );
};

const NotificationDropdown = ({
    isOpen,
    notifications,
    unreadCount,
    loading,
    onClose,
    onMarkAllRead,
    onMarkRead,
    onDelete,
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-black bg-gray-900 text-white rounded-full leading-none">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={onMarkAllRead}
                        className="flex items-center gap-1 text-xs text-gray-700 font-semibold hover:text-gray-900 transition-colors"
                    >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                    </button>
                )}
            </div>

            {/* ── Body ───────────────────────────────────────────────────── */}
            <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                {loading ? (
                    <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading…</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <Bell className="w-9 h-9 text-gray-200" />
                        <p className="text-sm text-gray-400">You're all caught up!</p>
                    </div>
                ) : (
                    notifications.slice(0, 15).map((n) => (
                        <div
                            key={n.id}
                            className={`group relative flex items-start gap-3 px-4 py-3 transition-colors ${
                                n.unread ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-50"
                            }`}
                        >
                            {/* Navigate + mark read on click */}
                            <Link
                                href={n.href}
                                onClick={() => { onMarkRead(n.id); onClose(); }}
                                className="flex items-start gap-3 flex-1 min-w-0"
                            >
                                <IconBubble iconKey={n.icon} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-semibold text-gray-900 truncate flex-1">
                                            {n.title}
                                        </p>
                                        {n.unread && (
                                            <span className="w-2 h-2 rounded-full bg-gray-900 shrink-0" />
                                        )}
                                    </div>
                                    {n.text && (
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                            {n.text}
                                        </p>
                                    )}
                                    <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                                </div>
                            </Link>

                            {/* Delete button — appears on hover */}
                            {onDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200"
                                    aria-label="Dismiss notification"
                                >
                                    <X className="w-3 h-3 text-gray-400" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                <Link
                    href="/vendor/notifications"
                    className="text-xs text-gray-700 font-semibold hover:text-gray-900 transition-colors"
                    onClick={onClose}
                >
                    View all notifications →
                </Link>
                {notifications.some((n) => !n.unread) && onDelete && (
                    <button
                        onClick={() => notifications.filter((n) => !n.unread).forEach((n) => onDelete(n.id))}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Clear read
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
