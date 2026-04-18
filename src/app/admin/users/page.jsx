'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
    Users, UserCheck, UserX, Trash2, ChevronDown,
    LayoutDashboard, ChevronRight, Search,
    RefreshCw, AlertCircle, ShieldAlert, ArrowUp, ArrowDown,
    Calendar, Filter, X, LockOpen, Lock,
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

/** Returns { start: Date, end: Date } | null for the given preset. */
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

/**
 * Spring's @DateTimeFormat(iso = ISO.DATE_TIME) accepts an ISO local date-time
 * (no timezone). We strip the trailing "Z" from {@code toISOString()} so the
 * controller binding succeeds. Time component is preserved so the filter is
 * inclusive at both ends of the day.
 */
const toBackendDateTime = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"
};
import { AdminUsersAPI, AdminSuperAPI } from '@/lib/api/admin.api';
import { toast } from '@/components/ui/toast';
import { selectUserRole } from '@/redux-store/authSlice';
import { formatDate as fmtLocal } from '@/lib/utils/dateUtils';
import { AdminTableRoot, AdminTableHeader, AdminTableRow, AdminAvatar } from '@/components/admin/AdminTable';
import Pagination from '@/components/admin/Pagination';

const PAGE_SIZE = 15;

// Backend: changeRole + delete = SUPERADMIN only
// Backend: activate/deactivate = ADMIN or SUPERADMIN (but not on SUPERADMIN accounts)
// Backend: SUPERADMIN accounts are fully protected from modification

const ROLES = ['ALL', 'CUSTOMER', 'VENDOR', 'ADMIN', 'SUPERADMIN'];

const RoleBadge = ({ role }) => {
    const map = {
        SUPERADMIN: 'bg-gray-900 text-white ring-2 ring-gray-400',
        ADMIN:      'bg-gray-900 text-white',
        VENDOR:     'bg-gray-200 text-gray-800',
        CUSTOMER:   'bg-gray-100 text-gray-600',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[role] ?? 'bg-gray-100 text-gray-600'}`}>
            {role}
        </span>
    );
};

// ── Account-level status (all roles) ─────────────────────────────────────────
const USER_STATUS_META = {
    ACTIVE:               { label: 'Active',               dot: 'bg-green-500',  pill: 'bg-green-50 text-green-700 border-green-200'   },
    PENDING_VERIFICATION: { label: 'Pending Verification',  dot: 'bg-yellow-400', pill: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    SUSPENDED:            { label: 'Suspended',             dot: 'bg-red-500',    pill: 'bg-red-50 text-red-700 border-red-200'          },
    LOCKED:               { label: 'Locked',                dot: 'bg-amber-400',  pill: 'bg-amber-50 text-amber-700 border-amber-200'    },
};

/** Resolves UserStatus — uses the field from the backend, falls back to booleans. */
const resolveUserStatus = (u) => {
    if (u.userStatus) return u.userStatus;
    if (u.isActive === false)        return 'SUSPENDED';
    if (u.isLocked)                  return 'LOCKED';
    if (u.emailVerified === false)   return 'PENDING_VERIFICATION';
    return 'ACTIVE';
};

// ── Vendor workflow status (VENDOR role only) ─────────────────────────────────
const VENDOR_STATUS_META = {
    PENDING_PROFILE: { label: 'Pending Profile', dot: 'bg-gray-400',   pill: 'bg-gray-100 text-gray-600 border-gray-300'   },
    PENDING_REVIEW:  { label: 'Pending Review',  dot: 'bg-amber-400',  pill: 'bg-amber-50 text-amber-700 border-amber-200' },
    PROVISIONAL:     { label: 'Provisional',     dot: 'bg-blue-400',   pill: 'bg-blue-50 text-blue-700 border-blue-200'    },
    VERIFIED:        { label: 'Verified',         dot: 'bg-green-500',  pill: 'bg-green-50 text-green-700 border-green-200' },
    SUSPENDED:       { label: 'Suspended',        dot: 'bg-red-500',    pill: 'bg-red-50 text-red-700 border-red-200'       },
    REJECTED:        { label: 'Rejected',         dot: 'bg-red-700',    pill: 'bg-red-100 text-red-800 border-red-300'      },
};

/** Avatar ring colour: vendor workflow state takes priority for vendors. */
const statusColor = (u) => {
    if (u.role === 'VENDOR' && u.vendorStatus) {
        return { VERIFIED: '#22c55e', PROVISIONAL: '#3b82f6', PENDING_REVIEW: '#f59e0b',
                 PENDING_PROFILE: '#9ca3af', SUSPENDED: '#ef4444', REJECTED: '#b91c1c' }[u.vendorStatus] ?? '#9ca3af';
    }
    return { ACTIVE: '#22c55e', PENDING_VERIFICATION: '#facc15', SUSPENDED: '#ef4444', LOCKED: '#f59e0b' }[resolveUserStatus(u)] ?? '#9ca3af';
};

const UserStatusBadge = ({ user }) => {
    const status = resolveUserStatus(user);
    const meta = USER_STATUS_META[status] ?? USER_STATUS_META.ACTIVE;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
};

const VendorStatusBadge = ({ vendorStatus }) => {
    if (!vendorStatus) return null;
    const meta = VENDOR_STATUS_META[vendorStatus] ?? { label: vendorStatus, dot: 'bg-gray-400', pill: 'bg-gray-100 text-gray-600 border-gray-300' };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
};

export default function AdminUsersPage() {
    const currentRole = useSelector(selectUserRole); // 'ADMIN' or 'SUPERADMIN'
    const isSuperAdmin = currentRole === 'SUPERADMIN';
    const router       = useRouter();
    const searchParams = useSearchParams();

    const [users, setUsers]               = useState([]);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [stats, setStats]               = useState(null);
    const [roleFilter, setRoleFilter]     = useState('ALL');
    const [search, setSearch]             = useState('');
    const [searchInput, setSearchInput]   = useState('');
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all'|'active'|'inactive'|role string
    const [accountStatusFilter, setAccountStatusFilter] = useState('ALL');
    const [vendorStatusFilter, setVendorStatusFilter]   = useState('ALL');
    const [actionLoading, setActionLoading] = useState({});
    const [roleMenu, setRoleMenu]         = useState(null);
    // Initialise page from URL (?page=8) so Back button restores the right page
    const [page, setPage]                 = useState(() => Math.max(1, Number(searchParams.get('page') ?? 1)));
    const [dateFilter, setDateFilter]     = useState('');
    const [showDateMenu, setShowDateMenu] = useState(false);
    const [customStart, setCustomStart]   = useState('');
    const [customEnd, setCustomEnd]       = useState('');
    const dateMenuRef  = useRef(null);
    const searchTimer  = useRef(null);

    // Keep URL in sync with current page so Back restores it
    const goToPage = useCallback((p) => {
        setPage(p);
        const params = new URLSearchParams(window.location.search);
        params.set('page', String(p));
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router]);

    // Build server-side filter params from UI state
    const buildParams = useCallback(() => {
        const params = { page: page - 1, size: PAGE_SIZE };
        // role
        const roleFromStatus = ['CUSTOMER','VENDOR','ADMIN','SUPERADMIN'].includes(statusFilter)
            ? statusFilter : null;
        const activeRole = roleFromStatus ?? (roleFilter !== 'ALL' ? roleFilter : null);
        if (activeRole) params.role = activeRole;
        // active flag
        if (statusFilter === 'active')   params.active = true;
        if (statusFilter === 'inactive') params.active = false;
        // search
        if (search.trim()) params.q = search.trim();
        // date-joined range — pushed to the server so the count and
        // pagination reflect the entire matching set, not just the page
        // that happened to be loaded in the browser.
        const bounds = dateFilter ? getDateBounds(dateFilter, customStart, customEnd) : null;
        if (bounds) {
            params.createdAfter  = toBackendDateTime(bounds.start);
            params.createdBefore = toBackendDateTime(bounds.end);
        }
        return params;
    }, [page, roleFilter, search, statusFilter, dateFilter, customStart, customEnd]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await AdminUsersAPI.getAll(buildParams());
            const data = res?.data ?? res ?? {};
            // New paginated response shape: { content, totalElements, totalPages, page, size }
            if (data.content) {
                setUsers(data.content);
                setTotalPages(data.totalPages ?? 1);
                setTotalElements(data.totalElements ?? data.content.length);
            } else {
                // Legacy flat array fallback (search endpoints still return arrays)
                const arr = Array.isArray(data) ? data : [];
                setUsers(arr);
                setTotalPages(1);
                setTotalElements(arr.length);
            }
        } catch (e) {
            setError(e.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [buildParams]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await AdminUsersAPI.getStats();
            setStats(res?.data ?? res);
        } catch (_) {}
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleSearchInput = (val) => {
        setSearchInput(val);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setSearch(val);
            goToPage(1);  // reset to page 1 only after debounce fires
        }, 400);
    };

    const USER_ACTION_LABELS = {
        promote:    'User Promoted to Super Admin',
        deactivate: 'User Suspended',
        activate:   'User Activated',
        delete:     'User Deleted',
        unlock:     'Account Unlocked',
    };

    const doAction = async (id, fn, label) => {
        setActionLoading(p => ({ ...p, [id + label]: true }));
        try {
            await fn(id);
            await fetchUsers();
            await fetchStats();
            toast.success(USER_ACTION_LABELS[label] || 'Action completed');
        } catch (e) {
            toast.error('Action Failed', { description: e.message || `Failed to ${label} user` });
        } finally {
            setActionLoading(p => ({ ...p, [id + label]: false }));
        }
    };

    const handleChangeRole = async (id, role) => {
        setRoleMenu(null);
        setActionLoading(p => ({ ...p, [id + 'role']: true }));
        try {
            await AdminUsersAPI.changeRole(id, role);
            await fetchUsers();
            toast.success('Role Updated', { description: `User role changed to ${role}` });
        } catch (e) {
            toast.error('Role Change Failed', { description: e.message || 'Failed to change role' });
        } finally {
            setActionLoading(p => ({ ...p, [id + 'role']: false }));
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
        await doAction(id, AdminUsersAPI.deleteUser, 'delete');
    };

    const formatDate = (d) => fmtLocal(d);

    const statsCards = stats ? [
        { key: 'all',        label: 'Total Users',  value: stats.totalUsers      ?? 0 },
        { key: 'active',     label: 'Active',        value: stats.activeUsers     ?? 0 },
        { key: 'inactive',   label: 'Suspended',     value: stats.inactiveUsers   ?? 0 },
        { key: 'CUSTOMER',   label: 'Customers',     value: stats.totalCustomers  ?? 0 },
        { key: 'VENDOR',     label: 'Vendors',       value: stats.totalVendors    ?? 0 },
        { key: 'ADMIN',      label: 'Admins',        value: stats.totalAdmins     ?? 0 },
        { key: 'SUPERADMIN', label: 'Super Admins',  value: stats.totalSuperAdmins ?? 0 },
    ] : [];

    // A user is fully protected if they are SUPERADMIN
    // ADMIN users are protected from role-change/delete (SUPERADMIN-only actions)
    const isProtected   = (u) => u.role === 'SUPERADMIN';
    const isAdminRole   = (u) => u.role === 'ADMIN' || u.role === 'SUPERADMIN';

    // Determine whether we're currently viewing vendors
    const isVendorView = statusFilter === 'VENDOR' || roleFilter === 'VENDOR';

    // Role/active/search/date filtering is now SERVER-SIDE via buildParams().
    // Only client-side filters that can't (yet) be pushed to the server remain:
    // account-level status (derived field, not a column) and vendor workflow status.
    const displayedUsers = users
        .filter(u => accountStatusFilter === 'ALL' || resolveUserStatus(u) === accountStatusFilter)
        .filter(u => !isVendorView || vendorStatusFilter === 'ALL' || u.vendorStatus === vendorStatusFilter);

    const dateLabel = (() => {
        if (!dateFilter) return null;
        if (dateFilter === 'custom' && customStart && customEnd) return `${customStart} – ${customEnd}`;
        return DATE_OPTIONS.find(o => o.value === dateFilter)?.label ?? null;
    })();

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Users</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">Search, filter, and manage all platform users</p>
                </div>
                <button onClick={() => { fetchUsers(); fetchStats(); }} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {statsCards.length > 0 && (
                <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-7 gap-3">
                    {statsCards.map(s => (
                        <button
                            key={s.key}
                            onClick={() => { setStatusFilter(s.key); setRoleFilter('ALL'); setSearch(''); setSearchInput(''); setAccountStatusFilter('ALL'); setVendorStatusFilter('ALL'); goToPage(1); }}
                            className={`bg-white border rounded-2xl p-4 shadow-sm text-center transition-all hover:shadow-md ${
                                statusFilter === s.key ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200'
                            }`}
                        >
                            <p className="text-xl font-black text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Table card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 p-5 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name…"
                                value={searchInput}
                                onChange={e => handleSearchInput(e.target.value)}
                                style={{ color: 'black', backgroundColor: 'white' }}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                        </div>
                        {/* Date registered filter */}
                        <div className="relative" ref={dateMenuRef}>
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
                                    ? <X className="w-3.5 h-3.5 ml-1 opacity-70 hover:opacity-100" onClick={(e) => { e.stopPropagation(); setDateFilter(''); setCustomStart(''); setCustomEnd(''); goToPage(1); }} />
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
                                                    goToPage(1);
                                                    if (o.value !== 'custom') { setShowDateMenu(false); setCustomStart(''); setCustomEnd(''); }
                                                }}
                                                style={{ color: '#374151', backgroundColor: dateFilter === o.value ? '#f3f4f6' : 'white' }}
                                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 ${
                                                    dateFilter === o.value ? 'font-semibold text-gray-900' : ''
                                                }`}
                                            >{o.label}</button>
                                        ))}
                                    </div>
                                    {dateFilter === 'custom' && (
                                        <div className="p-4 border-t border-gray-200 space-y-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">From</label>
                                                <input type="date" value={customStart} onChange={e => { setCustomStart(e.target.value); goToPage(1); }}
                                                    style={{ color: 'black', backgroundColor: 'white' }}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">To</label>
                                                <input type="date" value={customEnd} onChange={e => { setCustomEnd(e.target.value); goToPage(1); }}
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

                    {/* Role filter pills */}
                    <div className="flex gap-2 flex-wrap overflow-x-auto pb-0.5">
                        {ROLES.map(r => (
                            <button
                                key={r}
                                onClick={() => {
                                    setRoleFilter(r);
                                    setSearch(''); setSearchInput('');
                                    setAccountStatusFilter('ALL');
                                    setVendorStatusFilter('ALL');
                                    goToPage(1);
                                }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-colors whitespace-nowrap shrink-0 ${
                                    roleFilter === r && !search ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >{r === 'ALL' ? 'All Roles' : r}</button>
                        ))}
                    </div>

                    {/* Account status filter pills */}
                    <div className="flex gap-2 flex-wrap overflow-x-auto pb-0.5 items-center">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide shrink-0">Account</span>
                        {[
                            { key: 'ALL',               label: 'All'                  },
                            { key: 'ACTIVE',             label: 'Active'               },
                            { key: 'PENDING_VERIFICATION', label: 'Pending Verification' },
                            { key: 'LOCKED',             label: 'Locked'               },
                            { key: 'SUSPENDED',          label: 'Suspended'            },
                        ].map(({ key, label }) => {
                            const meta = USER_STATUS_META[key];
                            const isActive = accountStatusFilter === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => { setAccountStatusFilter(key); goToPage(1); }}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 border ${
                                        isActive
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {meta && !isActive && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                    )}
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Vendor workflow status filter pills — only shown when viewing vendors */}
                    {isVendorView && (
                        <div className="flex gap-2 flex-wrap overflow-x-auto pb-0.5 items-center">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide shrink-0">Vendor</span>
                            {[
                                { key: 'ALL',             label: 'All'             },
                                { key: 'PENDING_PROFILE', label: 'Pending Profile' },
                                { key: 'PENDING_REVIEW',  label: 'Pending Review'  },
                                { key: 'PROVISIONAL',     label: 'Provisional'     },
                                { key: 'VERIFIED',        label: 'Verified'        },
                                { key: 'SUSPENDED',       label: 'Suspended'       },
                                { key: 'REJECTED',        label: 'Rejected'        },
                            ].map(({ key, label }) => {
                                const meta = VENDOR_STATUS_META[key];
                                const isActive = vendorStatusFilter === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => { setVendorStatusFilter(key); goToPage(1); }}
                                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 border ${
                                            isActive
                                                ? 'bg-gray-900 text-white border-gray-900'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {meta && !isActive && (
                                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                        )}
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Active date filter badge */}
                    {dateLabel && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-fit">
                            <Filter className="w-3 h-3 text-gray-500" />
                            <span>Joined: <span className="font-semibold text-gray-900">{dateLabel}</span></span>
                            <span className="text-gray-400">·</span>
                            <span className="font-semibold text-gray-700">{totalElements} result{totalElements !== 1 ? 's' : ''}</span>
                            <button onClick={() => { setDateFilter(''); setCustomStart(''); setCustomEnd(''); goToPage(1); }} className="ml-1 text-gray-400 hover:text-gray-700">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading users…</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                        <AlertCircle className="h-10 w-10 text-red-400" />
                        <p className="text-sm text-gray-600">{error}</p>
                        <button onClick={fetchUsers} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl">Retry</button>
                    </div>
                ) : displayedUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Users className="h-12 w-12 text-gray-200" />
                        <p className="text-sm text-gray-400">{dateLabel ? 'No users registered in this date range' : 'No users found'}</p>
                    </div>
                ) : (
                    <AdminTableRoot>
                        <AdminTableHeader columns={[
                            { label: 'Name',    className: 'flex-1 min-w-[200px]' },
                            { label: 'Role',    className: 'w-32 shrink-0' },
                            { label: 'Status',  className: 'w-28 shrink-0' },
                            { label: 'Joined',  className: 'w-32 shrink-0' },
                            { label: 'Actions', className: 'w-52 shrink-0' },
                        ]} />
                        {displayedUsers.map(u => (
                            <AdminTableRow key={u.publicUserId}>
                                {/* Name col — clicking navigates to user detail */}
                                <Link href={`/admin/users/${u.publicUserId}`} className="flex items-center gap-3 flex-1 md:min-w-[200px] overflow-hidden group">
                                    <AdminAvatar
                                        initials={(u.role === 'VENDOR' && u.restaurantName
                                            ? u.restaurantName
                                            : u.fullName || u.email || '?').charAt(0).toUpperCase()}
                                        statusColor={statusColor(u)}
                                    />
                                    <div className="min-w-0 flex-1">
                                        {/* Vendors: show store name as primary, owner name as subtitle */}
                                        {u.role === 'VENDOR' && u.restaurantName ? (
                                            <>
                                                <p className="font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">{u.restaurantName}</p>
                                                <p className="text-xs text-gray-500 truncate">{u.fullName || 'No name'}</p>
                                                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">{u.fullName || 'No name'}</p>
                                                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                            </>
                                        )}
                                        {/* Mobile-only: role + status + date inline */}
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 md:hidden">
                                            <RoleBadge role={u.role} />
                                            <UserStatusBadge user={u} />
                                            {u.role === 'VENDOR' && <VendorStatusBadge vendorStatus={u.vendorStatus} />}
                                            <span className="text-[11px] text-gray-400">{formatDate(u.createdAt)}</span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Role col — desktop only */}
                                <div className="hidden md:block w-32 shrink-0">
                                    <RoleBadge role={u.role} />
                                </div>

                                {/* Status col — desktop only */}
                                <div className="hidden md:flex md:flex-col w-28 shrink-0 gap-1">
                                    <UserStatusBadge user={u} />
                                    {u.role === 'VENDOR' && <VendorStatusBadge vendorStatus={u.vendorStatus} />}
                                </div>

                                {/* Joined col — desktop only */}
                                <div className="hidden md:block w-32 shrink-0 text-xs text-gray-500">
                                    {formatDate(u.createdAt)}
                                </div>

                                {/* Actions col */}
                                <div className="md:w-52 md:shrink-0 flex items-center gap-1.5 flex-wrap">
                                    {isProtected(u) ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
                                            <ShieldAlert className="w-3 h-3" />
                                            Protected
                                        </span>
                                    ) : (
                                        <>
                                            {isSuperAdmin && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setRoleMenu(prev => prev === u.publicUserId ? null : u.publicUserId)}
                                                        disabled={!!actionLoading[u.publicUserId + 'role']}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        Role <ChevronDown className="w-3 h-3" />
                                                    </button>
                                                    {roleMenu === u.publicUserId && (
                                                        <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-[999] min-w-[140px] py-1">
                                                            {['CUSTOMER', 'VENDOR', 'ADMIN'].filter(r => r !== u.role).map(r => (
                                                                <button
                                                                    key={r}
                                                                    onClick={() => handleChangeRole(u.publicUserId, r)}
                                                                    style={{ color: '#374151', backgroundColor: 'white' }}
                                                                    className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-gray-100 transition-colors"
                                                                >
                                                                    Set {r}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {isSuperAdmin && u.role === 'ADMIN' && (
                                                <button
                                                    onClick={() => doAction(u.publicUserId, AdminSuperAPI.promote, 'promote')}
                                                    disabled={!!actionLoading[u.publicUserId + 'promote']}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Promote to SUPERADMIN"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                    Promote
                                                </button>
                                            )}
                                            {!isAdminRole(u) && (
                                                u.isActive ? (
                                                    <button
                                                        onClick={() => doAction(u.publicUserId, AdminUsersAPI.deactivate, 'deactivate')}
                                                        disabled={!!actionLoading[u.publicUserId + 'deactivate']}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <UserX className="w-3.5 h-3.5" />
                                                        Suspend
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => doAction(u.publicUserId, AdminUsersAPI.activate, 'activate')}
                                                        disabled={!!actionLoading[u.publicUserId + 'activate']}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <UserCheck className="w-3.5 h-3.5" />
                                                        Activate
                                                    </button>
                                                )
                                            )}
                                            {u.isLocked && !isProtected(u) && (
                                                <button
                                                    onClick={() => doAction(u.publicUserId, AdminUsersAPI.unlock, 'unlock')}
                                                    disabled={!!actionLoading[u.publicUserId + 'unlock']}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Clear login lockout"
                                                >
                                                    <LockOpen className="w-3.5 h-3.5" />
                                                    Unlock
                                                </button>
                                            )}
                                            {isSuperAdmin && !isAdminRole(u) && (
                                                <button
                                                    onClick={() => handleDelete(u.publicUserId, (u.role === 'VENDOR' && u.restaurantName) ? u.restaurantName : (u.fullName || u.email))}
                                                    disabled={!!actionLoading[u.publicUserId + 'delete']}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete user"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </AdminTableRow>
                        ))}
                    </AdminTableRoot>
                )}
                {!loading && !error && totalPages > 1 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalItems={totalElements}
                        pageSize={PAGE_SIZE}
                        onPageChange={(p) => { goToPage(p); }}
                    />
                )}
            </div>
        </div>
    );
}
