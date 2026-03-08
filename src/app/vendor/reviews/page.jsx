'use client';

import React, { useState, useEffect } from 'react';
import { Star, Store, Package, User, Calendar, MessageSquare, TrendingUp, Award } from 'lucide-react';
import { useVendorReviews } from '@/hooks/useVendorReviews';
import { useProductReviews } from '@/hooks/useProductReviews';

const ReviewsPage = () => {
    const [activeTab, setActiveTab] = useState('vendor'); // 'vendor' or 'products'

    // Fetch vendor reviews using authenticated endpoint
    const {
        reviews: vendorReviews,
        rating: vendorRating,
        loading: vendorLoading
    } = useVendorReviews({
        authenticated: true,
        autoFetch: activeTab === 'vendor'
    });

    // Fetch all product reviews
    const {
        reviews: productReviews,
        rating: productRating,
        loading: productLoading
    } = useProductReviews({
        allProducts: true,
        autoFetch: activeTab === 'products'
    });

    const loading = activeTab === 'vendor' ? vendorLoading : productLoading;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const currentReviews = activeTab === 'vendor' ? vendorReviews : productReviews;
    const currentRating = activeTab === 'vendor' ? vendorRating : productRating;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl">
                            <Star className="w-8 h-8 text-white fill-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Reviews</h1>
                            <p className="text-gray-600">Manage your restaurant and product reviews</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Vendor Rating</p>
                                    <p className="text-2xl font-black text-gray-900">
                                        {vendorRating > 0 ? vendorRating.toFixed(1) : '0.0'}
                                    </p>
                                </div>
                                <Store className="w-10 h-10 text-orange-500" />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                {renderStars(Math.round(vendorRating))}
                                <span className="text-xs text-gray-600">
                                    {vendorReviews.length} reviews
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Product Rating</p>
                                    <p className="text-2xl font-black text-gray-900">
                                        {productRating > 0 ? productRating.toFixed(1) : '0.0'}
                                    </p>
                                </div>
                                <Package className="w-10 h-10 text-blue-500" />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                {renderStars(Math.round(productRating))}
                                <span className="text-xs text-gray-600">
                                    {productReviews.length} reviews
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                                    <p className="text-2xl font-black text-gray-900">
                                        {vendorReviews.length + productReviews.length}
                                    </p>
                                </div>
                                <Award className="w-10 h-10 text-green-500" />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-green-600 font-semibold">
                                    Keep it up!
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('vendor')}
                                className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                                    activeTab === 'vendor'
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Store className="w-5 h-5" />
                                    <span>Vendor Reviews ({vendorReviews.length})</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                                    activeTab === 'products'
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Package className="w-5 h-5" />
                                    <span>Product Reviews ({productReviews.length})</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                                <p className="text-gray-600 mt-4">Loading reviews...</p>
                            </div>
                        ) : currentReviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                                <p className="text-gray-600 max-w-md">
                                    {activeTab === 'vendor'
                                        ? "Your restaurant hasn't received any reviews yet. Keep providing great service to earn your first review!"
                                        : "Your products haven't received any reviews yet. Deliver quality products to earn reviews!"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {currentReviews.map((review, index) => (
                                    <div
                                        key={review.id || review.publicReviewId || `review-${index}`}
                                        className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
                                    >
                                        {/* Review Header */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2.5 rounded-full shrink-0">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">
                                                        {review.customerName || 'Anonymous Customer'}
                                                    </p>
                                                    {activeTab === 'products' && review.productName && (
                                                        <p className="text-sm text-gray-600 truncate">
                                                            Product: {review.productName}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {renderStars(review.rating)}
                                                        <span className="text-sm font-semibold text-gray-700">
                                                            {review.rating?.toFixed(1) || '0.0'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Date */}
                                            <div className="flex items-center gap-1.5 text-gray-500 text-sm shrink-0">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDate(review.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Review Comment */}
                                        {review.comment && (
                                            <div className="bg-white p-4 rounded-lg border border-gray-100 mb-3">
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        )}

                                        {/* Verified Badge */}
                                        {review.verified && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                                    {activeTab === 'vendor' ? 'Verified Customer' : 'Verified Purchase'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewsPage;
