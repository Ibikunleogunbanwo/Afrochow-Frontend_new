"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { NotificationsAPI } from "@/lib/api/notifications.api";

const POLL_INTERVAL_MS = 60_000;
const CHANNEL_NAME     = "afrochow_customer_notifications";

// ─── broadcast message types ──────────────────────────────────────────────────
const BC = {
    MARK_READ:     "MARK_READ",
    MARK_ALL_READ: "MARK_ALL_READ",
    DELETE:        "DELETE",
    REFRESH:       "REFRESH",
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const relativeTime = (dateVal) => {
    if (!dateVal) return "";
    const diff  = Date.now() - new Date(dateVal).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  <  1) return "just now";
    if (mins  < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
};

const iconKeyFor = (type) => {
    if (!type) return "system";
    if (type === "ORDER_UPDATE")    return "order_update";
    if (type === "DELIVERY_UPDATE") return "delivery";
    if (type === "PAYMENT_SUCCESS") return "payment";
    if (type === "PAYMENT_FAILED")  return "payment_failed";
    if (type === "PROMO")           return "promo";
    return "system";
};

const uiTypeFor = (type) => {
    if (["ORDER_UPDATE"].includes(type))    return "order";
    if (type === "DELIVERY_UPDATE")          return "delivery";
    if (type === "PAYMENT_SUCCESS")          return "payment";
    if (type === "PAYMENT_FAILED")           return "payment_failed";
    if (type === "PROMO")                    return "promo";
    return "system";
};

const hrefFor = (dto) => {
    const t = dto.type;
    if (["ORDER_UPDATE", "DELIVERY_UPDATE"].includes(t))   return "/orders";
    if (["PAYMENT_SUCCESS", "PAYMENT_FAILED"].includes(t)) return "/orders";
    if (t === "PROMO")                                     return "/restaurants";
    return "/profile";
};

const toUiNotification = (dto) => ({
    id:      dto.notificationId,
    type:    uiTypeFor(dto.type),
    icon:    iconKeyFor(dto.type),
    title:   dto.title,
    text:    dto.message,
    time:    relativeTime(dto.createdAt),
    rawDate: new Date(dto.createdAt),
    unread:  !dto.isRead,
    href:    hrefFor(dto),
});

// ─── hook ─────────────────────────────────────────────────────────────────────

export const useCustomerNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(true);
    const channelRef = useRef(null);

    // ── fetch from server ──────────────────────────────────────────────────────
    const refresh = useCallback(async () => {
        try {
            const res = await NotificationsAPI.getRecent();
            if (res?.success && Array.isArray(res.data)) {
                const items = res.data
                    .map(toUiNotification)
                    .sort((a, b) => {
                        if (a.unread !== b.unread) return a.unread ? -1 : 1;
                        return b.rawDate - a.rawDate;
                    });
                setNotifications(items);
            }
        } catch {
            // silently fail — stale state stays visible
        } finally {
            setLoading(false);
        }
    }, []);

    // ── BroadcastChannel: sync across tabs ────────────────────────────────────
    useEffect(() => {
        try {
            const ch = new BroadcastChannel(CHANNEL_NAME);
            channelRef.current = ch;

            ch.onmessage = ({ data }) => {
                switch (data.type) {
                    case BC.MARK_READ:
                        setNotifications((prev) =>
                            prev.map((n) => n.id === data.id ? { ...n, unread: false } : n)
                        );
                        break;
                    case BC.MARK_ALL_READ:
                        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
                        break;
                    case BC.DELETE:
                        setNotifications((prev) => prev.filter((n) => n.id !== data.id));
                        break;
                    case BC.REFRESH:
                        refresh();
                        break;
                    default:
                        break;
                }
            };
        } catch {
            // BroadcastChannel not available — degrade gracefully
        }

        return () => {
            channelRef.current?.close();
            channelRef.current = null;
        };
    }, [refresh]);

    // ── initial fetch + polling ────────────────────────────────────────────────
    useEffect(() => {
        refresh();
        const timer = setInterval(refresh, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [refresh]);

    // ── broadcast helper ───────────────────────────────────────────────────────
    const broadcast = useCallback((msg) => {
        try { channelRef.current?.postMessage(msg); } catch { /* ignore */ }
    }, []);

    // ── mutations ──────────────────────────────────────────────────────────────

    const markRead = useCallback(async (id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
        );
        broadcast({ type: BC.MARK_READ, id });
        try {
            await NotificationsAPI.markRead(id);
        } catch {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, unread: true } : n))
            );
            broadcast({ type: BC.REFRESH });
        }
    }, [broadcast]);

    const markAllRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
        broadcast({ type: BC.MARK_ALL_READ });
        try {
            await NotificationsAPI.markAllRead();
        } catch {
            refresh();
            broadcast({ type: BC.REFRESH });
        }
    }, [broadcast, refresh]);

    const deleteOne = useCallback(async (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        broadcast({ type: BC.DELETE, id });
        try {
            await NotificationsAPI.deleteOne(id);
        } catch {
            refresh();
            broadcast({ type: BC.REFRESH });
        }
    }, [broadcast, refresh]);

    const unreadCount = notifications.filter((n) => n.unread).length;

    return { notifications, unreadCount, loading, refresh, markRead, markAllRead, deleteOne };
};
