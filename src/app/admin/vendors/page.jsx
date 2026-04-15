'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Store, CheckCircle2, XCircle, ShieldCheck, ShieldOff,
    LayoutDashboard, ChevronRight, Search, Filter,
    RefreshCw, ChevronDown, Eye, Calendar, X, Clock,
} from 'lucide-react';

// ── Date filter helpers ────────────────────────────────────────────────────
const DATE_OPTIONS = [
    { value: 'today',      label: 'Today' },
    { value: 'yesterday',  label: 'Yesterday' },
    { value: 'last7days',  label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth',  label: 'This Month' },
    { value: 'lastMonth',  label: 'Last Month' },
    { value: 'custom',     label: 'Custom Range' },
];

const getDateBounds = (preset, customStart, customEnd) => {
    const today = new Date(); today.setHours(23, 59, 59, 999);
    const startOfDay = (d) => { const n = new Date(d); n.setHours(0,0,0,0); return n; };
    switch (preset) {
        case 'today':     return { start: startOfDay(today), end: today };
        case 'yesterday': { const y = new Date(today); y.setDate(y.getDate() - 1); return { start: startOfDay(y), end: new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59) }; }
        case 'last7days': { const s = new Date(today); s.setDate(s.getDate() - 6); return { start: startOfDay(s), end: today }; }
        case 'last30days':{ const s = new Date(today); s.setDate(s.getDate() - 29); return { start: startOfDay(s), end: today }; }
        case 'thisMonth': return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today };
        case 'lastMonth': { const s = new Date(today.getFullYear(), today.getMonth() - 1, 1); const e = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59); return { start: s, end: e }; }
        case 'custom':    return customStart && customEnd ? { start: startOfDay(new Date(customStart)), end: new Date(`${customEnd}T23:59:59`) } : null;
        default:          return null;
    }
};

const inDateRange = (dateStr, bounds) => {
    if (!bounds) return true;
    if (!dateStr) return false; // exclude records with no date when a filter is active
    // Java LocalDateTime may include nano/microseconds; strip to milliseconds so Date can parse it
    const normalized = typeof dateStr === 'string' ? dateStr.replace(/(\.\d{3})\d+/, '$1') : dateStr;
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return false;
    return d >= bounds.start && d <= bounds.end;
};
import { AdminVendorsAPI } from '@/lib/api/admin.api';
import { toast } from '@/components/ui/toast';
import AdminPageError from '@/components/admin/AdminPageError';
import { AdminTableRoot, AdminTableHeader, AdminTableRow, AdminAvatar } from '@/components/admin/AdminTable';
import Pagination from '@/components/admin/Pagination';
import VendorReviewModal from '@/components/admin/VendorReviewModal';

const PAGE_SIZE = 15;

// VendorStatus values from backend state machine
const VENDOR_STATUS = {
    PENDING_PROFILE: 'PENDING_PROFILE',
    PENDING_REVIEW:  'PENDING_REVIEW',
    PROVISIONAL:     'PROVISIONAL',
    VERIFIED:        'VERIFIED',
    SUSPENDED:       'SUSPENDED',
    REJECTED:        'REJECTED',
};

const FILTERS = [
    { key: 'all',              label: 'All' },
    { key: 'PENDING_REVIEW',   label: 'Pending Review' },
    { key: 'PROVISIONAL',      label: 'Provisional' },
    { key: 'VERIFIED',         label: 'Verified' },
    { key: 'SUSPENDED',        label: 'Suspended' },
    { key: 'REJECTED',         label: 'Rejected' },
    { key: 'stripe-incomplete', label: 'Stripe Incomplete' },
];

/** Derive status from vendorStatus field (primary) with fallback to legacy booleans. */
const resolveStatus = (v) => {
    if (v.vendorStatus) return v.vendorStatus;
    // Legacy fallback
    if (v.isActive === false && v.isVerified) return VENDOR_STATUS.SUSPENDED;
    if (v.isActive === false)                 return VENDOR_STATUS.REJECTED;
    if (v.isVerified)                         return VENDOR_STATUS.VERIFIED;
    return VENDOR_STATUS.PENDING_REVIEW;
};

const StatusBadge = ({ status }) => {
    switch (status) {
        case VENDOR_STATUS.VERIFIED:
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Verified
                </span>
            );
        case VENDOR_STATUS.PROVISIONAL:
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                    <Clock className="w-3 h-3" />
                    Provisional
                </span>
            );
        case VENDOR_STATUS.PENDING_REVIEW:
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    Pending Review
                </span>
            );
        case VENDOR_STATUS.PENDING_PROFILE:
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    Incomplete Profile
                </span>
            );
        case VENDOR_STATUS.SUSPENDED:
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Suspended
                </span>
            );
        case VENDOR_STATUS.REJECTED:
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    Rejected
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                    {status ?? 'Unknown'}
                </span>
            );
    }
};

export default function AdminVendorsPage() {
    const router = useRouter();
    const [vendors, setVendors]       = useState([]);
    const [filter, setFilter]         = useState('all');
    const [search, setSearch]         = useState('');
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [page, setPage]             = useState(1);
    const [reviewVendor, setReviewVendor] = useState(null);
    const [dateFilter, setDateFilter] = useState('');
    const [showDateMenu, setShowDateMenu] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd]   = useState('');

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

    // Redirect to login when the httpClient fires session-expired
    useEffect(() => {
        const handle = () => router.push('/admin/login');
        window.addEventListener('session-expired', handle);
        return () => window.removeEventListener('session-expired', handle);
    }, [router]);

    const VENDOR_ACTION_LABELS = {
        suspend:           'Vendor Suspended',
        reinstate:         'Vendor Reinstated',
        approveProvisional: 'Vendor Provisionally Approved',
        verifyCert:        'Certificate Verified — Vendor Fully Verified',
        verify:            'Vendor Fully Verified',
        reject:            'Vendor Rejected',
    };

    const doAction = async (id, fn, label) => {
        setActionLoading(p => ({ ...p, [id + label]: true }));
        try {
            await fn(id);
            await fetchVendors();
            toast.success(VENDOR_ACTION_LABELS[label] || 'Action completed');
        } catch (e) {
            if (e?.status === 401) {
                toast.error('Session expired. Please log in again.');
                router.push('/admin/login');
                return;
            }
            toast.error('Action Failed', { description: e.message || `Failed to ${label} vendor` });
        } finally {
            setActionLoading(p => ({ ...p, [id + label]: false }));
        }
    };

    const dateBounds = dateFilter ? getDateBounds(dateFilter, customStart, customEnd) : null;

    const filtered = vendors.filter(v => {
        const status = resolveStatus(v);
        // date registered filter
        if (!inDateRange(v.createdAt, dateBounds)) return false;
        // text search
        if (search && ![ v.restaurantName, v.storeCategory ]
            .some(s => s?.toLowerCase().includes(search.toLowerCase()))) return false;
        // status tab filter
        switch (filter) {
            case 'PENDING_REVIEW':   return status === VENDOR_STATUS.PENDING_REVIEW;
            case 'PROVISIONAL':      return status === VENDOR_STATUS.PROVISIONAL;
            case 'VERIFIED':         return status === VENDOR_STATUS.VERIFIED;
            case 'SUSPENDED':        return status === VENDOR_STATUS.SUSPENDED;
            case 'REJECTED':         return status === VENDOR_STATUS.REJECTED;
            case 'stripe-incomplete': return v.stripeOnboardingComplete === false;
            default:                 return true;
        }
    });

    const dateLabel = (() => {
        if (!dateFilter) return null;
        if (dateFilter === 'custom' && customStart && customEnd) return `${customStart} – ${customEnd}`;
        return DATE_OPTIONS.find(o => o.value === dateFilter)?.label ?? null;
    })();

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
                    <p className="text-gray-500 mt-1">Verify, activate and manage vendors</p>
                </div>
                <button onClick={fetchVendors} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats cards — clickable filters.
                Counts respect search + date bounds and use the same predicates as
                the filter tabs, so clicking a card always shows a matching count. */}
            {(() => {
                // base pool: apply search + date, but no status filter
                const pool = vendors.filter(v => {
                    if (!inDateRange(v.createdAt, dateBounds)) return false;
                    if (search && ![ v.restaurantName, v.storeCategory ]
                        .some(s => s?.toLowerCase().includes(search.toLowerCase()))) return false;
                    return true;
                });
                const statCards = [
                    { key: 'all',            label: 'Total',       value: pool.length },
                    { key: 'VERIFIED',       label: 'Verified',    value: pool.filter(v => resolveStatus(v) === VENDOR_STATUS.VERIFIED).length },
                    { key: 'PROVISIONAL',    label: 'Provisional', value: pool.filter(v => resolveStatus(v) === VENDOR_STATUS.PROVISIONAL).length },
                    { key: 'PENDING_REVIEW', label: 'Pending',     value: pool.filter(v => resolveStatus(v) === VENDOR_STATUS.PENDING_REVIEW).length },
                    { key: 'SUSPENDED',      label: 'Suspended',   value: pool.filter(v => resolveStatus(v) === VENDOR_STATUS.SUSPENDED).length },
                ];
                return (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {statCards.map(s => (
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
                );
            })()}

            {/* Table card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 p-5 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or product type…"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                style={{ color: 'black', backgroundColor: 'white' }}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                        </div>
                        {/* Date registered filter */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDateMenu(v => !v)}
                                className={`inline-flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-medium transition-all ${
                                    dateFilter
                                        ? 'border-gray-900 bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Calendar className="w-4 h-4" />
                                <span>{dateLabel ?? 'Date Joined'}</span>
                                {dateFilter
                                    ? <X className="w-3.5 h-3.5 ml-1 opacity-70 hover:opacity-100" onClick={(e) => { e.stopPropagation(); setDateFilter(''); setCustomStart(''); setCustomEnd(''); setPage(1); }} />
                                    : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                }
                            </button>

                            {showDateMenu && (
                                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                                    <div className="p-2">
                                        {DATE_OPTIONS.map(o => (
                                            <button
                                                key={o.value}
                                                onClick={() => {
                                                    setDateFilter(o.value);
                                                    setPage(1);
                                                    if (o.value !== 'custom') { setShowDateMenu(false); setCustomStart(''); setCustomEnd(''); }
                                                }}
                                                style={{ color: '#374151', backgroundColor: dateFilter === o.value ? '#f3f4f6' : 'white' }}
                                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 ${
                                                    dateFilter === o.value ? 'font-semibold' : ''
                                                }`}
                                            >{o.label}</button>
                                        ))}
                                    </div>
                                    {dateFilter === 'custom' && (
                                        <div className="p-4 border-t border-gray-200 space-y-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">From</label>
                                                <input type="date" value={customStart} onChange={e => { setCustomStart(e.target.value); setPage(1); }}
                                                    style={{ color: 'black', backgroundColor: 'white' }}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">To</label>
                                                <input type="date" value={customEnd} onChange={e => { setCustomEnd(e.target.value); setPage(1); }}
                                                    style={{ color: 'black', backgroundColor: 'white' }}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                                            </div>
                                            <button
                                                onClick={() => { if (customStart && customEnd) setShowDateMenu(false); }}
                                                disabled={!customStart || !customEnd}
                                                className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                            >Apply Range</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status filter pills */}
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

                    {/* Active date filter badge */}
                    {dateLabel && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-fit">
                            <Filter className="w-3 h-3 text-gray-500" />
                            <span>Joined: <span className="font-semibold text-gray-900">{dateLabel}</span></span>
                            <span className="text-gray-400">·</span>
                            <span className="font-semibold text-gray-700">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                            <button onClick={() => { setDateFilter(''); setCustomStart(''); setCustomEnd(''); setPage(1); }} className="ml-1 text-gray-400 hover:text-gray-700">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
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
                        <p className="text-sm text-gray-400">{dateLabel ? 'No vendors registered in this date range' : 'No vendors found'}</p>
                    </div>
                ) : (
                    <AdminTableRoot>
                        <AdminTableHeader columns={[
                            { label: 'Restaurant', className: 'flex-1 min-w-[200px]' },
                            { label: 'Status',     className: 'w-32 shrink-0' },
                            { label: 'Joined',     className: 'w-32 shrink-0' },
                            { label: 'Actions',    className: 'w-44 shrink-0' },
                        ]} />
                        {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(v => {
                            const status = resolveStatus(v);
                            // Status dot colour for avatar
                            const dotColor = {
                                [VENDOR_STATUS.VERIFIED]:        '#22c55e',
                                [VENDOR_STATUS.PROVISIONAL]:     '#3b82f6',
                                [VENDOR_STATUS.PENDING_REVIEW]:  '#f59e0b',
                                [VENDOR_STATUS.PENDING_PROFILE]: '#9ca3af',
                                [VENDOR_STATUS.SUSPENDED]:       '#ef4444',
                                [VENDOR_STATUS.REJECTED]:        '#6b7280',
                            }[status] ?? '#9ca3af';

                            return (
                            <AdminTableRow key={v.publicVendorId}>
                                {/* Restaurant */}
                                <div className="flex items-center gap-3 flex-1 md:min-w-[200px] overflow-hidden">
                                    <AdminAvatar
                                        initials={<Store className="w-4 h-4 text-gray-600" />}
                                        statusColor={dotColor}
                                        size="md"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 truncate">{v.restaurantName || 'Unnamed'}</p>
                                        <p className="text-xs text-gray-400 truncate">{v.storeCategory || 'N/A'}</p>
                                        {/* Mobile-only: status + date */}
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 md:hidden">
                                            <StatusBadge status={status} />
                                            <span className="text-[11px] text-gray-400">{formatDate(v.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status — desktop only */}
                                <div className="hidden md:block w-32 shrink-0">
                                    <StatusBadge status={status} />
                                    {/* Food cert badge for provisional vendors */}
                                    {status === VENDOR_STATUS.PROVISIONAL && v.hasFoodHandlingCert && (
                                        <span className="block text-[10px] text-blue-600 font-semibold mt-1">Cert uploaded</span>
                                    )}
                                </div>

                                {/* Joined — desktop only */}
                                <div className="hidden md:block w-32 shrink-0 text-xs text-gray-500">
                                    {formatDate(v.createdAt)}
                                </div>

                                {/* Actions — state-aware */}
                                <div className="md:w-44 md:shrink-0 flex items-center gap-1.5 flex-wrap">
                                    {(() => {
                                        // PENDING_REVIEW — Review & Decide (approve provisional or reject)
                                        if (status === VENDOR_STATUS.PENDING_REVIEW) {
                                            return (
                                                <button
                                                    onClick={() => setReviewVendor(v)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Review & Decide
                                                </button>
                                            );
                                        }

                                        // PROVISIONAL — verify cert (if cert uploaded) or suspend
                                        if (status === VENDOR_STATUS.PROVISIONAL) {
                                            return (<>
                                                {v.hasFoodHandlingCert && (
                                                    <button
                                                        onClick={() => doAction(v.publicVendorId, AdminVendorsAPI.verifyCert, 'verifyCert')}
                                                        disabled={!!actionLoading[v.publicVendorId + 'verifyCert']}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        Verify Cert
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => doAction(v.publicVendorId, AdminVendorsAPI.suspend, 'suspend')}
                                                    disabled={!!actionLoading[v.publicVendorId + 'suspend']}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Suspend
                                                </button>
                                            </>);
                                        }

                                        // VERIFIED — can only Suspend
                                        if (status === VENDOR_STATUS.VERIFIED) {
                                            return (
                                                <button
                                                    onClick={() => doAction(v.publicVendorId, AdminVendorsAPI.suspend, 'suspend')}
                                                    disabled={!!actionLoading[v.publicVendorId + 'suspend']}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Suspend
                                                </button>
                                            );
                                        }

                                        // SUSPENDED — Reinstate only
                                        if (status === VENDOR_STATUS.SUSPENDED) {
                                            return (
                                                <button
                                                    onClick={() => doAction(v.publicVendorId, AdminVendorsAPI.reinstate, 'reinstate')}
                                                    disabled={!!actionLoading[v.publicVendorId + 'reinstate']}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Reinstate
                                                </button>
                                            );
                                        }

                                        // REJECTED — Review to re-submit pathway
                                        if (status === VENDOR_STATUS.REJECTED) {
                                            return (
                                                <button
                                                    onClick={() => setReviewVendor(v)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Review
                                                </button>
                                            );
                                        }

                                        return null;
                                    })()}
                                </div>
                            </AdminTableRow>
                            );
                        })}
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
