"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users, Star, Calendar, ChevronDown, Clock, MapPin, Package, Eye, MoreVertical, Phone } from 'lucide-react';
import { AuthAPI } from '@/lib/api/auth';

const DashboardContent = () => {
    // Date filter state
    const [dateRange, setDateRange] = useState('today');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Orders state
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
        avgOrderValue: 0,
        rating: 4.8
    });

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

    useEffect(() => {
        fetchOrders();
        fetchRevenue();
    }, [dateRange]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            let response;

            if (dateRange === 'today') {
                response = await AuthAPI.getTodayOrders();
            } else {
                response = await AuthAPI.getVendorOrders();
            }

            if (response?.success) {
                setRecentOrders(response.data || []);
            }
        } catch (error) {
            // Error fetching orders
        } finally {
            setLoading(false);
        }
    };

    const fetchRevenue = async () => {
        try {
            const response = await AuthAPI.getOrdersRevenue();
            if (response?.success && response.data) {
                setStats(prev => ({
                    ...prev,
                    totalOrders: response.data.totalOrders || 0,
                    revenue: response.data.totalRevenue || 0,
                    avgOrderValue: response.data.averageOrderValue || 0
                }));
            }
        } catch (error) {
            // Error fetching revenue
        }
    };

    const handleOrderAction = async (orderId, action) => {
        try {
            let response;
            switch (action) {
                case 'accept':
                    response = await AuthAPI.acceptOrder(orderId);
                    break;
                case 'reject':
                    response = await AuthAPI.rejectOrder(orderId);
                    break;
                case 'preparing':
                    response = await AuthAPI.startPreparingOrder(orderId);
                    break;
                case 'ready':
                    response = await AuthAPI.markOrderReady(orderId);
                    break;
                case 'out-for-delivery':
                    response = await AuthAPI.markOrderOutForDelivery(orderId);
                    break;
                case 'delivered':
                    response = await AuthAPI.markOrderDelivered(orderId);
                    break;
                default:
                    return;
            }

            if (response?.success) {
                await fetchOrders();
                await fetchRevenue();
            }
        } catch (error) {
            // Error performing order action
        }
    };

    // Get display text for selected date range
    const getDateRangeDisplay = () => {
        if (dateRange === 'custom' && customStartDate && customEndDate) {
            return `${customStartDate} - ${customEndDate}`;
        }
        return dateRangeOptions.find(opt => opt.value === dateRange)?.label || 'Today';
    };

    const statsDisplay = [
        {
            name: "Total Orders",
            value: stats.totalOrders.toString(),
            change: "+12%",
            trend: "up",
            icon: ShoppingBag,
            color: "orange"
        },
        {
            name: "Revenue",
            value: `$${stats.revenue.toFixed(2)}`,
            change: "+8.2%",
            trend: "up",
            icon: DollarSign,
            color: "green"
        },
        {
            name: "Avg Order Value",
            value: `$${stats.avgOrderValue.toFixed(2)}`,
            change: "-2.4%",
            trend: "down",
            icon: Users,
            color: "blue"
        },
        {
            name: "Rating",
            value: stats.rating.toFixed(1),
            change: "+0.2",
            trend: "up",
            icon: Star,
            color: "yellow"
        },
    ];

    // Orders are now fetched from API and stored in state

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
            new: {
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                border: 'border-blue-200',
                label: 'New Order',
                pulse: true
            },
            preparing: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                border: 'border-yellow-200',
                label: 'Preparing',
                pulse: false
            },
            ready: {
                bg: 'bg-green-100',
                text: 'text-green-700',
                border: 'border-green-200',
                label: 'Ready',
                pulse: false
            },
            delivered: {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                border: 'border-gray-200',
                label: 'Delivered',
                pulse: false
            }
        };
        return configs[status] || configs.new;
    };

    return (
        <div className="space-y-6">

            {/* Page Header with Date Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here&#39;s what&#39;s happening.</p>
                </div>

                {/* Date Filter */}
                <div className="relative">
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-all font-medium text-gray-700 min-w-50 justify-between"
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
                                                ? 'bg-orange-100 text-orange-700'
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
                                                style={{ color: 'black', backgroundColor: 'white' }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
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
                                                style={{ color: 'black', backgroundColor: 'white' }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                            />
                                        </div>
                                        <button
                                            onClick={applyCustomDateRange}
                                            disabled={!customStartDate || !customEndDate}
                                            className="w-full px-4 py-2 bg-linear-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                {statsDisplay.map((stat) => {
                    const Icon = stat.icon;
                    const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

                    return (
                        <div key={stat.name} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
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
                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
                        <span className="text-sm text-gray-500">{getDateRangeDisplay()}</span>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-linear-to-br from-orange-50 to-red-50 rounded-xl border-2 border-dashed border-orange-200">
                        <div className="text-center">
                            <DollarSign className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                            <p className="text-gray-400 font-semibold">Revenue Chart</p>
                            <p className="text-xs text-gray-400 mt-1">Chart visualization will go here</p>
                        </div>
                    </div>
                </div>

                {/* Orders Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Orders Trend</h2>
                        <span className="text-sm text-gray-500">{getDateRangeDisplay()}</span>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200">
                        <div className="text-center">
                            <ShoppingBag className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                            <p className="text-gray-400 font-semibold">Orders Chart</p>
                            <p className="text-xs text-gray-400 mt-1">Chart visualization will go here</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders - Beautiful Cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage your latest orders</p>
                        </div>
                        <button className="px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                            View All
                        </button>
                    </div>
                </div>

                {/* Orders List */}
                <div className="p-4 space-y-4">
                    {recentOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);

                        return (
                            <div
                                key={order.id}
                                className="p-4 sm:p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all group"
                            >
                                {/* Order Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {order.avatar}
                                        </div>

                                        {/* Customer Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                                                <h3 className="font-bold text-gray-900 truncate">{order.customer}</h3>
                                                <span className="text-xs font-bold text-gray-500">{order.id}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                                    <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{order.time}</span>
                                                </div>
                                                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                                    <Phone className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{order.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text} border-2 ${statusConfig.border} relative`}>
                                            {statusConfig.pulse && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                                            )}
                                            {statusConfig.label}
                                        </div>

                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4">
                                    <div className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                        <Package className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                                        <span>{order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-700 truncate">
                          <span className="font-semibold text-gray-900">{item.qty}x</span> {item.name}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Footer */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    {/* Address */}
                                    <div className="flex items-center text-xs sm:text-sm text-gray-600 min-w-0">
                                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400 shrink-0" />
                                        <span className="truncate">{order.address}</span>
                                    </div>

                                    {/* Price & Button */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                                        <div className="text-left sm:text-right">
                                            <div className="text-xl sm:text-2xl font-black text-gray-900">
                                                ${order.amount.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500">{order.estimatedTime}</div>
                                        </div>

                                        <button className="px-3 sm:px-4 py-2 sm:py-2.5 bg-linear-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg flex items-center space-x-2 whitespace-nowrap">
                                            <Eye className="w-4 h-4" />
                                            <span className="text-sm">View</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default DashboardContent;