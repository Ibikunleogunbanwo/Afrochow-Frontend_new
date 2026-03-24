'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    HelpCircle, LayoutDashboard, ChevronRight, ChevronDown,
    Users, Store, ShoppingBag, Star, Tag, BarChart3,
    Shield, Megaphone, UserPlus, Settings,
} from 'lucide-react';

const SECTIONS = [
    {
        icon: Store,
        title: 'Vendor Management',
        href: '/admin/vendors',
        faqs: [
            {
                q: 'How do I approve a vendor?',
                a: 'Go to Vendors → find the vendor row → click Verify. The vendor will immediately appear as verified and can start receiving orders.',
            },
            {
                q: 'What\'s the difference between Verify and Activate?',
                a: 'Verify confirms the vendor\'s business documents are legitimate. Activate/Suspend controls whether the vendor can receive new orders. A vendor can be verified but still suspended.',
            },
            {
                q: 'Can I undo a verification?',
                a: 'Yes — click Revoke on any verified vendor to remove their verified status without deleting their account.',
            },
        ],
    },
    {
        icon: Users,
        title: 'User Management',
        href: '/admin/users',
        faqs: [
            {
                q: 'Who can change user roles?',
                a: 'Only SUPERADMIN accounts can change roles or delete users. Regular ADMIN accounts can activate/suspend non-admin users.',
            },
            {
                q: 'Can I delete a SUPERADMIN?',
                a: 'No. SUPERADMIN accounts are fully protected — they cannot be modified, suspended, or deleted through the dashboard.',
            },
            {
                q: 'How do I promote an admin to SUPERADMIN?',
                a: 'On the Users page, find an ADMIN-role user and click Promote (only visible to SUPERADMIN accounts). This calls /superadmin/users/{id}/promote.',
            },
        ],
    },
    {
        icon: ShoppingBag,
        title: 'Orders',
        href: '/admin/orders',
        faqs: [
            {
                q: 'What order statuses are there?',
                a: 'PENDING → CONFIRMED → PREPARING → READY → DELIVERING → DELIVERED. Orders can also be CANCELLED at any stage.',
            },
            {
                q: 'Can admins cancel orders?',
                a: 'Order status management is handled by vendors and the delivery system. Admin order view is read-only for monitoring.',
            },
        ],
    },
    {
        icon: Star,
        title: 'Reviews',
        href: '/admin/reviews',
        faqs: [
            {
                q: 'What\'s the difference between Hide and Delete?',
                a: 'Hide removes the review from public view but keeps it in the system — it can be restored. Delete permanently removes it.',
            },
            {
                q: 'Can vendors see hidden reviews?',
                a: 'No. Hidden reviews are only visible in the admin dashboard under the Hidden filter.',
            },
        ],
    },
    {
        icon: Tag,
        title: 'Promotions',
        href: '/admin/promotions',
        faqs: [
            {
                q: 'How do I create a promo code?',
                a: 'Go to Promotions → New Promotion → fill in the code, discount %, and optional expiry/usage limit.',
            },
            {
                q: 'Can I update an active promotion?',
                a: 'Yes — click Edit on any promotion to update its details. Changes take effect immediately.',
            },
            {
                q: 'What does Deactivate do?',
                a: 'Deactivating a promotion prevents it from being used at checkout. It does not delete historical usage data.',
            },
        ],
    },
    {
        icon: BarChart3,
        title: 'Analytics',
        href: '/admin/analytics',
        faqs: [
            {
                q: 'What does the Platform Overview show?',
                a: 'Total revenue, order counts, active vendors, average order value, and new user signups over time.',
            },
            {
                q: 'How often is analytics data updated?',
                a: 'Analytics are computed in real time from the database — data is current as of when you load the page.',
            },
        ],
    },
    {
        icon: Megaphone,
        title: 'Broadcast Notifications',
        href: '/admin/broadcast',
        faqs: [
            {
                q: 'Who receives a broadcast?',
                a: 'Choose All Users, Customers only, Vendors only, or Admins only before sending. Broadcasts cannot be undone.',
            },
        ],
    },
    {
        icon: Shield,
        title: 'Permissions & Roles',
        href: null,
        faqs: [
            {
                q: 'What can ADMIN do vs SUPERADMIN?',
                a: 'ADMIN: verify/suspend vendors, activate/suspend customers & vendors, moderate reviews, manage promotions, view analytics. SUPERADMIN: everything ADMIN can do, plus change user roles, delete users, promote/demote admins.',
            },
            {
                q: 'Why am I getting "You don\'t have permission"?',
                a: 'Some backend controllers still use @PreAuthorize("hasRole(\'ADMIN\')") which blocks SUPERADMIN. The fix is to update those to @PreAuthorize("hasAnyRole(\'ADMIN\', \'SUPERADMIN\')").',
            },
        ],
    },
];

const FaqItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-4 py-3.5 text-left"
            >
                <span className="text-sm font-medium text-gray-900">{q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <p className="text-sm text-gray-600 pb-4 leading-relaxed">{a}</p>
            )}
        </div>
    );
};

export default function AdminHelpPage() {
    return (
        <div className="space-y-6 max-w-3xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Help</span>
            </nav>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Help & Documentation</h1>
                <p className="text-gray-500 mt-1">Everything you need to manage the Afrochow platform</p>
            </div>

            {/* Sections */}
            <div className="space-y-4">
                {SECTIONS.map(section => {
                    const Icon = section.icon;
                    return (
                        <div key={section.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Section header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <h2 className="text-sm font-bold text-gray-900">{section.title}</h2>
                                </div>
                                {section.href && (
                                    <Link
                                        href={section.href}
                                        className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        Go to page →
                                    </Link>
                                )}
                            </div>

                            {/* FAQs */}
                            <div className="px-5">
                                {section.faqs.map(faq => (
                                    <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick links */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <p className="text-sm font-bold text-gray-700 mb-3">Quick links</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                        { label: 'Register Admin',  href: '/register/admin',    icon: UserPlus },
                        { label: 'My Profile',      href: '/admin/profile',     icon: Settings },
                        { label: 'Broadcast',       href: '/admin/broadcast',   icon: Megaphone },
                    ].map(l => {
                        const Icon = l.icon;
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                            >
                                <Icon className="w-4 h-4 text-gray-500" />
                                {l.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
