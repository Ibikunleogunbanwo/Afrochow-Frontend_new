"use client";
import React, {useEffect, useState, useRef} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAPI, AdminAnalyticsAPI, AdminReviewsAPI, AdminVendorsAPI } from '@/lib/api/admin.api';
import { AuthAPI } from '@/lib/api/auth.api';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
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
    LayoutGrid,
    Package,
    Truck,
    CreditCard,
    CheckCheck,
} from 'lucide-react';

const AdminDashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const [badges, setBadges] = useState({ orders: 0, reviews: 0, vendors: 0 });
    const bellRef = useRef(null);
    const pathname = usePathname();
    const router = useRouter();

    const { notifications, unreadCount, markRead, markAllRead } = useAdminNotifications();

    // badgeMeta: { label, colors: { default, active } }
    const navItems = [
        { name: 'Dashboard',      icon: LayoutDashboard, href: '/admin/dashboard',    badgeKey: null },
        { name: 'Users',          icon: Users,           href: '/admin/users',         badgeKey: null },
        { name: 'Vendors',        icon: Store,           href: '/admin/vendors',       badgeKey: 'vendors', badgeMeta: { label: 'pending', colors: { default: 'bg-yellow-100 text-yellow-700', active: 'bg-yellow-400/30 text-yellow-100' } } },
        { name: 'Orders',         icon: ShoppingBag,     href: '/admin/orders',        badgeKey: 'orders',  badgeMeta: { label: 'pending',   colors: { default: 'bg-red-100 text-red-700',    active: 'bg-red-400/30 text-red-100'    } } },
        { name: 'Reviews',        icon: Star,            href: '/admin/reviews',       badgeKey: 'reviews', badgeMeta: { label: 'hidden',    colors: { default: 'bg-orange-100 text-orange-700', active: 'bg-orange-400/30 text-orange-100' } } },
        { name: 'Promotions',     icon: Tag,             href: '/admin/promotions',    badgeKey: null },
        { name: 'Categories',     icon: LayoutGrid,      href: '/admin/categories',    badgeKey: null },
        { name: 'Analytics',      icon: BarChart3,       href: '/admin/analytics',     badgeKey: null },
        { name: 'Broadcast',      icon: Megaphone,       href: '/admin/broadcast',     badgeKey: null },
        { name: 'Register Admin', icon: UserPlus,        href: '/admin/register',      badgeKey: null },
        { name: 'Settings',       icon: Settings,        href: '/admin/profile',       badgeKey: null },
        { name: 'Help',           icon: HelpCircle,      href: '/admin/help',          badgeKey: null },
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
                const [platformRes, reviewStatsRes, pendingVendorsRes] = await Promise.allSettled([
                    AdminAnalyticsAPI.getPlatform(),
                    AdminReviewsAPI.getStats(),
                    AdminVendorsAPI.getPending(),
                ]);

                // Pending orders — plain int from GET /analytics/admin/platform
                const platformRaw = platformRes.status === 'fulfilled'
                    ? (platformRes.value?.data ?? platformRes.value ?? {})
                    : {};
                const ordersCount = platformRaw?.pendingOrders ?? 0;

                // Hidden reviews — confirmed field from GET /admin/reviews/stats
                const reviewRaw = reviewStatsRes.status === 'fulfilled'
                    ? (reviewStatsRes.value?.data ?? reviewStatsRes.value ?? {})
                    : {};
                const reviewCount = reviewRaw?.hiddenReviews ?? reviewRaw?.hiddenCount ?? 0;

                // Pending vendor approvals — count of unverified + active stores
                const vendorRaw = pendingVendorsRes.status === 'fulfilled'
                    ? (pendingVendorsRes.value?.data ?? pendingVendorsRes.value ?? [])
                    : [];
                const vendorList = vendorRaw?.content ?? (Array.isArray(vendorRaw) ? vendorRaw : []);
                // Only count stores that are active (not suspended) and unverified
                const vendorCount = vendorList.filter(v => v.isActive !== false && !v.isVerified).length;

                setBadges({ orders: ordersCount, reviews: reviewCount, vendors: vendorCount });
            } catch (_) {}
        };

        fetchData();
        fetchBadges();
    }, []);

    // Close bell dropdown on outside click
    useEffect(() => {
        if (!notificationsOpen) return;
        const handler = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [notificationsOpen]);

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
                                    {item.badgeKey && badges[item.badgeKey] > 0 && (() => {
                                        const count  = badges[item.badgeKey];
                                        const meta   = item.badgeMeta;
                                        const colors = isActive ? meta?.colors?.active : meta?.colors?.default;
                                        return (
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full whitespace-nowrap ${colors ?? (isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700')}`}>
                                                {count}
                                                {meta?.label && <span className="font-medium opacity-80">{meta.label}</span>}
                                            </span>
                                        );
                                    })()}
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
                                        {item.badgeKey && badges[item.badgeKey] > 0 && (() => {
                                            const count  = badges[item.badgeKey];
                                            const meta   = item.badgeMeta;
                                            const colors = isActive ? meta?.colors?.active : meta?.colors?.default;
                                            return (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full whitespace-nowrap ${colors ?? (isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700')}`}>
                                                    {count}
                                                    {meta?.label && <span className="font-medium opacity-80">{meta.label}</span>}
                                                </span>
                                            );
                                        })()}
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
                                <div className="relative" ref={bellRef}>
                                    <button
                                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                                        className="relative p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <Bell className="w-6 h-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Notifications Dropdown */}
                                    {notificationsOpen && (() => {
                                        const unread = notifications.filter((n) => n.unread).slice(0, 3);
                                        const iconMap = {
                                            new_order:    { bg: 'bg-orange-100', color: 'text-orange-600', Icon: Package },
                                            order_update: { bg: 'bg-blue-100',   color: 'text-blue-600',   Icon: Package },
                                            delivery:     { bg: 'bg-blue-100',   color: 'text-blue-600',   Icon: Truck },
                                            payment:      { bg: 'bg-green-100',  color: 'text-green-600',  Icon: CreditCard },
                                            vendor:       { bg: 'bg-amber-100',  color: 'text-amber-600',  Icon: Store },
                                            review:       { bg: 'bg-yellow-100', color: 'text-yellow-600', Icon: Star },
                                            system:       { bg: 'bg-gray-100',   color: 'text-gray-500',   Icon: Bell },
                                        };
                                        return (
                                            <div className="absolute right-0 mt-2 w-[22rem] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
                                                {/* Header */}
                                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                                        {unreadCount > 0 && (
                                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[11px] font-bold rounded-full">
                                                                {unreadCount} new
                                                            </span>
                                                        )}
                                                    </div>
                                                    {unreadCount > 0 && (
                                                        <button
                                                            onClick={markAllRead}
                                                            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 font-medium transition-colors"
                                                        >
                                                            <CheckCheck className="w-3.5 h-3.5" />
                                                            Mark all read
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Notification rows — unread only, max 3 */}
                                                <div className="divide-y divide-gray-50">
                                                    {unread.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                                <Bell className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-700">All caught up!</p>
                                                            <p className="text-xs text-gray-400 mt-1">No unread notifications</p>
                                                        </div>
                                                    ) : (
                                                        unread.map((n) => {
                                                            const { bg, color, Icon } = iconMap[n.icon] ?? iconMap.system;
                                                            return (
                                                                <div
                                                                    key={n.id}
                                                                    className="flex items-start gap-3 px-4 py-3 bg-orange-50/30 hover:bg-gray-50 transition-colors"
                                                                >
                                                                    {/* Icon */}
                                                                    <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5 ${bg}`}>
                                                                        <Icon className={`w-4 h-4 ${color}`} />
                                                                    </div>
                                                                    {/* Text */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold text-gray-900 leading-snug truncate">{n.title}</p>
                                                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-snug">{n.text}</p>
                                                                        <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                                                                    </div>
                                                                    {/* Dismiss (mark read) */}
                                                                    <button
                                                                        onClick={() => markRead(n.id)}
                                                                        className="shrink-0 p-1 text-gray-300 hover:text-gray-500 rounded transition-colors"
                                                                        title="Mark as read"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>

                                                {/* Footer */}
                                                {unreadCount > 3 && (
                                                    <div className="px-4 py-2 text-center bg-gray-50 border-t border-gray-100">
                                                        <p className="text-[11px] text-gray-500">+{unreadCount - 3} more unread</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
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
