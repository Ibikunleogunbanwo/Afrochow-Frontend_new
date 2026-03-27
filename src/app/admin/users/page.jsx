'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
    Users, UserCheck, UserX, Trash2, ChevronDown,
    LayoutDashboard, ChevronRight, Search,
    RefreshCw, AlertCircle, ShieldAlert, ArrowUp, ArrowDown,
} from 'lucide-react';
import { AdminUsersAPI, AdminSuperAPI } from '@/lib/api/admin.api';
import { selectUserRole } from '@/redux-store/authSlice';
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

const StatusDot = ({ active }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
    }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
        {active ? 'Active' : 'Inactive'}
    </span>
);

export default function AdminUsersPage() {
    const currentRole = useSelector(selectUserRole); // 'ADMIN' or 'SUPERADMIN'
    const isSuperAdmin = currentRole === 'SUPERADMIN';

    const [users, setUsers]             = useState([]);
    const [stats, setStats]             = useState(null);
    const [roleFilter, setRoleFilter]   = useState('ALL');
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all'|'active'|'inactive'|role string
    const [actionLoading, setActionLoading] = useState({});
    const [roleMenu, setRoleMenu]       = useState(null);
    const [page, setPage]               = useState(1);
    const searchTimer = useRef(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (search)                                           res = await AdminUsersAPI.search(search);
            else if (statusFilter === 'active')                  res = await AdminUsersAPI.getActive();
            else if (statusFilter === 'inactive')                res = await AdminUsersAPI.getInactive();
            else if (['CUSTOMER','VENDOR','ADMIN','SUPERADMIN'].includes(statusFilter))
                                                                  res = await AdminUsersAPI.getByRole(statusFilter);
            else if (roleFilter !== 'ALL')                       res = await AdminUsersAPI.getByRole(roleFilter);
            else                                                 res = await AdminUsersAPI.getAll();
            const data = res?.data ?? res ?? [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [roleFilter, search, statusFilter]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await AdminUsersAPI.getStats();
            setStats(res?.data ?? res);
        } catch (_) {}
    }, []);

    useEffect(() => { fetchUsers(); fetchStats(); }, [fetchUsers, fetchStats, statusFilter]);

    const handleSearchInput = (val) => {
        setSearchInput(val);
        setPage(1);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => setSearch(val), 400);
    };

    const doAction = async (id, fn, label) => {
        setActionLoading(p => ({ ...p, [id + label]: true }));
        try {
            await fn(id);
            await fetchUsers();
            await fetchStats();
        } catch (e) {
            alert(e.message || `Failed: ${label}`);
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
        } catch (e) {
            alert(e.message || 'Failed to change role');
        } finally {
            setActionLoading(p => ({ ...p, [id + 'role']: false }));
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
        await doAction(id, AdminUsersAPI.deleteUser, 'delete');
    };

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';

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
                            onClick={() => { setStatusFilter(s.key); setRoleFilter('ALL'); setSearch(''); setSearchInput(''); setPage(1); }}
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
                <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100">
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
                    <div className="flex gap-2 flex-wrap overflow-x-auto pb-0.5">
                        {ROLES.map(r => (
                            <button
                                key={r}
                                onClick={() => { setRoleFilter(r); setSearch(''); setSearchInput(''); setPage(1); }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-colors whitespace-nowrap shrink-0 ${
                                    roleFilter === r && !search ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >{r === 'ALL' ? 'All Roles' : r}</button>
                        ))}
                    </div>
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
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Users className="h-12 w-12 text-gray-200" />
                        <p className="text-sm text-gray-400">No users found</p>
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
                        {users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(u => (
                            <AdminTableRow key={u.publicUserId}>
                                {/* Name col */}
                                <div className="flex items-center gap-3 flex-1 md:min-w-[200px] overflow-hidden">
                                    <AdminAvatar
                                        initials={(u.fullName || u.email || '?').charAt(0).toUpperCase()}
                                        statusColor={u.isActive ? '#22c55e' : '#ef4444'}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 truncate">{u.fullName || 'No name'}</p>
                                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                        {/* Mobile-only: role + status + date inline */}
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 md:hidden">
                                            <RoleBadge role={u.role} />
                                            <StatusDot active={u.isActive} />
                                            <span className="text-[11px] text-gray-400">{formatDate(u.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Role col — desktop only */}
                                <div className="hidden md:block w-32 shrink-0">
                                    <RoleBadge role={u.role} />
                                </div>

                                {/* Status col — desktop only */}
                                <div className="hidden md:block w-28 shrink-0">
                                    <StatusDot active={u.isActive} />
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
                                            {isSuperAdmin && !isAdminRole(u) && (
                                                <button
                                                    onClick={() => handleDelete(u.publicUserId, u.fullName || u.email)}
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
                {!loading && !error && users.length > PAGE_SIZE && (
                    <Pagination
                        page={page}
                        totalPages={Math.ceil(users.length / PAGE_SIZE)}
                        totalItems={users.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </div>
    );
}
