'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    HelpCircle, LayoutDashboard, ChevronRight, ChevronDown,
    Users, Store, ShoppingBag, Star, Tag, BarChart3,
    Shield, Megaphone, UserPlus, Settings, Loader2,
} from 'lucide-react';
import { AdminContentAPI } from '@/lib/api/content.api';

// Icons for the backend FAQ categories (content/faqs/admin.json); unknown ids fall back to a generic icon.
const CATEGORY_ICONS = {
    'vendor-management':       Store,
    'user-management':         Users,
    'orders':                  ShoppingBag,
    'reviews':                 Star,
    'promotions':              Tag,
    'analytics':               BarChart3,
    'broadcast-notifications': Megaphone,
    'permissions-and-roles':   Shield,
};

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
    const [categories, setCategories] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        AdminContentAPI.getFaqs()
            .then(res => setCategories(res?.data?.categories ?? []))
            .catch(e => setError(e.message));
    }, []);

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
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                    Couldn&apos;t load help content: {error}
                </div>
            )}
            {!categories && !error && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading help…
                </div>
            )}
            <div className="space-y-4">
                {categories?.map(section => {
                    const Icon = CATEGORY_ICONS[section.id] ?? HelpCircle;
                    return (
                        <div key={section.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Section header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <h2 className="text-sm font-bold text-gray-900">{section.label}</h2>
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
                                    <FaqItem key={faq.question} q={faq.question} a={faq.answer} />
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
                        { label: 'Register Admin',  href: '/admin/register',    icon: UserPlus },
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
