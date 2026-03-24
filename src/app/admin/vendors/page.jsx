'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Store, CheckCircle2, XCircle, ShieldCheck, ShieldOff,
    LayoutDashboard, ChevronRight, Search, Filter,
    RefreshCw, AlertCircle, ChevronDown,
} from 'lucide-react';
import { AdminVendorsAPI } from '@/lib/api/admin.api';

const FILTERS = ['all', 'pending', 'verified'];

const StatusBadge = ({ verified, active }) => {
    if (!active) return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Suspended
        </span>
    );
    if (verified) return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Verified
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            Pending
        </span>
    );
};

export default function AdminVendorsPage() {
    const [vendors, setVendors]       = useState([]);
    const [filter, setFilter]         = useState('all');
    const [search, setSearch]         = useState('');
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    const fetchVendors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (filter === 'pending')  res = await AdminVendorsAPI.getPending();
            else if (filter === 'verified') res = await AdminVendorsAPI.getVerified();
            else res = await AdminVendorsAPI.getAll();
            const data = res?.data ?? res ?? [];
            setVendors(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Failed to load vendors');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchVendors(); }, [fetchVendors]);

    const doAction = async (id, fn, label) => {
        setActionLoading(p => ({ ...p, [id + label]: true }));
        try {
            await fn(id);
            await fetchVendors();
        } catch (e) {
            alert(e.message || `Failed: ${label}`);
        } finally {
            setActionLoading(p => ({ ...p, [id + label]: false }));
        }
    };

    const filtered = vendors.filter(v =>
        !search || [v.restaurantName, v.cuisineType]
            .some(s => s?.toLowerCase().includes(search.toLowerCase()))
    );

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Vendors</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Vendor Management</h1>
                    <p className="text-gray-500 mt-1">Verify, activate and manage restaurant vendors</p>
                </div>
                <button onClick={fetchVendors} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total',    value: vendors.length },
                    { label: 'Verified', value: vendors.filter(v => v.isVerified).length },
                    { label: 'Pending',  value: vendors.filter(v => !v.isVerified).length },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-2xl font-black text-gray-900">{s.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or cuisine…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                    <div className="flex gap-2">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl capitalize transition-colors ${
                                    filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >{f}</button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading vendors…</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                        <AlertCircle className="h-10 w-10 text-red-400" />
                        <p className="text-sm text-gray-600">{error}</p>
                        <button onClick={fetchVendors} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl">Retry</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Store className="h-12 w-12 text-gray-200" />
                        <p className="text-sm text-gray-400">No vendors found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map(v => (
                            <div key={v.publicVendorId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                                {/* Info */}
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                        <Store className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{v.restaurantName || 'Unnamed'}</p>
                                        <p className="text-xs text-gray-500 truncate">{v.cuisineType || 'N/A'} · Joined {formatDate(v.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Status + Actions */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <StatusBadge verified={v.isVerified} active={v.isActive} />
                                    <div className="flex gap-2">
                                        {/* Verify toggle */}
                                        {v.isVerified ? (
                                            <button
                                                onClick={() => doAction(v.publicVendorId, AdminVendorsAPI.unverify, 'unverify')}
                                                disabled={!!actionLoading[v.publicVendorId + 'unverify']}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <ShieldOff className="w-3.5 h-3.5" />
                                                Revoke
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => doAction(v.publicVendorId, AdminVendorsAPI.verify, 'verify')}
                                                disabled={!!actionLoading[v.publicVendorId + 'verify']}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Verify
                                            </button>
                                        )}
                                        {/* Active toggle */}
                                        {v.isActive ? (
                                            <button
                                                onClick={() => doAction(v.publicVendorId, AdminVendorsAPI.deactivate, 'deactivate')}
                                                disabled={!!actionLoading[v.publicVendorId + 'deactivate']}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                Suspend
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => doAction(v.publicVendorId, AdminVendorsAPI.activate, 'activate')}
                                                disabled={!!actionLoading[v.publicVendorId + 'activate']}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Activate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
