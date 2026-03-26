'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard, ChevronRight, RefreshCw, Plus, Edit2,
    Trash2, X, AlertCircle, ToggleLeft, ToggleRight, GripVertical,
    LayoutGrid,
} from 'lucide-react';
import { AdminCategoriesAPI } from '@/lib/api/admin.api';
import AdminPageError from '@/components/admin/AdminPageError';
import { AdminTableRoot, AdminTableHeader, AdminTableRow } from '@/components/admin/AdminTable';

const EMPTY_FORM = { name: '', description: '', displayOrder: '', imageUrl: '' };

export default function AdminCategoriesPage() {
    const [categories,    setCategories]    = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [showForm,      setShowForm]      = useState(false);
    const [editTarget,    setEditTarget]    = useState(null);
    const [form,          setForm]          = useState(EMPTY_FORM);
    const [formError,     setFormError]     = useState(null);
    const [saving,        setSaving]        = useState(false);
    const [orderTarget,   setOrderTarget]   = useState(null);
    const [orderValue,    setOrderValue]    = useState('');

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res  = await AdminCategoriesAPI.getAll();
            const data = res?.data ?? res ?? [];
            const list = Array.isArray(data) ? data : [];
            setCategories([...list].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
        } catch (e) {
            setError(e.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const resolveId = (c) => c.categoryId ?? c.publicCategoryId ?? c.id;

    const openCreate = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormError(null);
        setShowForm(true);
    };

    const openEdit = (c) => {
        setEditTarget(c);
        setForm({
            name:         c.name         ?? '',
            description:  c.description  ?? '',
            displayOrder: c.displayOrder != null ? String(c.displayOrder) : '',
            imageUrl:     c.imageUrl     ?? '',
        });
        setFormError(null);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setFormError('Category name is required'); return; }
        setSaving(true);
        setFormError(null);
        try {
            const payload = {
                name:         form.name.trim(),
                description:  form.description.trim() || null,
                displayOrder: form.displayOrder !== '' ? parseInt(form.displayOrder, 10) : null,
                imageUrl:     form.imageUrl.trim() || null,
            };
            if (editTarget) {
                await AdminCategoriesAPI.update(resolveId(editTarget), payload);
            } else {
                await AdminCategoriesAPI.create(payload);
            }
            setShowForm(false);
            await fetchCategories();
        } catch (e) {
            setFormError(e.message || 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (c) => {
        if (!confirm(`Permanently delete category "${c.name}"? This cannot be undone.`)) return;
        const id = resolveId(c);
        setActionLoading(prev => ({ ...prev, [id + 'del']: true }));
        try {
            await AdminCategoriesAPI.delete(id);
            await fetchCategories();
        } catch (e) {
            alert(e.message || 'Failed to delete');
        } finally {
            setActionLoading(prev => ({ ...prev, [id + 'del']: false }));
        }
    };

    const handleToggleActive = async (c) => {
        const id  = resolveId(c);
        const key = id + 'toggle';
        setActionLoading(prev => ({ ...prev, [key]: true }));
        try {
            if (c.isActive) {
                await AdminCategoriesAPI.deactivate(id);
            } else {
                await AdminCategoriesAPI.activate(id);
            }
            setCategories(prev => prev.map(cat =>
                resolveId(cat) === id ? { ...cat, isActive: !c.isActive } : cat
            ));
        } catch (e) {
            alert(e.message || 'Failed to update status');
            await fetchCategories();
        } finally {
            setActionLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const openOrderModal = (c) => {
        setOrderTarget(c);
        setOrderValue(c.displayOrder != null ? String(c.displayOrder) : '');
    };

    const handleSetOrder = async () => {
        if (!orderTarget || orderValue === '') return;
        const id = resolveId(orderTarget);
        setActionLoading(prev => ({ ...prev, [id + 'order']: true }));
        try {
            await AdminCategoriesAPI.setDisplayOrder(id, parseInt(orderValue, 10));
            setOrderTarget(null);
            await fetchCategories();
        } catch (e) {
            alert(e.message || 'Failed to update order');
        } finally {
            setActionLoading(prev => ({ ...prev, [id + 'order']: false }));
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
                <span className="font-semibold text-gray-900">Categories</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Categories</h1>
                    <p className="text-gray-500 mt-1">Manage food and product categories shown across the platform</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchCategories} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                        <Plus className="h-4 w-4" />
                        New Category
                    </button>
                </div>
            </div>

            {/* Stats */}
            {!loading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-2xl font-black text-gray-900">{categories.length}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Total Categories</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-2xl font-black text-gray-900">{categories.filter(c => c.isActive).length}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Active</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-2xl font-black text-gray-900">{categories.filter(c => !c.isActive).length}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Inactive</p>
                    </div>
                </div>
            )}

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">{editTarget ? 'Edit Category' : 'New Category'}</h2>
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
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => field('name', e.target.value)}
                                    placeholder="e.g. African Cuisine"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={e => field('description', e.target.value)}
                                    placeholder="Optional short description"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={form.imageUrl}
                                    onChange={e => field('imageUrl', e.target.value)}
                                    placeholder="https://…"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Display Order</label>
                                <input
                                    type="number"
                                    value={form.displayOrder}
                                    onChange={e => field('displayOrder', e.target.value)}
                                    placeholder="e.g. 1"
                                    style={{ color: 'black', backgroundColor: 'white' }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                />
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

            {/* Display Order Modal */}
            {orderTarget && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-gray-900">Set Display Order</h2>
                            <button onClick={() => setOrderTarget(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">Setting order for <span className="font-semibold text-gray-700">{orderTarget.name}</span></p>
                        <input
                            type="number"
                            value={orderValue}
                            onChange={e => setOrderValue(e.target.value)}
                            placeholder="Enter order number"
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setOrderTarget(null)} className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">
                                Cancel
                            </button>
                            <button
                                onClick={handleSetOrder}
                                disabled={!!actionLoading[resolveId(orderTarget) + 'order']}
                                className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50"
                            >
                                Save
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
                        <span className="text-sm">Loading categories…</span>
                    </div>
                ) : error ? (
                    <AdminPageError error={error} onRetry={fetchCategories} />
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <LayoutGrid className="h-12 w-12 text-gray-200" />
                        <p className="text-sm text-gray-400">No categories yet</p>
                        <button onClick={openCreate} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl">Create first category</button>
                    </div>
                ) : (
                    <AdminTableRoot>
                        <AdminTableHeader columns={[
                            { label: 'Category',    className: 'flex-1 min-w-[200px]' },
                            { label: 'Description', className: 'w-48 shrink-0' },
                            { label: 'Order',       className: 'w-20 shrink-0 text-center' },
                            { label: 'Actions',     className: 'w-36 shrink-0' },
                        ]} />
                        {categories.map(c => {
                            const id = resolveId(c);
                            return (
                                <AdminTableRow key={id}>
                                    {/* Category name + status */}
                                    <div className="flex items-center gap-3 flex-1 min-w-[200px] overflow-hidden">
                                        {c.imageUrl ? (
                                            <img src={c.imageUrl} alt={c.name} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-gray-100" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                <LayoutGrid className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 truncate text-sm">{c.name}</p>
                                            <span className={`inline-block mt-0.5 px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                c.isActive
                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {c.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="w-48 shrink-0 text-xs text-gray-400 truncate">
                                        {c.description || '—'}
                                    </div>

                                    {/* Display order */}
                                    <div className="w-20 shrink-0 flex justify-center">
                                        <button
                                            onClick={() => openOrderModal(c)}
                                            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
                                            title="Set display order"
                                        >
                                            <GripVertical className="w-3.5 h-3.5" />
                                            {c.displayOrder ?? '—'}
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="w-36 shrink-0 flex items-center gap-1.5">
                                        <button
                                            onClick={() => handleToggleActive(c)}
                                            disabled={!!actionLoading[id + 'toggle']}
                                            title={c.isActive ? 'Deactivate' : 'Activate'}
                                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {c.isActive
                                                ? <ToggleRight className="w-4 h-4 text-green-600" />
                                                : <ToggleLeft className="w-4 h-4" />
                                            }
                                        </button>
                                        <button
                                            onClick={() => openEdit(c)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c)}
                                            disabled={!!actionLoading[id + 'del']}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Delete category"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
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
