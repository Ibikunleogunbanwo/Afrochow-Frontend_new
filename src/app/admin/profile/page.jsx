'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, ChevronRight, Save, Loader2, CheckCircle2, User, Mail, Phone, Shield } from 'lucide-react';
import { AdminProfileAPI } from '@/lib/api/admin.api';

const FIELD_CLS = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 text-gray-900 bg-white transition";

export default function AdminProfilePage() {
    const [profile, setProfile]   = useState(null);
    const [form, setForm]         = useState({ firstName: '', lastName: '', phone: '' });
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [saved, setSaved]       = useState(false);
    const [error, setError]       = useState(null);

    useEffect(() => {
        AdminProfileAPI.getProfile()
            .then(res => {
                const d = res?.data ?? res;
                setProfile(d);
                setForm({ firstName: d?.firstName || '', lastName: d?.lastName || '', phone: d?.phone || '' });
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminProfileAPI.updateProfile(form);
            const d = res?.data ?? res;
            setProfile(d);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            setError(e.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-gray-900" />
        </div>
    );

    const initials = `${form.firstName?.charAt(0) || ''}${form.lastName?.charAt(0) || ''}`.toUpperCase() || 'A';

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Profile</span>
            </nav>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
                <p className="text-gray-500 mt-1">Manage your admin account details</p>
            </div>

            {/* Avatar card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-black shrink-0">
                    {initials}
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-900">{form.firstName} {form.lastName}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <Shield className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {profile?.accessLevel || profile?.role || 'Admin'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Form card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900">Personal Information</h2>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">First Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    value={form.firstName}
                                    onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                                    placeholder="First name"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className={FIELD_CLS + ' pl-9'}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Last Name</label>
                            <input
                                value={form.lastName}
                                onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                                placeholder="Last name"
                                style={{ color: 'black', backgroundColor: 'white' }}
                                className={FIELD_CLS}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={profile?.email || ''}
                                disabled
                                className={FIELD_CLS + ' pl-9 opacity-60 cursor-not-allowed'}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                placeholder="+1 (416) 555-0100"
                                style={{ color: 'black', backgroundColor: 'white' }}
                                className={FIELD_CLS + ' pl-9'}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <button
                        onClick={handleSave}
                        disabled={saving || saved}
                        className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                            saved ? 'bg-green-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'
                        }`}
                    >
                        {saving ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                        ) : saved ? (
                            <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                        ) : (
                            <><Save className="w-4 h-4" /> Save Changes</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
