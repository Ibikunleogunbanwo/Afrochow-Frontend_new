'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
    LayoutDashboard, ChevronRight, Users, ArrowLeft,
    Mail, Phone, MapPin, Calendar, Shield, RefreshCw,
    AlertCircle, UserCheck, UserX, Trash2, LockOpen,
    Lock, ShieldAlert, ArrowUp, ChevronDown,
    Package, CheckCircle2, XCircle,
} from 'lucide-react';
import { AdminUsersAPI, AdminSuperAPI } from '@/lib/api/admin.api';
import { toast } from '@/components/ui/toast';
import { selectUserRole } from '@/redux-store/authSlice';

const RoleBadge = ({ role }) => {
    const map = {
        SUPERADMIN: 'bg-gray-900 text-white ring-2 ring-gray-400',
        ADMIN:      'bg-gray-900 text-white',
        VENDOR:     'bg-amber-100 text-amber-800 border border-amber-200',
        CUSTOMER:   'bg-blue-100 text-blue-700 border border-blue-200',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${map[role] ?? 'bg-gray-100 text-gray-600'}`}>
            {role}
        </span>
    );
};

const StatusBadge = ({ active }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
        active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
    }`}>
        <span className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
        {active ? 'Active' : 'Suspended'}
    </span>
);

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="w-4 h-4 text-gray-500" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5 break-all">{value || '—'}</p>
        </div>
    </div>
);

const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

export default function AdminUserDetailPage() {
    const { publicUserId } = useParams();
    const router = useRouter();
    const currentRole = useSelector(selectUserRole);
    const isSuperAdmin = currentRole === 'SUPERADMIN';

    const [user, setUser]             = useState(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [actionLoading, setAction]  = useState({});
    const [roleMenu, setRoleMenu]     = useState(false);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await AdminUsersAPI.getById(publicUserId);
            const data = res?.data ?? res;
            console.log('[AdminUserDetail raw]', res);
            console.log('[AdminUserDetail data]', data);
            setUser(data);
        } catch (e) {
            setError(e.message || 'Failed to load user');
        } finally {
            setLoading(false);
        }
    }, [publicUserId]);

    useEffect(() => { fetchUser(); }, [fetchUser]);

    const doAction = async (fn, label, successMsg) => {
        setAction(p => ({ ...p, [label]: true }));
        try {
            await fn(publicUserId);
            await fetchUser();
            toast.success(successMsg);
        } catch (e) {
            toast.error('Action Failed', { description: e.message || `Failed to ${label}` });
        } finally {
            setAction(p => ({ ...p, [label]: false }));
        }
    };

    const handleChangeRole = async (role) => {
        setRoleMenu(false);
        setAction(p => ({ ...p, role: true }));
        try {
            await AdminUsersAPI.changeRole(publicUserId, role);
            await fetchUser();
            toast.success('Role Updated', { description: `Role changed to ${role}` });
        } catch (e) {
            toast.error('Role Change Failed', { description: e.message });
        } finally {
            setAction(p => ({ ...p, role: false }));
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Permanently delete "${user?.fullName || user?.email}"? This cannot be undone.`)) return;
        setAction(p => ({ ...p, delete: true }));
        try {
            await AdminUsersAPI.deleteUser(publicUserId);
            toast.success('User Deleted');
            router.replace('/admin/users');
        } catch (e) {
            toast.error('Delete Failed', { description: e.message });
            setAction(p => ({ ...p, delete: false }));
        }
    };

    const isProtected = user?.role === 'SUPERADMIN';
    const isAdminRole = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

    // ── Derived display values ────────────────────────────────────────────────
    const displayName = user
        ? (user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || null)
        : null;

    const initials = user
        ? ((user.firstName ?? displayName ?? user.email ?? '?').charAt(0)).toUpperCase()
        : '?';

    const totalOrders = user
        ? (user.totalOrders ?? user.orderCount ?? user.totalOrdersCompleted ?? user.ordersCount ?? null)
        : null;

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <Link href="/admin/users" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <Users className="w-3.5 h-3.5" />
                    Users
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                    {loading ? 'Loading…' : (displayName || user?.email || publicUserId)}
                </span>
            </nav>

            {/* Back */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Users
            </button>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading user…</span>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                    <AlertCircle className="h-10 w-10 text-red-400" />
                    <p className="text-sm text-gray-600">{error}</p>
                    <button onClick={fetchUser} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl">Retry</button>
                </div>
            )}

            {/* Content */}
            {!loading && !error && user && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left: Profile card ──────────────────────────────── */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

                            {/* Avatar + name */}
                            <div className="flex flex-col items-center text-center gap-3 pb-5 border-b border-gray-100">
                                {user.profileImageUrl ? (
                                    <img
                                        src={user.profileImageUrl}
                                        alt={displayName || 'User'}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-200 flex items-center justify-center text-orange-600 text-2xl font-black shadow-sm">
                                        {initials}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">{displayName || user.email}</h2>
                                    {displayName && <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>}
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    <RoleBadge role={user.role} />
                                    <StatusBadge active={user.isActive} />
                                    {user.isLocked && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                            <Lock className="w-3.5 h-3.5" /> Locked
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Info rows */}
                            <div className="mt-4">
                                <InfoRow icon={Mail}     label="Email"      value={user.email} />
                                <InfoRow icon={Phone}    label="Phone"      value={user.phone} />
                                <InfoRow icon={Calendar} label="Joined"     value={formatDate(user.createdAt)} />
                                <InfoRow icon={Calendar} label="Last Login" value={formatDate(user.lastLoginAt ?? user.updatedAt)} />
                                <InfoRow icon={Shield}   label="User ID"    value={user.publicUserId} />
                            </div>
                        </div>

                        {/* Address card */}
                        {user.address && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    Address
                                </h3>
                                <div className="text-sm text-gray-600 space-y-0.5">
                                    {user.address.addressLine && <p>{user.address.addressLine}</p>}
                                    <p>{[user.address.city, user.address.province, user.address.postalCode].filter(Boolean).join(', ')}</p>
                                    {user.address.country && <p className="text-gray-400">{user.address.country}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Actions + Stats ─────────────────────────── */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Actions card */}
                        {!isProtected && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-4">Account Actions</h3>
                                <div className="flex flex-wrap gap-3">

                                    {/* Activate / Suspend */}
                                    {!isAdminRole && (
                                        user.isActive ? (
                                            <button
                                                onClick={() => doAction(AdminUsersAPI.deactivate, 'deactivate', 'User Suspended')}
                                                disabled={!!actionLoading.deactivate}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                <UserX className="w-4 h-4" />
                                                Suspend Account
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => doAction(AdminUsersAPI.activate, 'activate', 'User Activated')}
                                                disabled={!!actionLoading.activate}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                Activate Account
                                            </button>
                                        )
                                    )}

                                    {/* Unlock */}
                                    {user.isLocked && (
                                        <button
                                            onClick={() => doAction(AdminUsersAPI.unlock, 'unlock', 'Account Unlocked')}
                                            disabled={!!actionLoading.unlock}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            <LockOpen className="w-4 h-4" />
                                            Unlock Account
                                        </button>
                                    )}

                                    {/* Promote (SUPERADMIN only, for ADMIN) */}
                                    {isSuperAdmin && user.role === 'ADMIN' && (
                                        <button
                                            onClick={() => doAction(AdminSuperAPI.promote, 'promote', 'User Promoted to Super Admin')}
                                            disabled={!!actionLoading.promote}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                            Promote to Super Admin
                                        </button>
                                    )}

                                    {/* Change Role (SUPERADMIN only) */}
                                    {isSuperAdmin && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setRoleMenu(v => !v)}
                                                disabled={!!actionLoading.role}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                <Shield className="w-4 h-4" />
                                                Change Role
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            {roleMenu && (
                                                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[140px] py-1">
                                                    {['CUSTOMER', 'VENDOR', 'ADMIN'].filter(r => r !== user.role).map(r => (
                                                        <button
                                                            key={r}
                                                            onClick={() => handleChangeRole(r)}
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

                                    {/* Delete (SUPERADMIN only, non-admin) */}
                                    {isSuperAdmin && !isAdminRole && (
                                        <button
                                            onClick={handleDelete}
                                            disabled={!!actionLoading.delete}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50 ml-auto"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete User
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {isProtected && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-3">
                                <ShieldAlert className="w-5 h-5 text-gray-400 shrink-0" />
                                <p className="text-sm text-gray-500">
                                    This Super Admin account is fully protected and cannot be modified.
                                </p>
                            </div>
                        )}

                        {/* Stats / summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Account Summary</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    {
                                        label: 'Total Orders',
                                        value: totalOrders !== null ? totalOrders : '—',
                                        icon: Package,
                                    },
                                    {
                                        label: 'Profile',
                                        value: user.isProfileComplete ? 'Complete' : 'Incomplete',
                                        icon: user.isProfileComplete ? CheckCircle2 : XCircle,
                                        color: user.isProfileComplete ? 'text-green-600' : 'text-red-500',
                                    },
                                    {
                                        label: 'Auth',
                                        value: user.authProvider ?? (user.isGoogleUser ? 'Google' : 'Email'),
                                        icon: Shield,
                                    },
                                ].map(({ label, value, icon: Icon, color }) => (
                                    <div key={label} className="p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <Icon className={`w-3.5 h-3.5 ${color ?? 'text-gray-400'}`} />
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none">{label}</p>
                                        </div>
                                        <p className={`text-sm font-bold ${color ?? 'text-gray-900'} break-words`}>{String(value)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={fetchUser}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
