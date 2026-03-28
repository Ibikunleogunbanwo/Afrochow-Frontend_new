'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard, ChevronRight, Lock, Eye, EyeOff,
    Loader2, CheckCircle2, AlertCircle, Shield, Bell,
    Monitor, Globe, Save,
} from 'lucide-react';
import { AuthAPI } from '@/lib/api/auth.api';
import { toast } from '@/components/ui/toast';

const FIELD_CLS =
    'w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 text-gray-900 bg-white transition';

/* ── Password strength meter ─────────────────────────────────────────────── */
function strengthOf(pw) {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8)  score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
        { label: '',          color: 'bg-gray-200'  },
        { label: 'Weak',      color: 'bg-red-500'   },
        { label: 'Fair',      color: 'bg-amber-400' },
        { label: 'Good',      color: 'bg-blue-500'  },
        { label: 'Strong',    color: 'bg-green-500' },
    ];
    return { score, ...map[score] };
}

/* ── Section card wrapper ────────────────────────────────────────────────── */
function SettingCard({ icon: Icon, title, description, children }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-start gap-3 px-6 py-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-gray-900">{title}</h2>
                    {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
                </div>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

/* ── Toggle row ──────────────────────────────────────────────────────────── */
function ToggleRow({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
            <button
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 ${
                    checked ? 'bg-gray-900' : 'bg-gray-300'
                }`}
            >
                <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        checked ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                    style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
                />
            </button>
        </div>
    );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function AdminSettingsPage() {
    /* Password change state */
    const [pwForm, setPwForm]         = useState({ current: '', next: '', confirm: '' });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNext, setShowNext]       = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwSaving, setPwSaving]     = useState(false);
    const [pwError, setPwError]       = useState('');

    /* Notification preferences */
    const [notifs, setNotifs] = useState({
        newVendor:    true,
        newOrder:     true,
        orderIssue:   true,
        systemAlerts: true,
        weeklyReport: false,
    });

    /* Session / security */
    const [sessionTimeout, setSessionTimeout] = useState('8h');

    /* Password strength */
    const strength = strengthOf(pwForm.next);

    const handlePasswordSave = async () => {
        setPwError('');
        if (!pwForm.current) { setPwError('Current password is required.'); return; }
        if (pwForm.next.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
        if (pwForm.next !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }

        setPwSaving(true);
        try {
            await AuthAPI.changePassword(pwForm.current, pwForm.next);
            setPwForm({ current: '', next: '', confirm: '' });
            toast.success('Password updated', { description: 'Your password has been changed successfully.' });
        } catch (e) {
            setPwError(e?.message || 'Failed to update password. Please try again.');
        } finally {
            setPwSaving(false);
        }
    };

    const handleNotifSave = () => {
        toast.success('Preferences saved', { description: 'Notification settings updated.' });
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
                <span className="font-semibold text-gray-900">Settings</span>
            </nav>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account security and preferences</p>
            </div>

            {/* ── Change Password ──────────────────────────────────────── */}
            <SettingCard
                icon={Lock}
                title="Change Password"
                description="Use a strong password you don't use elsewhere"
            >
                <div className="space-y-4">
                    {pwError && (
                        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            {pwError}
                        </div>
                    )}

                    {/* Current password */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={pwForm.current}
                                onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                                placeholder="••••••••"
                                style={{ color: 'black', backgroundColor: 'white' }}
                                className={FIELD_CLS + ' pl-9 pr-10'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                tabIndex={-1}
                            >
                                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* New password */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type={showNext ? 'text' : 'password'}
                                value={pwForm.next}
                                onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
                                placeholder="••••••••"
                                style={{ color: 'black', backgroundColor: 'white' }}
                                className={FIELD_CLS + ' pl-9 pr-10'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNext(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                tabIndex={-1}
                            >
                                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Strength meter */}
                        {pwForm.next && (
                            <div className="mt-2 space-y-1.5">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-colors ${
                                                i <= strength.score ? strength.color : 'bg-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                                {strength.label && (
                                    <p className="text-[11px] text-gray-500">
                                        Strength: <span className="font-semibold">{strength.label}</span>
                                        {strength.score < 4 && ' — include uppercase, numbers, and symbols'}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Confirm new password */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={pwForm.confirm}
                                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                                placeholder="••••••••"
                                style={{ color: 'black', backgroundColor: 'white' }}
                                className={`${FIELD_CLS} pl-9 pr-10 ${
                                    pwForm.confirm && pwForm.next !== pwForm.confirm
                                        ? 'border-red-300 focus:ring-red-200'
                                        : ''
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {pwForm.confirm && pwForm.next !== pwForm.confirm && (
                            <p className="text-xs text-red-500 mt-1">Passwords don&apos;t match</p>
                        )}
                    </div>

                    <button
                        onClick={handlePasswordSave}
                        disabled={pwSaving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {pwSaving
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                            : <><Save className="w-4 h-4" /> Update Password</>
                        }
                    </button>
                </div>
            </SettingCard>

            {/* ── Notification Preferences ─────────────────────────────── */}
            <SettingCard
                icon={Bell}
                title="Notification Preferences"
                description="Choose what activity triggers a notification for you"
            >
                <div className="divide-y divide-gray-100">
                    <ToggleRow
                        label="New vendor applications"
                        description="Alert when a new vendor submits for review"
                        checked={notifs.newVendor}
                        onChange={v => setNotifs(p => ({ ...p, newVendor: v }))}
                    />
                    <ToggleRow
                        label="New orders placed"
                        description="Alert on every new customer order"
                        checked={notifs.newOrder}
                        onChange={v => setNotifs(p => ({ ...p, newOrder: v }))}
                    />
                    <ToggleRow
                        label="Order disputes & issues"
                        description="Notify when an order is flagged or disputed"
                        checked={notifs.orderIssue}
                        onChange={v => setNotifs(p => ({ ...p, orderIssue: v }))}
                    />
                    <ToggleRow
                        label="System alerts"
                        description="Critical platform events and errors"
                        checked={notifs.systemAlerts}
                        onChange={v => setNotifs(p => ({ ...p, systemAlerts: v }))}
                    />
                    <ToggleRow
                        label="Weekly summary report"
                        description="Receive a platform summary every Monday"
                        checked={notifs.weeklyReport}
                        onChange={v => setNotifs(p => ({ ...p, weeklyReport: v }))}
                    />
                </div>
                <div className="mt-5">
                    <button
                        onClick={handleNotifSave}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Save Preferences
                    </button>
                </div>
            </SettingCard>

            {/* ── Security ─────────────────────────────────────────────── */}
            <SettingCard
                icon={Shield}
                title="Security"
                description="Session and access control settings"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            Session Timeout
                        </label>
                        <select
                            value={sessionTimeout}
                            onChange={e => setSessionTimeout(e.target.value)}
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className={FIELD_CLS}
                        >
                            <option value="1h">1 hour</option>
                            <option value="4h">4 hours</option>
                            <option value="8h">8 hours (default)</option>
                            <option value="24h">24 hours</option>
                            <option value="never">Never (not recommended)</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                            You&apos;ll be signed out automatically after this period of inactivity.
                        </p>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold text-amber-900">Two-factor authentication</p>
                            <p className="text-amber-700 text-xs mt-0.5">
                                2FA is managed at the platform level. Contact a Super Admin to enable it for your account.
                            </p>
                        </div>
                    </div>
                </div>
            </SettingCard>

            {/* ── Display ──────────────────────────────────────────────── */}
            <SettingCard
                icon={Monitor}
                title="Display"
                description="UI and regional preferences"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            Language & Region
                        </label>
                        <select
                            defaultValue="en-CA"
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className={FIELD_CLS}
                        >
                            <option value="en-CA">English (Canada)</option>
                            <option value="en-US">English (United States)</option>
                            <option value="en-GB">English (United Kingdom)</option>
                            <option value="fr-CA">Français (Canada)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            Date Format
                        </label>
                        <select
                            defaultValue="MMM D, YYYY"
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className={FIELD_CLS}
                        >
                            <option value="MMM D, YYYY">Mar 27, 2026</option>
                            <option value="YYYY-MM-DD">2026-03-27</option>
                            <option value="DD/MM/YYYY">27/03/2026</option>
                            <option value="MM/DD/YYYY">03/27/2026</option>
                        </select>
                    </div>
                </div>
            </SettingCard>

            {/* Quick link to Profile */}
            <p className="text-sm text-gray-500">
                Looking to update your name or contact info?{' '}
                <Link href="/admin/profile" className="font-semibold text-gray-900 hover:underline">
                    Go to My Profile →
                </Link>
            </p>

        </div>
    );
}
