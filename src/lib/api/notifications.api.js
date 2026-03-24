import { API_BASE_URL, fetchWithCredentials } from './httpClient';

export const NotificationsAPI = {

    // ── Read ──────────────────────────────────────────────────────────────────

    // Read operations use silent:true — errors are handled gracefully in the
    // hook/page so there is no need to spam the console while the backend
    // notification feature is being stabilised.

    /** Paginated full list. Returns Page<NotificationDto> in data.content */
    getAll: (page = 0, size = 20) =>
        fetchWithCredentials(`${API_BASE_URL}/notifications?page=${page}&size=${size}`, { silent: true }),

    /** All unread notifications (no pagination) */
    getUnread: () =>
        fetchWithCredentials(`${API_BASE_URL}/notifications/unread`, { silent: true }),

    /** Notifications from the last 7 days */
    getRecent: () =>
        fetchWithCredentials(`${API_BASE_URL}/notifications/recent`, { silent: true }),

    /** Filtered by NotificationType enum string, e.g. "NEW_ORDER" */
    getByType: (type) =>
        fetchWithCredentials(`${API_BASE_URL}/notifications/type/${type}`, { silent: true }),

    /** { totalNotifications, unreadNotifications, readNotifications } */
    getStats: () =>
        fetchWithCredentials(`${API_BASE_URL}/notifications/stats`, { silent: true }),

    // ── Mutations ─────────────────────────────────────────────────────────────

    markRead: (notificationId) =>
        fetchWithCredentials(`${API_BASE_URL}/notifications/${notificationId}/read`, { method: 'PATCH' }),

    markUnread: (notificationId) =>
        fetchWithCredentials(`${API_BASE_URL}/notifications/${notificationId}/unread`, { method: 'PATCH' }),

    markAllRead: () =>
        fetchWithCredentials(`${API_BASE_URL}/notifications/read-all`, { method: 'PATCH' }),

    deleteOne: (notificationId) =>
        fetchWithCredentials(`${API_BASE_URL}/notifications/${notificationId}`, { method: 'DELETE' }),

    deleteAllRead: () =>
        fetchWithCredentials(`${API_BASE_URL}/notifications/read`, { method: 'DELETE' }),
};
