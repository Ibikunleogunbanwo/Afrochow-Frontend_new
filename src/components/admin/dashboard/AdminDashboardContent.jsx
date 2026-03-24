"use client";
import React, { useState } from 'react';
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
    MoreVertical,
    Phone,
    CheckCircle,
    XCircle,
    AlertCircle,
    UserCheck,
    Mail
} from 'lucide-react';

const AdminDashboardContent = () => {
    // Date filter state
    const [dateRange, setDateRange] = useState('today');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Date range options
    const dateRangeOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last7days', label: 'Last 7 Days' },
        { value: 'last30days', label: 'Last 30 Days' },
        { value: 'thisMonth', label: 'This Month' },
        { value: 'lastMonth', label: 'Last Month' },
        { value: 'custom', label: 'Custom Range' },
    ];

    // Get display text for selected date range
    const getDateRangeDisplay = () => {
        if (dateRange === 'custom' && customStartDate && customEndDate) {
            return `${customStartDate} - ${customEndDate}`;
        }
        return dateRangeOptions.find(opt => opt.value === dateRange)?.label || 'Today';
    };

    // Admin stats - platform-wide metrics
    const stats = [
        {
            name: "Total Users",
            value: dateRange === 'today' ? "1,234" : dateRange === 'last7days' ? "8,642" : "45,231",
            change: "+12.4%",
            trend: "up",
            icon: Users,
            color: "blue"
        },
        {
            name: "Active Vendors",
            value: dateRange === 'today' ? "89" : dateRange === 'last7days' ? "89" : "156",
            change: "+5.2%",
            trend: "up",
            icon: Store,
            color: "orange"
        },
        {
            name: "Platform Revenue",
            value: dateRange === 'today' ? "$12,458" : dateRange === 'last7days' ? "$87,185" : "$374,650",
            change: "+18.1%",
            trend: "up",
            icon: DollarSign,
            color: "green"
        },
        {
            name: "Total Orders",
            value: dateRange === 'today' ? "567" : dateRange === 'last7days' ? "3,894" : "18,234",
            change: "+8.3%",
            trend: "up",
            icon: ShoppingBag,
            color: "purple"
        },
    ];

    // Recent activity - admin-focused actions needed
    const recentActivities = [
        {
            id: "#VEN-001",
            activityType: "vendor_registration",
            name: "Mama's Kitchen",
            avatar: "MK",
            phone: "+1 (416) 555-0123",
            email: "contact@mamaskitchen.ca",
            details: {
                businessType: "Restaurant",
                cuisine: "African",
                location: "Toronto, ON"
            },
            status: "pending",
            time: "5 min ago",
            description: "New vendor registration awaiting approval"
        },
        {
            id: "#USR-234",
            activityType: "user_signup",
            name: "John Doe",
            avatar: "JD",
            phone: "+1 (416) 555-0124",
            email: "john.doe@email.com",
            details: {
                accountType: "Customer",
                verified: "Email Verified",
                location: "Toronto, ON"
            },
            status: "active",
            time: "15 min ago",
            description: "New customer account created"
        },
        {
            id: "#DIS-789",
            activityType: "dispute",
            name: "Order #12345 Dispute",
            avatar: "!",
            phone: "+1 (416) 555-0125",
            email: "customer@email.com",
            details: {
                orderAmount: "$89.99",
                vendor: "Jollof Palace",
                issue: "Payment Issue"
            },
            status: "urgent",
            time: "30 min ago",
            description: "Customer reported payment dispute"
        },
        {
            id: "#VEN-002",
            activityType: "vendor_verification",
            name: "Suya Spot",
            avatar: "SS",
            phone: "+1 (416) 555-0126",
            email: "info@suyaspot.com",
            details: {
                businessType: "Street Food",
                cuisine: "Nigerian",
                location: "Mississauga, ON"
            },
            status: "review",
            time: "1 hour ago",
            description: "Documents submitted for verification"
        },
    ];

    const handleDateRangeChange = (value) => {
        setDateRange(value);
        if (value !== 'custom') {
            setShowDatePicker(false);
        } else {
            setShowDatePicker(true);
        }
    };

    const applyCustomDateRange = () => {
        if (customStartDate && customEndDate) {
            setShowDatePicker(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                border: 'border-yellow-200',
                label: 'Pending Approval',
                icon: AlertCircle,
                pulse: true
            },
            active: {
                bg: 'bg-green-100',
                text: 'text-green-700',
                border: 'border-green-200',
                label: 'Active',
                icon: CheckCircle,
                pulse: false
            },
            urgent: {
                bg: 'bg-red-100',
                text: 'text-red-700',
                border: 'border-red-200',
                label: 'Urgent',
                icon: XCircle,
                pulse: true
            },
            review: {
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                border: 'border-blue-200',
                label: 'Under Review',
                icon: Eye,
                pulse: false
            }
        };
        return configs[status] || configs.pending;
    };

    const getActivityTypeIcon = (type) => {
        const icons = {
            vendor_registration: Store,
            user_signup: UserCheck,
            dispute: AlertCircle,
            vendor_verification: CheckCircle
        };
        return icons[type] || Store;
    };

    return (
        <div className="space-y-6">

            {/* Page Header with Date Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your platform overview.</p>
                </div>

                {/* Date Filter */}
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

                    {/* Dropdown */}
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
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                End Date
                                            </label>
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
                    const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

                    return (
                        <div key={stat.name} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-gray-700" />
                                </div>
                                <div className={`flex items-center space-x-1 text-sm font-semibold ${
                                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    <TrendIcon className="w-4 h-4" />
                                    <span>{stat.change}</span>
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
                {/* Platform Revenue Chart */}
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

                {/* User Growth Chart */}
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

            {/* Recent Activities - Admin Actions Needed */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
                            <p className="text-sm text-gray-600 mt-1">Actions requiring your attention</p>
                        </div>
                        <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            View All
                        </button>
                    </div>
                </div>

                {/* Activities List */}
                <div className="p-4 space-y-4">
                    {recentActivities.map((activity) => {
                        const statusConfig = getStatusConfig(activity.status);
                        const TypeIcon = getActivityTypeIcon(activity.activityType);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div
                                key={activity.id}
                                className="p-4 sm:p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all group"
                            >
                                {/* Activity Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm shrink-0">
                                            {activity.avatar}
                                        </div>

                                        {/* Activity Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                                                <h3 className="font-bold text-gray-900 truncate">{activity.name}</h3>
                                                <span className="text-xs font-bold text-gray-500">{activity.id}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                                    <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{activity.time}</span>
                                                </div>
                                                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                                    <TypeIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{activity.description}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text} border-2 ${statusConfig.border} relative flex items-center space-x-1.5`}>
                                            {statusConfig.pulse && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                                </span>
                                            )}
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            <span>{statusConfig.label}</span>
                                        </div>

                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Activity Details */}
                                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4">
                                    <div className="space-y-2">
                                        {Object.entries(activity.details).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between text-xs sm:text-sm">
                                                <span className="text-gray-600 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                <span className="text-gray-900 font-semibold">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                                        <div className="flex items-center text-xs text-gray-600">
                                            <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                            <span>{activity.phone}</span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-600">
                                            <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                            <span>{activity.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button className="flex-1 px-4 py-2.5 bg-linear-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm">Approve</span>
                                    </button>
                                    <button className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-2">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-sm">Review</span>
                                    </button>
                                    <button className="px-4 py-2.5 bg-white border-2 border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center space-x-2">
                                        <XCircle className="w-4 h-4" />
                                        <span className="text-sm">Reject</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default AdminDashboardContent;
