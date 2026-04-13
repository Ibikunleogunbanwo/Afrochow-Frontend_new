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
    Bell,
    X, UserCircle, LogOut,
    CheckCircle2, Clock, ShieldOff, XCircle,
} from 'lucide-react';

function getStoreStatus(vendorStatus, isActive, isVerified) {
    switch (vendorStatus) {
        case 'VERIFIED':        return { label: 'Active',       color: 'green',  Icon: CheckCircle2 };
        case 'PROVISIONAL':     return { label: 'Provisional',  color: 'blue',   Icon: Clock        };
        case 'PENDING_REVIEW':  return { label: 'Under Review', color: 'orange', Icon: Clock        };
        case 'PENDING_PROFILE': return { label: 'Incomplete',   color: 'orange', Icon: Clock        };
        case 'SUSPENDED':       return { label: 'Suspended',    color: 'red',    Icon: ShieldOff    };
        case 'REJECTED':        return { label: 'Rejected',     color: 'red',    Icon: XCircle      };
        default: break;
    }
    // Legacy boolean fallback
    if (isActive && isVerified)  return { label: 'Active',       color: 'green',  Icon: CheckCircle2 };
    if (!isActive && isVerified) return { label: 'Suspended',    color: 'red',    Icon: ShieldOff    };
    if (!isActive)               return { label: 'Rejected',     color: 'red',    Icon: XCircle      };
    return                              { label: 'Under Review', color: 'orange', Icon: Clock        };
}

const navItems = [
    { name: 'Dashboard',       icon: LayoutDashboard, href: '/vendor/dashboard',      badge: null },
    { name: 'Profile',         icon: UserCircle,      href: '/vendor/profile',         badge: null },
    { name: 'Products',        icon: UtensilsCrossed, href: '/vendor/menu',            badge: null },
    { name: 'View Orders',     icon: ShoppingBag,     href: '/vendor/orders',          badge: null },
    { name: 'View Earnings',   icon: DollarSign,      href: '/vendor/earnings',        badge: null },
    { name: 'Reviews',         icon: Star,            href: '/vendor/reviews',         badge: null },
    { name: 'Promotions',      icon: Gift,            href: '/vendor/promotions',      badge: null },
    { name: 'View Reports',    icon: BarChart3,       href: '/vendor/reports',         badge: null },
    { name: 'Notifications',   icon: Bell,            href: '/vendor/notifications',   badge: null },
    { name: 'Help',            icon: HelpCircle,      href: '/vendor/help',            badge: null },
];


const MobileSidebar = ({ isOpen, onClose, pathname, onLogout, badgeCounts = {}, vendorStatus, vendorIsActive, vendorIsVerified, vendorVerifiedAt }) => {
    if (!isOpen) return null;

    const status = getStoreStatus(vendorStatus, vendorIsActive, vendorIsVerified);
    const statusColors = {
        green:  { bg: 'bg-green-50',  text: 'text-green-700',  ring: 'ring-green-200'  },
        blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-200'   },
        orange: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200' },
        red:    { bg: 'bg-red-50',    text: 'text-red-700',    ring: 'ring-red-200'    },
    };
    const sc = statusColors[status.color];
    const StatusIcon = status.Icon;

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

                {/* Store status badge */}
                {(vendorStatus !== undefined && vendorStatus !== null) && (
                    <div className={`mx-4 mt-3 mb-1 flex items-center gap-2 rounded-lg px-3 py-2 ring-1 ${sc.bg} ${sc.ring}`}>
                        <StatusIcon className={`w-4 h-4 shrink-0 ${sc.text}`} />
                        <span className={`text-sm font-semibold ${sc.text}`}>
                            Store: {status.label}
                        </span>
                    </div>
                )}

                {/* Mobile Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const badge = badgeCounts[item.href] ?? item.badge;

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