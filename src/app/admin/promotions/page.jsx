'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Tag, LayoutDashboard, ChevronRight, RefreshCw, Plus,
    Trash2, Edit2, X, AlertCircle, CheckCircle,
} from 'lucide-react';
import { AdminPromotionsAPI } from '@/lib/api/admin.api';
import AdminPageError from '@/components/admin/AdminPageError';
import { AdminTableRoot, AdminTableHeader, AdminTableRow } from '@/components/admin/AdminTable';

const DISCOUNT_TYPES = {
    PERCENTAGE:   'Percentage Off',
    FIXED_AMOUNT: 'Fixed Amount Off',
    FREE_DELIVERY: 'Free Delivery',
};

const NO_VALUE_TYPES = ['FREE_DELIVERY'];

const EMPTY_FORM = {
    code:               '',
    title:              '',
    description:        '',
    type:               'PERCENTAGE',
    value:              '',
    minimumOrderAmount: '',
    maxDiscountAmount:  '',
    usageLimit:         '',
    perUserLimit:       '',
    startDate:          '',
    endDate:            '',
    isActive:           true,
    vendorPublicId:     '',
};

const buildPayload = (form) => ({
    code:               form.code.trim().toUpperCase(),
    title:              form.title.trim(),
    description:        form.description.trim() || null,
    type:               form.type,
    value:              NO_VALUE_TYPES.includes(form.type) ? null : (parseFloat(form.value) || 0),
    minimumOrderAmount: parseFloat(form.minimumOrderAmount) || 0,
    maxDiscountAmount:  form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
    usageLimit:         form.usageLimit ? parseInt(form.usageLimit, 10) : null,
    perUserLimit:       form.perUserLimit ? parseInt(form.perUserLimit, 10) : null,
    startDate:          form.startDate || null,
    endDate:            form.endDate || null,
    isActive:           form.isActive,
    vendorPublicId:     form.vendorPublicId.trim() || null,
});

const formFromPromotion = (p) => ({
    code:               p.code               ?? '',
    title:              p.title              ?? '',
    description:        p.description        ?? '',
    type:               p.type               ?? 'PERCENTAGE',
    value:              p.value              != null ? String(p.value) : '',
    minimumOrderAmount: p.minimumOrderAmount != null ? String(p.minimumOrderAmount) : '',
    maxDiscountAmount:  p.maxDiscountAmount  != null ? String(p.maxDiscountAmount)  : '',
    usageLimit:         p.usageLimit         != null ? String(p.usageLimit)         : '',
    perUserLimit:       p.perUserLimit       != null ? String(p.perUserLimit)       : '',
    startDate:          p.startDate          ? p.startDate.slice(0, 10) : '',
    endDate:            p.endDate            ? p.endDate.slice(0, 10)   : '',
    isActive:           p.isActive           ?? p.isCurrentlyActive ?? true,
    vendorPublicId:     p.vendorPublicId     ?? '',
});

const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

export default function AdminPromotionsPage() {
    const [promotions,    setPromotions]    = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [showForm,      setShowForm]      = useState(false);
    const [editTarget,    setEditTarget]    = useState(null);
    const [form,          setForm]          = useState(EMPTY_FORM);
    const [formError,     setFormError]     = useState(null);
    const [saving,        setSaving]        = useState(false);

    const fetchPromotions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res  = await AdminPromotionsAPI.getAll();
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
        setForm(formFromPromotion(p));
        setFormError(null);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.code.trim())  { setFormError('Promo code is required'); return; }
        if (!form.title.trim()) { setFormError('Title is required'); return; }
        if (!NO_VALUE_TYPES.includes(form.type) && (!form.value || isNaN(form.value))) {
            setFormError('A valid discount value is required');
            return;
        }
        setSaving(true);
        setFormError(null);
        try {
            const payload = buildPayload(form);
            if (editTarget) {
                await AdminPromotionsAPI.update(editTarget.publicPromotionId ?? editTarget.id, payload);
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
        const id = p.publicPromotionId ?? p.id;
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

    const field = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

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

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
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

                            {/* Code + Title */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Promo Code *</label>
                                    <input
                                        type="text"
                                        value={form.code}
                                        onChange={e => field('code', e.target.value.toUpperCase())}
                                        placeholder="SAVE20"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={e => field('title', e.target.value)}
                                        placeholder="Summer Sale"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={e => field('description', e.target.value)}
                                    placeholder="Optional description"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                />
                            </div>

                            {/* Type + Value */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Type *</label>
                                    <select
                                        value={form.type}
                                        onChange={e => field('type', e.target.value)}
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    >
                                        {Object.entries(DISCOUNT_TYPES).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {form.type === 'PERCENTAGE' ? 'Discount %' : form.type === 'FIXED_AMOUNT' ? 'Amount (CA$)' : 'Value'}
                                        {NO_VALUE_TYPES.includes(form.type) ? '' : ' *'}
                                    </label>
                                    <input
                                        type="number"
                                        value={form.value}
                                        onChange={e => field('value', e.target.value)}
                                        placeholder={form.type === 'PERCENTAGE' ? '20' : '5.00'}
                                        disabled={NO_VALUE_TYPES.includes(form.type)}
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-40"
                                    />
                                </div>
                            </div>

                            {/* Min Order + Max Discount */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Min Order (CA$)</label>
                                    <input
                                        type="number"
                                        value={form.minimumOrderAmount}
                                        onChange={e => field('minimumOrderAmount', e.target.value)}
                                        placeholder="0"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Max Discount (CA$)</label>
                                    <input
                                        type="number"
                                        value={form.maxDiscountAmount}
                                        onChange={e => field('maxDiscountAmount', e.target.value)}
                                        placeholder="Optional cap"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    />
                                </div>
                            </div>

                            {/* Usage Limit + Per User */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Usage Limit</label>
                                    <input
                                        type="number"
                                        value={form.usageLimit}
                                        onChange={e => field('usageLimit', e.target.value)}
                                        placeholder="Unlimited"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Per Customer Limit</label>
                                    <input
                                        type="number"
                                        value={form.perUserLimit}
                                        onChange={e => field('perUserLimit', e.target.value)}
                                        placeholder="Unlimited"
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    />
                                </div>
                            </div>

                            {/* Start + End Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={e => field('startDate', e.target.value)}
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={form.endDate}
                                        onChange={e => field('endDate', e.target.value)}
                                        style={{ color: 'black', backgroundColor: 'white' }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    />
                                </div>
                            </div>

                            {/* Vendor Public ID */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Vendor Public ID (optional)</label>
                                <input
                                    type="text"
                                    value={form.vendorPublicId}
                                    onChange={e => field('vendorPublicId', e.target.value)}
                                    placeholder="Leave blank for platform-wide"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                />
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => field('isActive', !form.isActive)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-gray-900' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </div>
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
                    <AdminTableRoot>
                        <AdminTableHeader columns={[
                            { label: 'Code',    className: 'flex-1 min-w-[200px]' },
                            { label: 'Details', className: 'w-52 shrink-0' },
                            { label: 'Status',  className: 'w-24 shrink-0' },
                            { label: 'Actions', className: 'w-36 shrink-0' },
                        ]} />
                        {promotions.map(p => {
                            const id        = p.publicPromotionId ?? p.id;
                            const isExpired = p.endDate && new Date(p.endDate) < new Date();
                            const isActive  = p.isActive ?? p.isCurrentlyActive ?? false;
                            return (
                                <AdminTableRow key={id}>
                                    {/* Code + type */}
                                    <div className="flex items-center gap-3 flex-1 min-w-[200px] overflow-hidden">
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                            <Tag className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 font-mono text-sm truncate">{p.code}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                                                    {p.type === 'PERCENTAGE'    && `${p.value}% off`}
                                                    {p.type === 'FIXED_AMOUNT'  && `CA$${p.value} off`}
                                                    {p.type === 'FREE_DELIVERY' && 'Free Delivery'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="w-52 shrink-0 overflow-hidden">
                                        <p className="text-xs font-medium text-gray-700 truncate">{p.title}</p>
                                        <p className="text-xs text-gray-400 truncate mt-0.5">
                                            Used {p.totalUsageCount ?? 0}{p.usageLimit ? `/${p.usageLimit}` : ''}
                                            {p.endDate ? ` · Ends ${formatDate(p.endDate)}` : ''}
                                        </p>
                                        {isExpired && (
                                            <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">Expired</span>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="w-24 shrink-0">
                                        {isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-green-50 text-green-700 rounded-full border border-green-200">
                                                <CheckCircle className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-700 rounded-full border border-red-200">Inactive</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="w-36 shrink-0 flex items-center gap-1.5">
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
                                </AdminTableRow>
                            );
                        })}
                    </AdminTableRoot>
                )}
            </div>
        </div>
    );
}
