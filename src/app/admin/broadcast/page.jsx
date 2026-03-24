'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Megaphone, LayoutDashboard, ChevronRight, Send, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { AdminNotificationsAPI } from '@/lib/api/admin.api';

const AUDIENCE_OPTIONS = [
    { value: 'ALL',      label: 'All Users' },
    { value: 'CUSTOMER', label: 'Customers only' },
    { value: 'VENDOR',   label: 'Vendors only' },
    { value: 'ADMIN',    label: 'Admins only' },
];

export default function AdminBroadcastPage() {
    const [form, setForm] = useState({ title: '', message: '', audience: 'ALL' });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError]     = useState(null);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.message.trim()) {
            setError('Title and message are required');
            return;
        }
        setSending(true);
        setError(null);
        setSuccess(false);
        try {
            await AdminNotificationsAPI.broadcast(form);
            setSuccess(true);
            setForm({ title: '', message: '', audience: 'ALL' });
        } catch (err) {
            setError(err.message || 'Failed to send broadcast');
        } finally {
            setSending(false);
        }
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
                <p className="text-gray-500 mt-1">Send a push notification to all or specific groups of users</p>
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

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Audience</label>
                    <div className="flex flex-wrap gap-2">
                        {AUDIENCE_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm(f => ({ ...f, audience: opt.value }))}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                                    form.audience === opt.value
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
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

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
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
                            <li>· Notifications are sent to all users matching the selected audience</li>
                            <li>· Users will receive in-app notifications</li>
                            <li>· Broadcasts cannot be undone after sending</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
