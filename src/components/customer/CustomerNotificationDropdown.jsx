import React from "react";
import Link from "next/link";
import {
    ShoppingBag, Truck, CreditCard, Tag,
    Bell, RefreshCcw, CheckCheck, X,
} from "lucide-react";

const TYPE_CONFIG = {
    order_update:   { Icon: ShoppingBag, bg: "bg-gray-100",    icon: "text-gray-700"   },
    delivery:       { Icon: Truck,       bg: "bg-blue-50",     icon: "text-blue-600"   },
    payment:        { Icon: CreditCard,  bg: "bg-green-100",   icon: "text-green-700"  },
    payment_failed: { Icon: CreditCard,  bg: "bg-red-100",     icon: "text-red-600"    },
    promo:          { Icon: Tag,         bg: "bg-orange-100",  icon: "text-orange-600" },
    system:         { Icon: Bell,        bg: "bg-gray-100",    icon: "text-gray-400"   },
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

const CustomerNotificationDropdown = ({
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

    // Show only the 3 most recent unread notifications
    const unread = notifications.filter((n) => n.unread).slice(0, 3);
    const hasUnread = unread.length > 0;

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-black bg-gray-900 text-white rounded-full leading-none">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </div>
                {hasUnread && (
                    <button
                        onClick={onMarkAllRead}
                        className="flex items-center gap-1 text-xs text-gray-600 font-semibold hover:text-gray-900 transition-colors"
                    >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                    </button>
                )}
            </div>

            {/* Body — only unread, max 3, not clickable */}
            <div className="divide-y divide-gray-100">
                {loading ? (
                    <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading…</span>
                    </div>
                ) : !hasUnread ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <Bell className="w-8 h-8 text-gray-200" />
                        <p className="text-sm text-gray-400">No unread notifications</p>
                    </div>
                ) : (
                    unread.map((n) => (
                        <div
                            key={n.id}
                            className="group relative flex items-start gap-3 px-4 py-3 bg-gray-50"
                        >
                            <IconBubble iconKey={n.icon} />

                            {/* Non-navigable content */}
                            <div className="flex-1 min-w-0 pr-5">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-semibold text-gray-900 truncate flex-1">
                                        {n.title}
                                    </p>
                                    <span className="w-2 h-2 rounded-full bg-gray-900 shrink-0" />
                                </div>
                                {n.text && (
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                        {n.text}
                                    </p>
                                )}
                                <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                            </div>

                            {/* Dismiss — marks read */}
                            <button
                                onClick={() => onMarkRead(n.id)}
                                className="absolute top-2.5 right-2.5 p-1 rounded-lg hover:bg-gray-200 transition-colors"
                                aria-label="Mark as read"
                            >
                                <X className="w-3 h-3 text-gray-400" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer — only "View all" is navigable */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <Link
                    href="/notifications"
                    onClick={onClose}
                    className="flex items-center justify-center w-full py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                    View all notifications
                    {unreadCount > 3 && (
                        <span className="ml-1.5 text-gray-500">
                            (+{unreadCount - 3} more unread)
                        </span>
                    )}
                </Link>
            </div>
        </div>
    );
};

export default CustomerNotificationDropdown;
