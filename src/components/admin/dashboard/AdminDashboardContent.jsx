"use client";
import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    ShoppingBag,
    DollarSign,
    Users,
    Calendar,
    ChevronDown,
    Clock,
    Store,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { AdminVendorsAPI } from '@/lib/api/admin.api';
import { AdminUsersAPI } from '@/lib/api/admin.api';

const AdminDashboardContent = () => {
    const [dateRange, setDateRange] = useState('today');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Real data state
    const [userStats, setUserStats] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [pendingVendors, setPendingVendors] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingVendors, setLoadingVendors] = useState(true);
    const [actionLoading, setActionLoading] = useState({});

    const dateRangeOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last7days', label: 'Last 7 Days' },
        { value: 'last30days', label: 'Last 30 Days' },
        { value: 'thisMonth', label: 'This Month' },
        { value: 'lastMonth', label: 'Last Month' },
        { value: 'custom', label: 'Custom Range' },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                const res = await AdminUsersAPI.getStats();
                setUserStats(res?.data ?? res);
            } catch {
                setUserStats(null);
            } finally {
                setLoadingStats(false);
            }
        };

        const fetchVendors = async () => {
            setLoadingVendors(true);
            try {
                const [allRes, pendingRes] = await Promise.all([
                    AdminVendorsAPI.getAll(),
                    AdminVendorsAPI.getPending(),
                ]);
                const allData = allRes?.data ?? allRes ?? [];
                const pendingData = pendingRes?.data ?? pendingRes ?? [];
                setVendors(Array.isArray(allData) ? allData : []);
                setPendingVendors(Array.isArray(pendingData) ? pendingData : []);
            } catch {
                setVendors([]);
                setPendingVendors([]);
            } finally {
                setLoadingVendors(false);
            }
        };

        fetchStats();
        fetchVendors();
    }, []);

    const activeVendors = vendors.filter(v => v.active || v.isActive);

    const stats = [
        {
            name: "Total Users",
            value: loadingStats ? '—' : (userStats?.totalUsers ?? userStats?.total ?? '—').toLocaleString(),
            change: null,
            icon: Users,
        },
        {
            name: "Active Vendors",
            value: loadingVendors ? '—' : activeVendors.length.toLocaleString(),
            change: null,
            icon: Store,
        },
        {
            name: "Platform Revenue",
            value: "—",
            change: null,
            icon: DollarSign,
        },
        {
            name: "Total Orders",
            value: "—",
            change: null,
            icon: ShoppingBag,
        },
    ];

    const getDateRangeDisplay = () => {
        if (dateRange === 'custom' && customStartDate && customEndDate) {
            return `${customStartDate} - ${customEndDate}`;
        }
        return dateRangeOptions.find(opt => opt.value === dateRange)?.label || 'Today';
    };

    const handleDateRangeChange = (value) => {
        setDateRange(value);
        if (value !== 'custom') setShowDatePicker(false);
        else setShowDatePicker(true);
    };

    const applyCustomDateRange = () => {
        if (customStartDate && customEndDate) setShowDatePicker(false);
    };

    const handleVendorAction = async (vendor, action) => {
        const key = `${vendor.publicVendorId}-${action}`;
        setActionLoading(prev => ({ ...prev, [key]: true }));
        try {
            if (action === 'verify') {
                await AdminVendorsAPI.verify(vendor.publicVendorId);
            } else if (action === 'reject') {
                await AdminVendorsAPI.deactivate(vendor.publicVendorId);
            }
            // Remove from pending list after action
            setPendingVendors(prev => prev.filter(v => v.publicVendorId !== vendor.publicVendorId));
            // Refresh full vendor list
            const allRes = await AdminVendorsAPI.getAll();
            const allData = allRes?.data ?? allRes ?? [];
            setVendors(Array.isArray(allData) ? allData : []);
        } catch {
            // silently fail — error visible via network tab
        } finally {
            setActionLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="space-y-6">

            {/* Page Header with Date Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your platform overview.</p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all font-medium text-gray-700 min-w-50 justify-between"
                    >
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="text-sm">{getDateRangeDisplay()}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {showDatePicker && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                            <div className="p-2">
                                {dateRangeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleDateRangeChange(option.value)}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            dateRange === option.value
                                                ? 'bg-gray-100 text-gray-900 font-semibold'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {dateRange === 'custom' && (
                                <div className="p-4 border-t border-gray-200">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                                            <input
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                                            />
                                        </div>
                                        <button
                                            onClick={applyCustomDateRange}
                                            disabled={!customStartDate || !customEndDate}
                                            className="w-full px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Apply Range
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-gray-700" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Platform Revenue</h2>
                        <span className="text-sm text-gray-500">{getDateRangeDisplay()}</span>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <div className="text-center">
                            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400 font-semibold">Revenue Chart</p>
                            <p className="text-xs text-gray-400 mt-1">Chart visualization will go here</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">User Growth</h2>
                        <span className="text-sm text-gray-500">{getDateRangeDisplay()}</span>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <div className="text-center">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400 font-semibold">Growth Chart</p>
                            <p className="text-xs text-gray-400 mt-1">Chart visualization will go here</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Vendor Approvals */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Pending Vendor Approvals</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {loadingVendors
                                    ? 'Loading...'
                                    : `${pendingVendors.length} vendor${pendingVendors.length !== 1 ? 's' : ''} awaiting verification`}
                            </p>
                        </div>
                        <a href="/admin/vendors" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            View All
                        </a>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {loadingVendors ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                    ) : pendingVendors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <CheckCircle className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-semibold">All caught up</p>
                            <p className="text-sm text-gray-400 mt-1">No vendors pending approval</p>
                        </div>
                    ) : (
                        pendingVendors.map((vendor) => {
                            const verifyKey  = `${vendor.publicVendorId}-verify`;
                            const rejectKey  = `${vendor.publicVendorId}-reject`;
                            const isVerifying = actionLoading[verifyKey];
                            const isRejecting = actionLoading[rejectKey];
                            const anyLoading  = isVerifying || isRejecting;

                            return (
                                <div
                                    key={vendor.publicVendorId}
                                    className="p-4 sm:p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all group"
                                >
                                    {/* Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                {getInitials(vendor.restaurantName)}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                                                    <h3 className="font-bold text-gray-900 truncate">{vendor.restaurantName || 'Unnamed Vendor'}</h3>
                                                    <span className="text-xs font-mono text-gray-400">{vendor.publicVendorId}</span>
                                                </div>
                                                <div className="flex items-center text-xs sm:text-sm text-gray-500">
                                                    <Clock className="w-3 h-3 mr-1.5 text-gray-400 shrink-0" />
                                                    <span>Awaiting verification</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pending badge */}
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border-2 border-yellow-200 shrink-0">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Pending Approval
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 space-y-2">
                                        {vendor.cuisineType && (
                                            <div className="flex items-center justify-between text-xs sm:text-sm">
                                                <span className="text-gray-600 font-medium">Cuisine:</span>
                                                <span className="text-gray-900 font-semibold">{vendor.cuisineType}</span>
                                            </div>
                                        )}
                                        {vendor.createdAt && (
                                            <div className="flex items-center justify-between text-xs sm:text-sm">
                                                <span className="text-gray-600 font-medium">Applied:</span>
                                                <span className="text-gray-900 font-semibold">
                                                    {new Date(vendor.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => handleVendorAction(vendor, 'verify')}
                                            disabled={anyLoading}
                                            className="flex-1 px-4 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                                        >
                                            {isVerifying
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <CheckCircle className="w-4 h-4" />
                                            }
                                            <span className="text-sm">Approve</span>
                                        </button>
                                        <button
                                            onClick={() => handleVendorAction(vendor, 'reject')}
                                            disabled={anyLoading}
                                            className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                                        >
                                            {isRejecting
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <Eye className="w-4 h-4" />
                                            }
                                            <span className="text-sm">Review</span>
                                        </button>
                                        <button
                                            onClick={() => handleVendorAction(vendor, 'reject')}
                                            disabled={anyLoading}
                                            className="px-4 py-2.5 bg-white border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            <span className="text-sm">Reject</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

        </div>
    );
};

export default AdminDashboardContent;
