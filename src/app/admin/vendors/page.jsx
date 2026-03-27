'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Store, CheckCircle2, XCircle, ShieldCheck, ShieldOff,
    LayoutDashboard, ChevronRight, Search, Filter,
    RefreshCw, ChevronDown, Eye,
} from 'lucide-react';
import { AdminVendorsAPI } from '@/lib/api/admin.api';
import AdminPageError from '@/components/admin/AdminPageError';
import { AdminTableRoot, AdminTableHeader, AdminTableRow, AdminAvatar } from '@/components/admin/AdminTable';
import Pagination from '@/components/admin/Pagination';
import VendorReviewModal from '@/components/admin/VendorReviewModal';

const PAGE_SIZE = 15;

const FILTERS = [
    { key: 'all',       label: 'All' },
    { key: 'pending',   label: 'Pending' },
    { key: 'verified',  label: 'Verified' },
    { key: 'suspended', label: 'Suspended' },
    { key: 'revoked',   label: 'Revoked' },
];

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
    const [revokedIds, setRevokedIds] = useState(new Set()); // track revoked in-session
    const [filter, setFilter]         = useState('all');
    const [search, setSearch]         = useState('');
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [page, setPage]             = useState(1);
    const [reviewVendor, setReviewVendor] = useState(null); // vendor open in detail modal

    const fetchVendors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await AdminVendorsAPI.getAll();
            const data = res?.data ?? res ?? [];
            setVendors(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Failed to load vendors');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchVendors(); }, [fetchVendors]);

    const doAction = async (id, fn, label) => {
        setActionLoading(p => ({ ...p, [id + label]: true }));
        try {
            await fn(id);
            // Track revoke / re-verify in local state so the card count updates
            // even if the API doesn't return verifiedAt on the vendor object.
            if (label === 'unverify') {
                setRevokedIds(prev => new Set([...prev, id]));
            } else if (label === 'verify') {
                setRevokedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            }
            await fetchVendors();
        } catch (e) {
            alert(e.message || `Failed: ${label}`);
        } finally {
            setActionLoading(p => ({ ...p, [id + label]: false }));
        }
    };

    // A vendor is "revoked" if it was explicitly unverified this session,
    // OR if the API returns verifiedAt (backend may preserve it after unverify).
    const isRevoked = (v) =>
        revokedIds.has(v.publicVendorId) ||
        (!v.isVerified && v.verifiedAt != null);

    const filtered = vendors.filter(v => {
        // text search
        if (search && ![ v.restaurantName, v.cuisineType ]
            .some(s => s?.toLowerCase().includes(search.toLowerCase()))) return false;
        // tab filter
        switch (filter) {
            case 'pending':   return !v.isVerified && v.isActive !== false && !isRevoked(v);
            case 'verified':  return v.isVerified === true;
            case 'suspended': return v.isActive === false;
            case 'revoked':   return isRevoked(v);
            default:          return true;
        }
    });

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    return (
        <div className="space-y-6">
            {reviewVendor && (
                <VendorReviewModal
                    vendor={reviewVendor}
                    onClose={() => setReviewVendor(null)}
                    onApprove={() => { setReviewVendor(null); fetchVendors(); }}
                    onReject={() => { setReviewVendor(null); fetchVendors(); }}
                />
            )}
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

            {/* Stats cards — clickable filters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                    { key: 'all',       label: 'Total',     value: vendors.length },
                    { key: 'verified',  label: 'Verified',  value: vendors.filter(v => v.isVerified).length },
                    { key: 'pending',   label: 'Pending',   value: vendors.filter(v => !v.isVerified && v.isActive !== false && !isRevoked(v)).length },
                    { key: 'suspended', label: 'Suspended', value: vendors.filter(v => v.isActive === false).length },
                    { key: 'revoked',   label: 'Revoked',   value: vendors.filter(v => isRevoked(v)).length },
                ].map(s => (
                    <button
                        key={s.key}
                        onClick={() => { setFilter(s.key); setPage(1); }}
                        className={`bg-white border rounded-2xl p-5 shadow-sm text-left transition-all hover:shadow-md ${
                            filter === s.key ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200'
                        }`}
                    >
                        <p className="text-2xl font-black text-gray-900">{s.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </button>
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
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            style={{ color: 'black', backgroundColor: 'white' }}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                onClick={() => { setFilter(f.key); setPage(1); }}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl capitalize transition-colors ${
                                    filter === f.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >{f.label}</button>
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
                    <AdminPageError error={error} onRetry={fetchVendors} />
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Store className="h-12 w-12 text-gray-200" />
                        <p className="text-sm text-gray-400">No vendors found</p>
                    </div>
                ) : (
                    <AdminTableRoot>
                        <AdminTableHeader columns={[
                            { label: 'Restaurant', className: 'flex-1 min-w-[200px]' },
                            { label: 'Status',     className: 'w-32 shrink-0' },
                            { label: 'Joined',     className: 'w-32 shrink-0' },
                            { label: 'Actions',    className: 'w-44 shrink-0' },
                        ]} />
                        {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(v => (
                            <AdminTableRow key={v.publicVendorId}>
                                {/* Restaurant */}
                                <div className="flex items-center gap-3 flex-1 md:min-w-[200px] overflow-hidden">
                                    <AdminAvatar
                                        initials={<Store className="w-4 h-4 text-gray-600" />}
                                        statusColor={v.isActive === false ? '#ef4444' : v.isVerified ? '#22c55e' : '#f59e0b'}
                                        size="md"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 truncate">{v.restaurantName || 'Unnamed'}</p>
                                        <p className="text-xs text-gray-400 truncate">{v.cuisineType || 'N/A'}</p>
                                        {/* Mobile-only: status + date */}
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 md:hidden">
                                            <StatusBadge verified={v.isVerified} active={v.isActive} />
                                            <span className="text-[11px] text-gray-400">{formatDate(v.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status — desktop only */}
                                <div className="hidden md:block w-32 shrink-0">
                                    <StatusBadge verified={v.isVerified} active={v.isActive} />
                                </div>

                                {/* Joined — desktop only */}
                                <div className="hidden md:block w-32 shrink-0 text-xs text-gray-500">
                                    {formatDate(v.createdAt)}
                                </div>

                                {/* Actions */}
                                <div className="md:w-44 md:shrink-0 flex items-center gap-1.5 flex-wrap">
                                    <button
                                        onClick={() => setReviewVendor(v)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Review
                                    </button>
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
                            </AdminTableRow>
                        ))}
                    </AdminTableRoot>
                )}
                {!loading && !error && filtered.length > PAGE_SIZE && (
                    <Pagination
                        page={page}
                        totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
                        totalItems={filtered.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </div>
    );
}
