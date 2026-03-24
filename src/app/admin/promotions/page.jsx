'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Tag, LayoutDashboard, ChevronRight, RefreshCw, AlertCircle, Plus, Trash2, Edit2, X, CheckCircle } from 'lucide-react';
import { AdminPromotionsAPI } from '@/lib/api/admin.api';
import AdminPageError from '@/components/admin/AdminPageError';

const EMPTY_FORM = { code: '', discountPercent: '', maxUsage: '', expiresAt: '', description: '' };

export default function AdminPromotionsPage() {
    const [promotions, setPromotions]   = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [showForm, setShowForm]       = useState(false);
    const [editTarget, setEditTarget]   = useState(null);
    const [form, setForm]               = useState(EMPTY_FORM);
    const [formError, setFormError]     = useState(null);
    const [saving, setSaving]           = useState(false);

    const fetchPromotions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await AdminPromotionsAPI.getAll();
            const data = res?.data ?? res ?? [];
            setPromotions(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Failed to load promotions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

    const openCreate = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormError(null);
        setShowForm(true);
    };

    const openEdit = (p) => {
        setEditTarget(p);
        setForm({
            code: p.code ?? '',
            discountPercent: p.discountPercent ?? '',
            maxUsage: p.maxUsage ?? '',
            expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : '',
            description: p.description ?? '',
        });
        setFormError(null);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.code.trim()) { setFormError('Promo code is required'); return; }
        if (!form.discountPercent || isNaN(form.discountPercent)) { setFormError('Valid discount % is required'); return; }
        setSaving(true);
        setFormError(null);
        try {
            const payload = {
                ...form,
                discountPercent: Number(form.discountPercent),
                maxUsage: form.maxUsage ? Number(form.maxUsage) : null,
            };
            if (editTarget) {
                await AdminPromotionsAPI.update(editTarget.id ?? editTarget.publicPromotionId, payload);
            } else {
                await AdminPromotionsAPI.create(payload);
            }
            setShowForm(false);
            await fetchPromotions();
        } catch (e) {
            setFormError(e.message || 'Failed to save promotion');
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (p) => {
        if (!confirm(`Deactivate promotion "${p.code}"?`)) return;
        const id = p.id ?? p.publicPromotionId;
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await AdminPromotionsAPI.deactivate(id);
            await fetchPromotions();
        } catch (e) {
            alert(e.message || 'Failed to deactivate');
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'No expiry';

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Promotions</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Promotions</h1>
                    <p className="text-gray-500 mt-1">Create and manage platform-wide promotional codes</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchPromotions} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                        <Plus className="h-4 w-4" />
                        New Promotion
                    </button>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">{editTarget ? 'Edit Promotion' : 'New Promotion'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {formError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {formError}
                                </div>
                            )}
                            {[
                                { key: 'code', label: 'Promo Code', placeholder: 'e.g. SAVE20', type: 'text' },
                                { key: 'discountPercent', label: 'Discount %', placeholder: '20', type: 'number' },
                                { key: 'maxUsage', label: 'Max Usage (optional)', placeholder: '100', type: 'number' },
                                { key: 'expiresAt', label: 'Expiry Date (optional)', placeholder: '', type: 'date' },
                                { key: 'description', label: 'Description (optional)', placeholder: 'Describe this promotion', type: 'text' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</label>
                                    <input
                                        type={f.type}
                                        value={form[f.key]}
                                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                        placeholder={f.placeholder}
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 p-6 pt-0">
                            <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
                                {saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading promotions…</span>
                    </div>
                ) : error ? (
                    <AdminPageError error={error} onRetry={fetchPromotions} />
                ) : promotions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Tag className="h-12 w-12 text-gray-200" />
                        <p className="text-sm text-gray-400">No promotions yet</p>
                        <button onClick={openCreate} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl">Create first promotion</button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {promotions.map(p => {
                            const id = p.id ?? p.publicPromotionId;
                            const isExpired = p.expiresAt && new Date(p.expiresAt) < new Date();
                            return (
                                <div key={id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                            <Tag className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                <p className="text-sm font-bold text-gray-900 font-mono">{p.code}</p>
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                                                    {p.discountPercent}% off
                                                </span>
                                                {p.active === false && (
                                                    <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full border border-red-200">Inactive</span>
                                                )}
                                                {isExpired && (
                                                    <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">Expired</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {p.description || '—'} · Used {p.usageCount ?? 0}{p.maxUsage ? `/${p.maxUsage}` : ''} · Expires {formatDate(p.expiresAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => openEdit(p)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeactivate(p)}
                                            disabled={!!actionLoading[id]}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Deactivate
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
