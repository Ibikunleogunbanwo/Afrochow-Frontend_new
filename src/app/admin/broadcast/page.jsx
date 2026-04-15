'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Megaphone, LayoutDashboard, ChevronRight, Send,
    CheckCircle, AlertCircle, RefreshCw,
    ShoppingBag, Truck, CreditCard, Tag, Shield, Bell,
    Users, User, Store, History, Clock, ChevronLeft, ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { AdminNotificationsAPI } from '@/lib/api/admin.api';
import { formatDateTime } from '@/lib/utils/dateUtils';

// ── Audience config ────────────────────────────────────────────────────────────
const AUDIENCES = [
    { value: 'ALL',       label: 'All users',  icon: Users, desc: 'Send to every customer and vendor on the platform' },
    { value: 'CUSTOMERS', label: 'Customers',  icon: User,  desc: 'Send only to users with the CUSTOMER role' },
    { value: 'VENDORS',   label: 'Vendors',    icon: Store, desc: 'Send only to users with the VENDOR role' },
];

// ── Notification type config ───────────────────────────────────────────────────
const NOTIFICATION_TYPES = [
    { value: 'SYSTEM_ALERT',    label: 'System Alert',    icon: Shield,      desc: 'General platform-wide announcements' },
    { value: 'PROMO',           label: 'Promotion',       icon: Tag,         desc: 'Promotional offers and discount codes' },
    { value: 'NEW_ORDER',       label: 'New Order',       icon: ShoppingBag, desc: 'New order activity notifications' },
    { value: 'ORDER_UPDATE',    label: 'Order Update',    icon: Bell,        desc: 'Changes to existing order status' },
    { value: 'DELIVERY_UPDATE', label: 'Delivery Update', icon: Truck,       desc: 'Delivery and logistics updates' },
    { value: 'PAYMENT_SUCCESS', label: 'Payment',         icon: CreditCard,  desc: 'Payment confirmation notifications' },
];

const AUDIENCE_LABELS = { ALL: 'All users', CUSTOMERS: 'Customers', VENDORS: 'Vendors' };

const TYPE_LABELS = Object.fromEntries(NOTIFICATION_TYPES.map(t => [t.value, t.label]));

const relativeTime = (dateVal) => {
    if (!dateVal) return '—';
    const diff  = Date.now() - new Date(dateVal).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  <  1) return 'just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const fullDate = (dateVal) => formatDateTime(dateVal);

const PAGE_SIZE = 20;

// ── Send tab ──────────────────────────────────────────────────────────────────

function SendTab({ onSent }) {
    const [form, setForm]     = useState({ title: '', message: '', type: 'SYSTEM_ALERT', targetAudience: 'ALL' });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError]     = useState(null);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!form.title.trim())   { setError('Title is required');   return; }
        if (!form.message.trim()) { setError('Message is required'); return; }

        setSending(true);
        setError(null);
        setSuccess(false);
        try {
            await AdminNotificationsAPI.broadcast({
                title:          form.title.trim(),
                message:        form.message.trim(),
                type:           form.type,
                targetAudience: form.targetAudience,
            });
            setSuccess(true);
            setForm({ title: '', message: '', type: 'SYSTEM_ALERT', targetAudience: 'ALL' });
            onSent?.();                     // refresh history
        } catch (err) {
            setError(err.message || 'Failed to send broadcast');
        } finally {
            setSending(false);
        }
    };

    const selectedType = NOTIFICATION_TYPES.find(t => t.value === form.type);

    return (
        <form onSubmit={handleSend} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
            {success && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Broadcast sent successfully!
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Target Audience */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Send to <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {AUDIENCES.map(opt => {
                        const Icon = opt.icon;
                        const active = form.targetAudience === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm(f => ({ ...f, targetAudience: opt.value }))}
                                className={`flex flex-col items-center gap-1.5 px-3 py-3 text-sm font-semibold rounded-xl border transition-all ${
                                    active
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {AUDIENCES.find(a => a.value === form.targetAudience)?.desc}
                </p>
            </div>

            {/* Notification Type */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notification Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {NOTIFICATION_TYPES.map(opt => {
                        const Icon = opt.icon;
                        const active = form.type === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm(f => ({ ...f, type: opt.value }))}
                                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl border transition-all text-left ${
                                    active
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
                {selectedType && (
                    <p className="text-xs text-gray-400 mt-2">{selectedType.desc}</p>
                )}
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Notification title"
                    maxLength={100}
                    style={{ color: 'black', backgroundColor: 'white' }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.title.length}/100</p>
            </div>

            {/* Message */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Message <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Write your broadcast message here…"
                    rows={5}
                    maxLength={500}
                    style={{ color: 'black', backgroundColor: 'white' }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/500</p>
            </div>

            {/* Submit */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? 'Sending…' : 'Send Broadcast'}
                </button>
            </div>
        </form>
    );
}

// ── History tab ───────────────────────────────────────────────────────────────

function HistoryTab({ refreshTrigger }) {
    const [history,     setHistory]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);
    const [page,        setPage]        = useState(0);
    const [totalPages,  setTotalPages]  = useState(0);
    const [totalItems,  setTotalItems]  = useState(0);

    const fetchHistory = useCallback(async (p = 0) => {
        setLoading(true);
        setError(null);
        try {
            const res = await AdminNotificationsAPI.getBroadcastHistory(p, PAGE_SIZE);
            const payload = res?.data;
            const content = Array.isArray(payload?.content) ? payload.content
                          : Array.isArray(payload)           ? payload
                          : [];
            setHistory(content);
            setTotalPages(payload?.totalPages ?? 1);
            setTotalItems(payload?.totalElements ?? content.length);
            setPage(p);
        } catch (err) {
            setError(err.message || 'Failed to load broadcast history');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchHistory(0); }, [fetchHistory, refreshTrigger]);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center py-20 gap-2 text-gray-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading history…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16 gap-3">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-sm text-gray-600">{error}</p>
                <button
                    onClick={() => fetchHistory(page)}
                    className="text-xs font-semibold text-gray-700 hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 gap-3">
                <Megaphone className="w-10 h-10 text-gray-200" />
                <p className="text-sm font-semibold text-gray-500">No broadcasts sent yet</p>
                <p className="text-xs text-gray-400">Broadcasts you send will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Summary bar */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{totalItems} broadcast{totalItems !== 1 ? 's' : ''} sent</p>
                <button
                    onClick={() => fetchHistory(page)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Cards */}
            <div className="space-y-3">
                {history.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-gray-900 leading-snug">{item.title}</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{item.message}</p>
                            </div>
                            {/* Recipient count */}
                            {item.recipientCount != null && (
                                <div className="shrink-0 text-right">
                                    <p className="text-lg font-black text-gray-900">{item.recipientCount.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400 leading-none">recipients</p>
                                </div>
                            )}
                        </div>

                        {/* Meta pills */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Audience */}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-full">
                                {item.targetAudience === 'CUSTOMERS' ? <User className="w-3 h-3" />
                                 : item.targetAudience === 'VENDORS'  ? <Store className="w-3 h-3" />
                                 : <Users className="w-3 h-3" />}
                                {AUDIENCE_LABELS[item.targetAudience] ?? item.targetAudience}
                            </span>

                            {/* Type */}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-full">
                                <Bell className="w-3 h-3" />
                                {TYPE_LABELS[item.type] ?? item.type}
                            </span>

                            {/* Timestamp */}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-400 text-[11px] rounded-full ml-auto" title={fullDate(item.sentAt)}>
                                <Clock className="w-3 h-3" />
                                {relativeTime(item.sentAt)}
                            </span>
                        </div>

                        {/* Sent by */}
                        {item.sentBy && (
                            <p className="text-[11px] text-gray-400 mt-2">Sent by {item.sentBy}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        disabled={page === 0}
                        onClick={() => fetchHistory(page - 1)}
                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-sm text-gray-500">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => fetchHistory(page + 1)}
                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                        <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminBroadcastPage() {
    const [activeTab,       setActiveTab]       = useState('send');
    const [historyRefresh,  setHistoryRefresh]  = useState(0);

    const handleSent = () => {
        // bump trigger so HistoryTab re-fetches when user switches to it
        setHistoryRefresh(n => n + 1);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Broadcast</span>
            </nav>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Broadcast Notification</h1>
                <p className="text-gray-500 mt-1">Send notifications and view broadcast history</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {[
                    { key: 'send',    label: 'Send',    icon: Send    },
                    { key: 'history', label: 'History', icon: History },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                            activeTab === key
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'send' && <SendTab onSent={handleSent} />}
            {activeTab === 'history' && <HistoryTab refreshTrigger={historyRefresh} />}

            {/* Info box — only on send tab */}
            {activeTab === 'send' && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <div className="flex gap-3">
                        <Megaphone className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">About broadcasts</p>
                            <ul className="text-xs text-gray-500 space-y-1">
                                <li>· Target all users, customers only, or vendors only</li>
                                <li>· Choose the notification type that best matches your message</li>
                                <li>· Recipients will receive in-app notifications</li>
                                <li>· Broadcasts cannot be undone after sending</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
