"use client";
import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAPI, AdminVendorsAPI, AdminOrdersAPI, AdminReviewsAPI } from '@/lib/api/admin.api';
import { AuthAPI } from '@/lib/api/auth.api';
import {
    LayoutDashboard,
    Users,
    Store,
    ShoppingBag,
    BarChart3,
    Shield,
    Settings,
    HelpCircle,
    Menu,
    X,
    Bell,
    Search,
    ChevronDown,
    User,
    LogOut,
    MessageSquare,
    Tag,
    UserPlus,
    Star,
    Megaphone,
} from 'lucide-react';

const AdminDashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const [badges, setBadges] = useState({ vendors: 0, orders: 0, reviews: 0 });
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: 'Dashboard',      icon: LayoutDashboard, href: '/admin/dashboard',    badgeKey: null },
        { name: 'Users',          icon: Users,           href: '/admin/users',         badgeKey: null },
        { name: 'Vendors',        icon: Store,           href: '/admin/vendors',       badgeKey: 'vendors' },
        { name: 'Orders',         icon: ShoppingBag,     href: '/admin/orders',        badgeKey: 'orders' },
        { name: 'Reviews',        icon: Star,            href: '/admin/reviews',       badgeKey: 'reviews' },
        { name: 'Promotions',     icon: Tag,             href: '/admin/promotions',    badgeKey: null },
        { name: 'Analytics',      icon: BarChart3,       href: '/admin/analytics',     badgeKey: null },
        { name: 'Broadcast',      icon: Megaphone,       href: '/admin/broadcast',     badgeKey: null },
        { name: 'Register Admin', icon: UserPlus,        href: '/register/admin',      badgeKey: null },
        { name: 'Settings',       icon: Settings,        href: '/admin/profile',       badgeKey: null },
        { name: 'Help',           icon: HelpCircle,      href: '/admin/help',          badgeKey: null },
    ];

    // Mock notifications
    const notifications = [
        { id: 1, text: "New vendor registration pending approval", time: "2 min ago", unread: true },
        { id: 2, text: "Payment dispute reported - Order #12345", time: "1 hour ago", unread: true },
        { id: 3, text: "System backup completed successfully", time: "3 hours ago", unread: false },
    ];

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    };

    const admin = {
        name: `${adminData?.firstName || ""} ${adminData?.lastName || ""}`.trim(),
        email: adminData?.email || "",
        role: adminData?.accessLevel || "",
        avatar: getInitials(adminData?.firstName, adminData?.lastName)
    };



    useEffect(() => {
        const fetchData = async () => {
            try {
                const adminData = await AdminAPI.getAdminData();
                setAdminData(adminData?.data ?? adminData);
            } catch (_) {}
        };

        const fetchBadges = async () => {
            try {
                const [pendingRes, activeOrdersRes, reviewStatsRes] = await Promise.allSettled([
                    AdminVendorsAPI.getPending(),
                    AdminOrdersAPI.getActive(),
                    AdminReviewsAPI.getStats(),
                ]);

                const pendingVendors = pendingRes.status === 'fulfilled'
                    ? (pendingRes.value?.data ?? pendingRes.value ?? [])
                    : [];
                const activeOrders = activeOrdersRes.status === 'fulfilled'
                    ? (activeOrdersRes.value?.data ?? activeOrdersRes.value ?? [])
                    : [];
                const reviewStats = reviewStatsRes.status === 'fulfilled'
                    ? (reviewStatsRes.value?.data ?? reviewStatsRes.value ?? {})
                    : {};

                setBadges({
                    vendors: Array.isArray(pendingVendors) ? pendingVendors.length : 0,
                    orders:  Array.isArray(activeOrders)   ? activeOrders.length  : 0,
                    reviews: reviewStats?.pendingReviews ?? reviewStats?.total ?? 0,
                });
            } catch (_) {}
        };

        fetchData();
        fetchBadges();
    }, []);



    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);
        try {
            const response = await AuthAPI.logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            router.push('/login');
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
                <div className="flex flex-col grow bg-white border-r border-gray-200 overflow-y-auto">

                    {/* Logo */}
                    <div className="flex items-center shrink-0 px-6 py-5 border-b border-gray-200">
                        <Shield className="w-8 h-8 text-gray-900" />
                        <div className="ml-3">
                            <h1 className="text-xl font-black text-gray-900">Afrochow</h1>
                            <p className="text-xs text-gray-500">Admin Dashboard</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all
                    ${isActive
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }
                  `}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.badgeKey && badges[item.badgeKey] > 0 && (
                                        <span className={`
                      px-2 py-0.5 text-xs font-bold rounded-full
                      ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}
                    `}>
                      {badges[item.badgeKey]}
                    </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom User Section */}
                    <div className="shrink-0 p-4 border-t border-gray-200">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center w-full px-4 py-3 space-x-3 text-left text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                                {admin.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{admin.name}</p>
                                <p className="text-xs text-gray-500 truncate">{admin.role}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* Profile Dropdown */}
                        {profileOpen && (
                            <div className="mt-2 py-2 bg-white border border-gray-200 rounded-xl shadow-lg">
                                <Link href="/admin/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    <User className="w-4 h-4 mr-3" />
                                    My Profile
                                </Link>
                                <Link href="/admin/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    <Settings className="w-4 h-4 mr-3" />
                                    Settings
                                </Link>
                                <hr className="my-2" />
                                {/* ✅ LOGOUT BUTTON WITH HANDLER */}
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <LogOut className="w-4 h-4 mr-3" />
                                    {loggingOut ? 'Logging out...' : 'Logout'}
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />

                    <div className="fixed inset-y-0 left-0 flex flex-col w-80 max-w-full bg-white">
                        {/* Mobile Logo */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center">
                                <Shield className="w-8 h-8 text-gray-900" />
                                <div className="ml-3">
                                    <h1 className="text-xl font-black text-gray-900">Afrochow</h1>
                                    <p className="text-xs text-gray-500">Admin Dashboard</p>
                                </div>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`
                      flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all
                      ${isActive
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }
                    `}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </div>
                                        {item.badge && (
                                            <span className={`
                        px-2 py-0.5 text-xs font-bold rounded-full
                        ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}
                      `}>
                        {item.badge}
                      </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Mobile User Section with Logout */}
                        <div className="shrink-0 p-4 border-t border-gray-200">
                            <div className="flex items-center px-4 py-3 space-x-3 mb-2">
                                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                                    {admin.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{admin.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{admin.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            >
                                <LogOut className="w-4 h-4 mr-3" />
                                {loggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="lg:pl-72">

                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">

                            {/* Left - Mobile Menu & Search */}
                            <div className="flex items-center space-x-4 flex-1">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>

                                {/* Search Bar */}
                                <div className="hidden md:flex items-center flex-1 max-w-lg">
                                    <div className="relative w-full">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users, vendors, orders..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right - Notifications & Profile */}
                            <div className="flex items-center space-x-4">

                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                                        className="relative p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100"
                                    >
                                        <Bell className="w-6 h-6" />
                                        {notifications.filter(n => n.unread).length > 0 && (
                                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                    </button>

                                    {/* Notifications Dropdown */}
                                    {notificationsOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                            <div className="px-4 py-3 border-b border-gray-200">
                                                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                                                            notification.unread ? 'bg-gray-50' : ''
                                                        }`}
                                                    >
                                                        <p className="text-sm text-gray-900">{notification.text}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="px-4 py-3 text-center border-t border-gray-200">
                                                <Link href="/admin/broadcast" className="text-sm text-gray-700 font-semibold hover:text-gray-900">
                                                    View all notifications
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Profile - Mobile */}
                                <div className="lg:hidden">
                                    <button className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                                        {admin.name.charAt(0)}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>

            </div>
        </div>
    );
};

export default AdminDashboardLayout;
