"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { NotificationsAPI } from "@/lib/api/notifications.api";

const POLL_INTERVAL_MS = 60_000;
const CHANNEL_NAME     = "afrochow_notifications";

const BC = {
    MARK_READ:     "MARK_READ",
    MARK_ALL_READ: "MARK_ALL_READ",
    DELETE:        "DELETE",
    REFRESH:       "REFRESH",
};

// ── helpers ───────────────────────────────────────────────────────────────────

const relativeTime = (dateVal) => {
    if (!dateVal) return "";
    const diff  = Date.now() - new Date(dateVal).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  <  1)  return "just now";
    if (mins  < 60)  return `${mins} min ago`;
    if (hours < 24)  return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
};

const iconKeyFor = (type) => {
    if (!type) return "system";
    if (type === "NEW_ORDER")       return "new_order";
    if (type === "ORDER_UPDATE")    return "order_update";
    if (type === "DELIVERY_UPDATE") return "delivery";
    if (type === "PAYMENT_SUCCESS") return "payment";
    if (type.includes("VENDOR"))    return "vendor";
    if (type.includes("REVIEW"))    return "review";
    return "system";
};

const hrefFor = (dto) => {
    const t = dto.type ?? "";
    if (["NEW_ORDER", "ORDER_UPDATE", "DELIVERY_UPDATE"].includes(t)) return "/admin/orders";
    if (t === "PAYMENT_SUCCESS")    return "/admin/analytics";
    if (t.includes("VENDOR"))       return "/admin/vendors";
    if (t.includes("REVIEW"))       return "/admin/reviews";
    return "/admin/dashboard";
};

const toUiNotification = (dto) => ({
    id:      dto.notificationId,
    icon:    iconKeyFor(dto.type),
    title:   dto.title,
    text:    dto.message,
    time:    relativeTime(dto.createdAt),
    rawDate: new Date(dto.createdAt),
    unread:  !dto.isRead,
    href:    hrefFor(dto),
});

// ── hook ──────────────────────────────────────────────────────────────────────

export const useAdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(true);
    const channelRef    = useRef(null);
    const authFailedRef = useRef(false);

    const refresh = useCallback(async () => {
        if (authFailedRef.current) return;
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
        } catch (err) {
            if (err?.status === 401) {
                authFailedRef.current = true; // stop polling after permanent auth failure
            }
            // silently fail for other errors — stale state stays visible
        } finally {
            setLoading(false);
        }
    }, []);

    // BroadcastChannel — sync across tabs
    useEffect(() => {
        try {
            const ch = new BroadcastChannel(CHANNEL_NAME);
            channelRef.current = ch;
            ch.onmessage = ({ data }) => {
                switch (data.type) {
                    case BC.MARK_READ:
                        setNotifications((prev) =>
                            prev.map((n) => n.id === data.id ? { ...n, unread: false } : n));
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
        } catch { /* BroadcastChannel unavailable */ }

        return () => { channelRef.current?.close(); channelRef.current = null; };
    }, [refresh]);

    // initial fetch + polling
    useEffect(() => {
        refresh();
        const timer = setInterval(refresh, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [refresh]);

    const broadcast = useCallback((msg) => {
        try { channelRef.current?.postMessage(msg); } catch { /* ignore */ }
    }, []);

    const markRead = useCallback(async (id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
        broadcast({ type: BC.MARK_READ, id });
        try {
            await NotificationsAPI.markRead(id);
        } catch {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, unread: true } : n)));
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

    const unreadCount = notifications.filter((n) => n.unread).length;

    return { notifications, unreadCount, loading, refresh, markRead, markAllRead };
};
