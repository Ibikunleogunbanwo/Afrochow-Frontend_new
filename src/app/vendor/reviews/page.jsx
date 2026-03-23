'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Star, Store, Package, User, Calendar, MessageSquare,
    TrendingUp, Award, LayoutDashboard, ChevronRight,
} from 'lucide-react';
import { useVendorReviews } from '@/hooks/useVendorReviews';
import { useProductReviews } from '@/hooks/useProductReviews';

const ReviewsPage = () => {
    const [activeTab, setActiveTab] = useState('vendor');

    const {
        reviews: vendorReviews,
        rating: vendorRating,
        loading: vendorLoading,
    } = useVendorReviews({ authenticated: true, autoFetch: true });

    const {
        reviews: productReviews,
        rating: productRating,
        loading: productLoading,
    } = useProductReviews({ allProducts: true, autoFetch: true });

    const loading        = activeTab === 'vendor' ? vendorLoading  : productLoading;
    const currentReviews = activeTab === 'vendor' ? vendorReviews  : productReviews;
    const currentRating  = activeTab === 'vendor' ? vendorRating   : productRating;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-CA', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    };

    const renderStars = (rating, size = 'sm') => {
        const cls = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${cls} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                    />
                ))}
            </div>
        );
    };

    const statsCards = [
        {
            label: 'Vendor Rating',
            value: vendorRating > 0 ? vendorRating.toFixed(1) : '—',
            sub: `${vendorReviews.length} review${vendorReviews.length !== 1 ? 's' : ''}`,
            icon: Store,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            stars: Math.round(vendorRating),
        },
        {
            label: 'Product Rating',
            value: productRating > 0 ? productRating.toFixed(1) : '—',
            sub: `${productReviews.length} review${productReviews.length !== 1 ? 's' : ''}`,
            icon: Package,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            stars: Math.round(productRating),
        },
        {
            label: 'Total Reviews',
            value: (vendorReviews.length + productReviews.length).toString(),
            sub: 'Keep it up!',
            icon: Award,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            stars: null,
        },
    ];

    return (
        <div className="space-y-6">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link href="/vendor/dashboard" className="flex items-center gap-1 hover:text-orange-600 transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="font-semibold text-gray-900">Reviews</span>
            </nav>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Reviews</h1>
                <p className="text-gray-600 mt-1">Manage your restaurant and product reviews</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statsCards.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-11 h-11 ${s.iconBg} rounded-xl flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${s.iconColor}`} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-0.5">{s.label}</p>
                            <p className="text-3xl font-black text-gray-900 mb-2">{s.value}</p>
                            {s.stars !== null
                                ? <div className="flex items-center gap-2">
                                    {renderStars(s.stars)}
                                    <span className="text-xs text-gray-500">{s.sub}</span>
                                  </div>
                                : <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    {s.sub}
                                  </div>
                            }
                        </div>
                    );
                })}
            </div>

            {/* Tabs + content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Tab bar */}
                <div className="border-b border-gray-200">
                    <div className="flex">
                        {[
                            { id: 'vendor',   label: 'Vendor Reviews',  icon: Store,   count: vendorReviews.length  },
                            { id: 'products', label: 'Product Reviews', icon: Package, count: productReviews.length },
                        ].map(({ id, label, icon: Icon, count }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                                    activeTab === id
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    activeTab === id ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                                }`}>{count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Review list */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mb-4" />
                            <p className="text-sm text-gray-500">Loading reviews…</p>
                        </div>
                    ) : currentReviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <MessageSquare className="h-14 w-14 text-gray-200 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No reviews yet</h3>
                            <p className="text-sm text-gray-500 max-w-sm">
                                {activeTab === 'vendor'
                                    ? 'Your restaurant hasn\'t received any reviews yet. Keep providing great service to earn your first review!'
                                    : 'Your products haven\'t received any reviews yet. Deliver quality products to earn reviews!'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {currentReviews.map((review, index) => (
                                <div
                                    key={review.id || review.publicReviewId || `review-${index}`}
                                    className="border border-gray-100 rounded-xl p-5 hover:border-orange-200 hover:shadow-sm transition-all"
                                >
                                    {/* Header row */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 text-sm truncate">
                                                    {review.customerName || 'Anonymous Customer'}
                                                </p>
                                                {activeTab === 'products' && review.productName && (
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                                        {review.productName}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {renderStars(review.rating)}
                                                    <span className="text-xs font-semibold text-gray-700">
                                                        {review.rating?.toFixed(1) || '0.0'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date + verified */}
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatDate(review.createdAt)}
                                            </div>
                                            {review.verified && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    {activeTab === 'vendor' ? 'Verified' : 'Verified Purchase'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-4 py-3">
                                            {review.comment}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewsPage;
