/**
 * Shared date/time formatting utilities.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Java's LocalDateTime serialises as "2026-04-15T06:27:51" — no timezone offset,
 * no trailing 'Z'. When JavaScript's Date constructor receives a string like that
 * without any offset it behaves inconsistently: some browsers treat it as UTC,
 * others as local time. The server always runs in UTC, so we must normalise every
 * backend date string to UTC before constructing a Date. The browser then
 * automatically converts it to the user's local timezone for display.
 *
 * USAGE
 * -----
 *   import { formatDate, formatDateTime, formatDateLong, relativeTime } from '@/lib/utils/dateUtils';
 *
 *   formatDate(user.createdAt)          // "Apr 15, 2026"
 *   formatDateTime(user.lastLoginAt)    // "Apr 15, 2026, 6:27 AM"
 *   formatDateLong(order.orderTime)     // "April 15, 2026"
 *   formatDateTimeLong(order.orderTime) // "April 15, 2026 at 06:27 AM"
 *   relativeTime(notification.createdAt) // "3h ago"
 */

/**
 * Normalise a backend date string to a proper UTC Date object.
 *
 * Java's LocalDateTime serialises without a timezone indicator.
 * We append 'Z' (UTC) when no offset is already present so the
 * browser correctly converts to the user's local timezone.
 *
 * @param {string|number|Date|null|undefined} d
 * @returns {Date|null}
 */
export function parseServerDate(d) {
    if (d == null || d === '') return null;
    if (d instanceof Date) return isNaN(d.getTime()) ? null : d;

    const s = String(d);
    // Nano/microsecond precision from Spring (e.g. ".123456789") → trim to ms
    const normalised = s.replace(/(\.\d{3})\d+/, '$1');

    // If the string already has a timezone offset (Z, +HH:MM, -HH:MM) leave it alone.
    const hasOffset = /Z$|[+-]\d{2}:\d{2}$|[+-]\d{4}$/.test(normalised);
    const utc = hasOffset ? normalised : normalised + 'Z';

    const date = new Date(utc);
    return isNaN(date.getTime()) ? null : date;
}

// ── Formatting presets ──────────────────────────────────────────────────────

/**
 * Short date — "Apr 15, 2026"
 */
export function formatDate(d) {
    const date = parseServerDate(d);
    if (!date) return '—';
    return date.toLocaleDateString(undefined, {
        year:  'numeric',
        month: 'short',
        day:   'numeric',
    });
}

/**
 * Short date + time — "Apr 15, 2026, 6:27 AM"
 */
export function formatDateTime(d) {
    const date = parseServerDate(d);
    if (!date) return '—';
    return date.toLocaleString(undefined, {
        year:   'numeric',
        month:  'short',
        day:    'numeric',
        hour:   '2-digit',
        minute: '2-digit',
    });
}

/**
 * Long date only — "April 15, 2026"
 */
export function formatDateLong(d) {
    const date = parseServerDate(d);
    if (!date) return '—';
    return date.toLocaleDateString(undefined, {
        year:  'numeric',
        month: 'long',
        day:   'numeric',
    });
}

/**
 * Long date + time — "April 15, 2026 at 06:27 AM"
 */
export function formatDateTimeLong(d) {
    const date = parseServerDate(d);
    if (!date) return '—';
    return date.toLocaleString(undefined, {
        year:   'numeric',
        month:  'long',
        day:    'numeric',
        hour:   '2-digit',
        minute: '2-digit',
    });
}

/**
 * Very short — "Apr 15"
 */
export function formatDateShort(d) {
    const date = parseServerDate(d);
    if (!date) return '—';
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day:   'numeric',
    });
}

/**
 * Relative time — "just now", "3m ago", "2h ago", "4d ago", "Apr 15, 2026"
 */
export function relativeTime(d) {
    const date = parseServerDate(d);
    if (!date) return '';
    const diff  = Date.now() - date.getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  <  1) return 'just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  <  7) return `${days}d ago`;
    return formatDate(date);
}

/**
 * Full date+time string — "Apr 15, 2026 at 6:27 AM"
 * Used wherever a complete timestamp is needed (e.g. admin user detail rows).
 */
export function formatTimestamp(d) {
    const date = parseServerDate(d);
    if (!date) return '—';
    const datePart = date.toLocaleDateString(undefined, {
        year:  'numeric',
        month: 'long',
        day:   'numeric',
    });
    const timePart = date.toLocaleTimeString(undefined, {
        hour:   '2-digit',
        minute: '2-digit',
    });
    return `${datePart} at ${timePart}`;
}
