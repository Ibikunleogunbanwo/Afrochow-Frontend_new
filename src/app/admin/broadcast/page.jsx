'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Megaphone, LayoutDashboard, ChevronRight, Send,
    CheckCircle, AlertCircle, RefreshCw,
    ShoppingBag, Truck, CreditCard, Tag, Shield, Bell,
    Users, User, Store,
} from 'lucide-react';
import { AdminNotificationsAPI } from '@/lib/api/admin.api';

// Audience filter
const AUDIENCES = [
    { value: 'ALL',       label: 'All users',  icon: Users, desc: 'Send to every customer and vendor on the platform' },
    { value: 'CUSTOMERS', label: 'Customers',  icon: User,  desc: 'Send only to users with the CUSTOMER role' },
    { value: 'VENDORS',   label: 'Vendors',    icon: Store, desc: 'Send only to users with the VENDOR role' },
];

// NotificationType enum values from the backend
const NOTIFICATION_TYPES = [
    { value: 'SYSTEM_ALERT',    label: 'System Alert',    icon: Shield,      desc: 'General platform-wide announcements' },
    { value: 'PROMO',           label: 'Promotion',       icon: Tag,         desc: 'Promotional offers and discount codes' },
    { value: 'NEW_ORDER',       label: 'New Order',       icon: ShoppingBag, desc: 'New order activity notifications' },
    { value: 'ORDER_UPDATE',    label: 'Order Update',    icon: Bell,        desc: 'Changes to existing order status' },
    { value: 'DELIVERY_UPDATE', label: 'Delivery Update', icon: Truck,       desc: 'Delivery and logistics updates' },
    { value: 'PAYMENT_SUCCESS', label: 'Payment',         icon: CreditCard,  desc: 'Payment confirmation notifications' },
];

export default function AdminBroadcastPage() {
    const [form, setForm]     = useState({ title: '', message: '', type: 'SYSTEM_ALERT', targetAudience: 'ALL' });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError]     = useState(null);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('Title is required'); return; }
        if (!form.message.trim()) { setError('Message is required'); return; }
        if (!form.type) { setError('Notification type is required'); return; }

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
        } catch (err) {
            setError(err.message || 'Failed to send broadcast');
        } finally {
            setSending(false);
        }
    };

    const selectedType = NOTIFICATION_TYPES.find(t => t.value === form.type);

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
                <p className="text-gray-500 mt-1">Send a notification to all users on the platform</p>
            </div>

            {/* Form */}
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

            {/* Info box */}
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
        </div>
    );
}
