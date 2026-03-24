import React from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    ShoppingBag,
    UtensilsCrossed,
    DollarSign,
    UserCircle,
    Star,
    Gift,
    BarChart3,
    HelpCircle,
    Store,
    LogOut,
    Bell,
} from 'lucide-react';
import AvatarDisplay from '@/components/VendorDashboardLayout/AvatarDisplay';

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/vendor/dashboard', badge: null },
    { name: 'Profile', icon: UserCircle, href: '/vendor/profile', badge: null },
    { name: 'Products', icon: UtensilsCrossed, href: '/vendor/menu', badge: null },
    { name: 'View Orders', icon: ShoppingBag, href: '/vendor/orders', badge: null },
    { name: 'View Earnings', icon: DollarSign, href: '/vendor/earnings', badge: null },
    { name: 'Reviews', icon: Star, href: '/vendor/reviews', badge: null },
    { name: 'Promotions', icon: Gift, href: '/vendor/promotions', badge: null },
    { name: 'View Reports', icon: BarChart3, href: '/vendor/reports', badge: null },
    { name: 'Notifications', icon: Bell, href: '/vendor/notifications', badge: null },
    { name: 'Help', icon: HelpCircle, href: '/vendor/help', badge: null },
];

const Sidebar = ({ pathname, user, profileOpen, onProfileToggle, onLogout, profileRef, badgeCounts = {} }) => {
    return (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
            <div className="flex flex-col grow bg-white border-r border-gray-200 overflow-y-auto">
                {/* Logo */}
                <div className="flex items-center shrink-0 px-6 py-5 border-b border-gray-200">
                    <Store className="w-8 h-8 text-orange-600" />
                    <div className="ml-3">
                        <h1 className="text-xl font-black text-gray-900">Afrochow</h1>
                        <p className="text-xs text-gray-500">Vendor Dashboard</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const badge = badgeCounts[item.href] ?? item.badge;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all
                                    ${isActive
                                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                                }
                                `}
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </div>
                                {badge > 0 && (
                                    <span className={`
                                        px-2 py-0.5 text-xs font-bold rounded-full
                                        ${isActive ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}
                                    `}>
                                        {badge > 99 ? '99+' : badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom User Section */}
                <div className="shrink-0 p-4 border-t border-gray-200 space-y-2">
                    {/* User info */}
                    <Link
                        href="/vendor/profile"
                        className="flex items-center w-full px-4 py-3 space-x-3 text-left text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <AvatarDisplay user={user} size="default" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </Link>

                    {/* Logout — always visible */}
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-2.5 space-x-3 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Log out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;