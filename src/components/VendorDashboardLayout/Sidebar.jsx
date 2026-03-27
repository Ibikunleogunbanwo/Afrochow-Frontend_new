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
    ChevronsRight,
    CheckCircle2,
    Clock,
    ShieldOff,
    XCircle,
    ShieldAlert,
} from 'lucide-react';
import AvatarDisplay from '@/components/VendorDashboardLayout/AvatarDisplay';

/**
 * Derive a store status descriptor from isActive + isVerified + verifiedAt.
 * Returns { label, color, Icon, dot } for rendering a status pill.
 */
function getStoreStatus(isActive, isVerified, verifiedAt) {
    if (isActive && isVerified) {
        return { label: 'Active', color: 'green', Icon: CheckCircle2 };
    }
    if (!isActive && isVerified) {
        return { label: 'Suspended', color: 'red', Icon: ShieldOff };
    }
    if (!isActive && !isVerified && verifiedAt) {
        return { label: 'Revoked', color: 'red', Icon: ShieldAlert };
    }
    if (!isActive && !isVerified) {
        return { label: 'Rejected', color: 'red', Icon: XCircle };
    }
    // isActive=true, isVerified=false — pending
    return { label: 'Pending', color: 'orange', Icon: Clock };
}

const navItems = [
    { name: 'Dashboard',       icon: LayoutDashboard, href: '/vendor/dashboard'     },
    { name: 'Profile',         icon: UserCircle,      href: '/vendor/profile'        },
    { name: 'Products',        icon: UtensilsCrossed, href: '/vendor/menu'           },
    { name: 'View Orders',     icon: ShoppingBag,     href: '/vendor/orders'         },
    { name: 'View Earnings',   icon: DollarSign,      href: '/vendor/earnings'       },
    { name: 'Reviews',         icon: Star,            href: '/vendor/reviews'        },
    { name: 'Promotions',      icon: Gift,            href: '/vendor/promotions'     },
    { name: 'View Reports',    icon: BarChart3,       href: '/vendor/reports'        },
    { name: 'Notifications',   icon: Bell,            href: '/vendor/notifications'  },
    { name: 'Help',            icon: HelpCircle,      href: '/vendor/help'           },
];

const Sidebar = ({
    pathname,
    user,
    onLogout,
    badgeCounts = {},
    collapsed = false,
    onCollapsedChange,
    vendorIsActive,
    vendorIsVerified,
    vendorVerifiedAt,
}) => {
    const status = getStoreStatus(vendorIsActive, vendorIsVerified, vendorVerifiedAt);

    const statusColors = {
        green:  { bg: 'bg-green-50',  text: 'text-green-700',  ring: 'ring-green-200',  dot: 'bg-green-500'  },
        orange: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200', dot: 'bg-orange-500' },
        red:    { bg: 'bg-red-50',    text: 'text-red-700',    ring: 'ring-red-200',    dot: 'bg-red-500'    },
    };
    const sc = statusColors[status.color];
    const StatusIcon = status.Icon;

    return (
        <aside
            className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ease-in-out ${
                collapsed ? 'lg:w-16' : 'lg:w-72'
            }`}
        >
            <div className="flex flex-col grow bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden">

                {/* Logo */}
                <div className={`flex items-center shrink-0 border-b border-gray-200 transition-all duration-300 ${
                    collapsed ? 'px-3 py-5 justify-center' : 'px-6 py-5'
                }`}>
                    <Store className="w-8 h-8 text-orange-600 shrink-0" />
                    {!collapsed && (
                        <div className="ml-3 min-w-0">
                            <h1 className="text-xl font-black text-gray-900">Afrochow</h1>
                            <p className="text-xs text-gray-500">Vendor Dashboard</p>
                        </div>
                    )}
                </div>

                {/* Store status badge */}
                {vendorIsActive !== undefined && vendorIsVerified !== undefined && (
                    <div className={`mx-3 mt-2 mb-1 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ring-1 ${sc.bg} ${sc.ring} ${collapsed ? 'justify-center px-0' : ''}`}
                         title={collapsed ? `Store: ${status.label}` : undefined}>
                        <StatusIcon className={`w-3.5 h-3.5 shrink-0 ${sc.text}`} />
                        {!collapsed && (
                            <span className={`text-xs font-semibold ${sc.text}`}>
                                Store: {status.label}
                            </span>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-0.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const badge = badgeCounts[item.href] ?? null;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : undefined}
                                className={`
                                    relative flex items-center h-11 rounded-xl transition-all duration-200
                                    ${collapsed ? 'justify-center px-0' : 'justify-between px-3'}
                                    ${isActive
                                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                                    }
                                `}
                            >
                                <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                                    <div className="grid h-11 w-10 place-content-center shrink-0">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    {!collapsed && (
                                        <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                                    )}
                                </div>

                                {/* Badge — full pill when expanded */}
                                {!collapsed && badge > 0 && (
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                        isActive ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'
                                    }`}>
                                        {badge > 99 ? '99+' : badge}
                                    </span>
                                )}

                                {/* Badge — dot when collapsed */}
                                {collapsed && badge > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom User + Collapse Section */}
                <div className="shrink-0 border-t border-gray-200">

                    {/* User info — hidden when collapsed */}
                    {!collapsed && (
                        <div className="p-3 space-y-1">
                            <Link
                                href="/vendor/profile"
                                className="flex items-center w-full px-3 py-2.5 space-x-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <AvatarDisplay user={user} size="default" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </Link>

                            <button
                                onClick={onLogout}
                                className="flex items-center w-full px-3 py-2.5 space-x-3 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Log out</span>
                            </button>
                        </div>
                    )}

                    {/* Collapse toggle */}
                    <button
                        onClick={() => onCollapsedChange(v => !v)}
                        className="flex items-center w-full border-t border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                    >
                        <div className="grid w-10 h-10 place-content-center shrink-0">
                            <ChevronsRight
                                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                                    collapsed ? '' : 'rotate-180'
                                }`}
                            />
                        </div>
                        {!collapsed && (
                            <span className="text-sm font-medium text-gray-600">Collapse</span>
                        )}
                    </button>
                </div>

            </div>
        </aside>
    );
};

export default Sidebar;
