'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    Users, UserCheck, UserX, Trash2, ChevronDown,
    LayoutDashboard, ChevronRight, Search,
    RefreshCw, AlertCircle, ShieldAlert,
} from 'lucide-react';
import { AdminUsersAPI } from '@/lib/api/admin.api';

const ROLES = ['ALL', 'CUSTOMER', 'VENDOR', 'ADMIN'];

const RoleBadge = ({ role }) => {
    const map = {
        ADMIN:    'bg-gray-900 text-white',
        VENDOR:   'bg-gray-200 text-gray-800',
        CUSTOMER: 'bg-gray-100 text-gray-600',
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
    const [users, setUsers]             = useState([]);
    const [stats, setStats]             = useState(null);
    const [roleFilter, setRoleFilter]   = useState('ALL');
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [roleMenu, setRoleMenu]       = useState(null); // publicUserId of open role dropdown
    const searchTimer = useRef(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (search)                res = await AdminUsersAPI.search(search);
            else if (roleFilter !== 'ALL') res = await AdminUsersAPI.getByRole(roleFilter);
            else                        res = await AdminUsersAPI.getAll();
            const data = res?.data ?? res ?? [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [roleFilter, search]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await AdminUsersAPI.getStats();
            setStats(res?.data ?? res);
        } catch (_) {}
    }, []);

    useEffect(() => { fetchUsers(); fetchStats(); }, [fetchUsers, fetchStats]);

    // Debounced search
    const handleSearchInput = (val) => {
        setSearchInput(val);
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
        { label: 'Total Users',    value: stats.totalUsers    ?? 0 },
        { label: 'Active',         value: stats.activeUsers   ?? 0 },
        { label: 'Inactive',       value: stats.inactiveUsers ?? 0 },
        { label: 'Customers',      value: stats.totalCustomers ?? 0 },
        { label: 'Vendors',        value: stats.totalVendors  ?? 0 },
        { label: 'Admins',         value: stats.totalAdmins   ?? 0 },
    ] : [];

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
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {statsCards.map(s => (
                        <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-center">
                            <p className="text-xl font-black text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Table card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
                    <div className="flex gap-2 flex-wrap">
                        {ROLES.map(r => (
                            <button
                                key={r}
                                onClick={() => { setRoleFilter(r); setSearch(''); setSearchInput(''); }}
                                className={`px-3 py-2 text-xs font-semibold rounded-xl capitalize transition-colors ${
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
                    <div className="divide-y divide-gray-100">
                        {users.map(u => (
                            <div key={u.publicUserId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                                {/* Info */}
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-xs font-bold text-gray-600">
                                        {(u.fullName || u.email || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{u.fullName || 'No name'}</p>
                                        <p className="text-xs text-gray-400 truncate">{u.email} · Joined {formatDate(u.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Badges + Actions */}
                                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                    <RoleBadge role={u.role} />
                                    <StatusDot active={u.isActive} />

                                    {/* Change role dropdown (not for ADMIN) */}
                                    {u.role !== 'ADMIN' && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setRoleMenu(prev => prev === u.publicUserId ? null : u.publicUserId)}
                                                disabled={!!actionLoading[u.publicUserId + 'role']}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Role
                                                <ChevronDown className="w-3 h-3" />
                                            </button>
                                            {roleMenu === u.publicUserId && (
                                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[120px] py-1 overflow-hidden">
                                                    {['CUSTOMER', 'VENDOR'].filter(r => r !== u.role).map(r => (
                                                        <button
                                                            key={r}
                                                            onClick={() => handleChangeRole(u.publicUserId, r)}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                                                        >
                                                            Set {r}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Activate / Deactivate (not for ADMIN) */}
                                    {u.role !== 'ADMIN' && (
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

                                    {/* Delete (not for ADMIN) */}
                                    {u.role !== 'ADMIN' && (
                                        <button
                                            onClick={() => handleDelete(u.publicUserId, u.fullName || u.email)}
                                            disabled={!!actionLoading[u.publicUserId + 'delete']}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Delete user"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {u.role === 'ADMIN' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
                                            <ShieldAlert className="w-3 h-3" />
                                            Protected
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
