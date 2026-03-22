import React from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    ShoppingBag,
    UtensilsCrossed,
    DollarSign,
    Star,
    Gift,
    BarChart3,
    HelpCircle,
    Store,
    X, UserCircle, LogOut
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/vendor/dashboard', badge: null },
    { name: 'Profile', icon: UserCircle, href: '/vendor/profile', badge: null },
    { name: 'Create Product Menu', icon: UtensilsCrossed, href: '/vendor/menu', badge: null },
    { name: 'View Orders', icon: ShoppingBag, href: '/vendor/orders', badge: 5 },
    { name: 'View Earnings', icon: DollarSign, href: '/vendor/earnings', badge: null },
    { name: 'Reviews', icon: Star, href: '/vendor/reviews', badge: 3 },
    { name: 'Promotions', icon: Gift, href: '/vendor/promotions', badge: null },
    { name: 'View Reports', icon: BarChart3, href: '/vendor/reports', badge: null },
    { name: 'Help', icon: HelpCircle, href: '/vendor/help', badge: null },
];


const MobileSidebar = ({ isOpen, onClose, pathname, onLogout }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 lg:hidden">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-gray-600 bg-opacity-75"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 flex flex-col w-80 max-w-full bg-white">
                {/* Mobile Logo */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center">
                        <Store className="w-8 h-8 text-orange-600" />
                        <div className="ml-3">
                            <h1 className="text-xl font-black text-gray-900">Afrochow</h1>
                            <p className="text-xs text-gray-500">Vendor Dashboard</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                        aria-label="Close menu"
                    >
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
                                onClick={onClose}
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
                                {item.badge && (
                                    <span className={`
                                        px-2 py-0.5 text-xs font-bold rounded-full
                                        ${isActive ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}
                                    `}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="shrink-0 px-4 py-4 border-t border-gray-200">
                    <button
                        onClick={() => { onClose(); onLogout?.(); }}
                        className="flex items-center w-full px-4 py-3 space-x-3 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Log out</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileSidebar;