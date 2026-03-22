"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { VendorProfileAPI } from '@/lib/api/vendor/profile.api';
import { VendorAnalyticsAPI } from '@/lib/api/vendor/analytics.api';
import { VendorOrdersAPI } from '@/lib/api/vendor/orders.api';
import { toast } from 'sonner';
import {
    Store, Star, ShoppingBag, DollarSign, Package, Clock,
    MapPin, ChevronRight, Pencil, Loader2, CheckCircle2,
    UtensilsCrossed, BarChart3, Calendar, Truck, Gift,
} from 'lucide-react';

const INPUT_CLS = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-900 bg-white transition";

export default function VendorProfilePage() {
    const [profile, setProfile]     = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading]     = useState(true);
    const [editing, setEditing]     = useState(false);
    const [saving, setSaving]       = useState(false);
    const [form, setForm]           = useState({ restaurantName: '', description: '', cuisineType: '' });

    useEffect(() => {
        (async () => {
            try {
                const [profileRes, analyticsRes, revenueRes] = await Promise.allSettled([
                    VendorProfileAPI.getVendorProfile(),
                    VendorAnalyticsAPI.getVendorAnalytics(),
                    VendorOrdersAPI.getOrdersRevenue(),
                ]);
                if (profileRes.status === 'fulfilled' && profileRes.value?.success) {
                    const d = profileRes.value.data;
                    setProfile(d);
                    setForm({ restaurantName: d.restaurantName || '', description: d.description || '', cuisineType: d.cuisineType || '' });
                }
                if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value?.data ?? null);
                if (revenueRes.status === 'fulfilled' && revenueRes.value?.data) {
                    setAnalytics(prev => prev ? { ...prev, ...revenueRes.value.data } : revenueRes.value.data);
                }
            } catch (e) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await VendorProfileAPI.updateVendorProfile({
                restaurantName: form.restaurantName,
                description: form.description,
                cuisineType: form.cuisineType,
            });
            if (res?.success) {
                setProfile(prev => ({ ...prev, ...form }));
                setEditing(false);
                toast.success('Profile updated');
            }
        } catch (e) {
            toast.error(e.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    const totalOrders   = analytics?.totalOrders    ?? 0;
    const totalRevenue  = analytics?.totalRevenue   ?? 0;
    const avgRating     = analytics?.averageRating  ?? profile?.averageRating ?? 0;
    const totalProducts = analytics?.totalProducts  ?? profile?.totalProducts ?? 0;
    const totalReviews  = analytics?.totalReviews   ?? 0;

    const address = profile?.address;
    const addressLine = address
        ? [address.addressLine, address.city, address.province].filter(Boolean).join(', ')
        : null;

    const quickLinks = [
        { label: 'Restaurant Info',    href: '/vendor/profile?tab=profile', icon: Store,          desc: 'Name, cuisine, delivery settings' },
        { label: 'Operating Hours',    href: '/vendor/profile?tab=hours',   icon: Calendar,        desc: 'Set your open & close times' },
        { label: 'Branding',           href: '/vendor/profile?tab=images',  icon: UtensilsCrossed, desc: 'Logo and banner images' },
        { label: 'Menu',               href: '/vendor/menu',                icon: Package,         desc: 'Manage your products' },
        { label: 'Reports',            href: '/vendor/reports',             icon: BarChart3,       desc: 'Revenue and order analytics' },
        { label: 'Promotions',         href: '/vendor/promotions',          icon: Gift,            desc: 'Deals and discount codes' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Hero: Banner + Logo ─────────────────────────────────────────── */}
            <div className="relative">
                {/* Banner */}
                <div className="h-44 sm:h-56 bg-gradient-to-r from-orange-500 to-red-600 relative overflow-hidden">
                    {profile?.bannerUrl ? (
                        <Image src={profile.bannerUrl} alt="Banner" fill className="object-cover" />
                    ) : (
                        <div className="absolute inset-0 opacity-20">
                            {[...Array(6)].map((_, i) => (
                                <Store key={i} className="absolute text-white w-16 h-16 opacity-30"
                                    style={{ top: `${(i * 30) % 80}%`, left: `${(i * 18) % 90}%` }} />
                            ))}
                        </div>
                    )}
                    {/* Edit branding link */}
                    <Link href="/vendor/profile?tab=images"
                        className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/30 hover:bg-black/50 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition-colors">
                        <Pencil className="w-3 h-3" /> Edit branding
                    </Link>
                </div>

                {/* Logo + name row */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="flex items-end gap-4 -mt-10 pb-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden shrink-0">
                            {profile?.logoUrl ? (
                                <Image src={profile.logoUrl} alt="Logo" width={96} height={96} className="object-cover w-full h-full" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                    <Store className="w-10 h-10 text-orange-500" />
                                </div>
                            )}
                        </div>
                        <div className="pb-2 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-black text-gray-900 truncate">
                                    {profile?.restaurantName || 'Your Restaurant'}
                                </h1>
                                {/* Open/Closed badge */}
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    profile?.isOpenNow ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${profile?.isOpenNow ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                    {profile?.isOpenNow ? 'Open Now' : 'Closed'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                                {profile?.cuisineType && <span>{profile.cuisineType}</span>}
                                {avgRating > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                        {parseFloat(avgRating).toFixed(1)}
                                        {totalReviews > 0 && <span className="text-gray-400">({totalReviews})</span>}
                                    </span>
                                )}
                                {addressLine && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {addressLine}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* ── Stats ───────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Orders',   value: totalOrders,  icon: ShoppingBag, color: 'text-orange-600 bg-orange-50' },
                        { label: 'Total Revenue',  value: `$${parseFloat(totalRevenue).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
                        { label: 'Products',       value: totalProducts, icon: Package,     color: 'text-blue-600 bg-blue-50' },
                        { label: 'Rating',         value: avgRating > 0 ? parseFloat(avgRating).toFixed(1) : '—', icon: Star, color: 'text-yellow-600 bg-yellow-50' },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <p className="text-xl font-black text-gray-900">{s.value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* ── About / Inline Edit ─────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900">About</h2>
                        {!editing && (
                            <button onClick={() => setEditing(true)}
                                className="flex items-center gap-1.5 text-sm text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors font-semibold">
                                <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Restaurant name</label>
                                <input className={INPUT_CLS} value={form.restaurantName}
                                    onChange={e => setForm(p => ({ ...p, restaurantName: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Cuisine type</label>
                                <input className={INPUT_CLS} value={form.cuisineType}
                                    onChange={e => setForm(p => ({ ...p, cuisineType: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                                <textarea className={INPUT_CLS} rows={3} value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button onClick={handleSave} disabled={saving}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {saving ? 'Saving…' : 'Save'}
                                </button>
                                <button onClick={() => { setEditing(false); setForm({ restaurantName: profile?.restaurantName || '', description: profile?.description || '', cuisineType: profile?.cuisineType || '' }); }}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 text-sm">
                            {profile?.description ? (
                                <p className="text-gray-600 leading-relaxed">{profile.description}</p>
                            ) : (
                                <p className="text-gray-400 italic">No description yet — click Edit to add one.</p>
                            )}
                            <div className="flex flex-wrap gap-4 pt-1 text-gray-600">
                                {profile?.offersDelivery && (
                                    <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-blue-500" /> Delivery available</span>
                                )}
                                {profile?.offersPickup && (
                                    <span className="flex items-center gap-1.5"><Store className="w-4 h-4 text-orange-500" /> Pickup available</span>
                                )}
                                {profile?.estimatedDeliveryMinutes && (
                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> ~{profile.estimatedDeliveryMinutes} min delivery</span>
                                )}
                                {profile?.minimumOrderAmount && (
                                    <span className="flex items-center gap-1.5"><ShoppingBag className="w-4 h-4 text-gray-400" /> ${profile.minimumOrderAmount} min order</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Quick Links ─────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                        <h2 className="font-bold text-gray-900">Settings & Management</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {quickLinks.map(({ label, href, icon: Icon, desc }) => (
                            <Link key={label} href={href}
                                className="flex items-center justify-between px-5 py-4 hover:bg-orange-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                                        <Icon className="w-4.5 h-4.5 text-orange-600 w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                                        <p className="text-xs text-gray-500">{desc}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
