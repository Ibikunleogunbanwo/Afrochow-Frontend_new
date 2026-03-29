'use client';
import React, { useState } from 'react';
import { Star, MessageSquare, Filter, X } from 'lucide-react';

const ReviewCard = ({ review, onMarkHelpful }) => {
    const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount ?? 0);
    const [marked, setMarked] = useState(false);

    const handleMarkHelpful = () => {
        if (marked) return;
        setMarked(true);
        setHelpfulCount((n) => n + 1);
        if (onMarkHelpful) onMarkHelpful(review.reviewId);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="font-bold text-gray-900">{review.userName}</h4>
                    <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
                <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${
                                i < review.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-300'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {review.comment && (
                <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
            )}

            <div className="flex items-center space-x-3 mt-2">
                <button
                    onClick={handleMarkHelpful}
                    disabled={marked}
                    className={`flex items-center space-x-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                        marked
                            ? 'border-orange-200 bg-orange-50 text-orange-600 cursor-default'
                            : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                >
                    <span>👍</span>
                    <span>Helpful ({helpfulCount})</span>
                </button>
            </div>
        </div>
    );
};

const ReviewsModal = ({
                          isOpen,
                          onClose,
                          reviews,
                          reviewType,
                          vendorName,
                          productName,
                          ratingFilter,
                          onRatingFilterChange,
                          canWriteReview,       // true → show active button; false + reviewBlockedReason → show tooltip
                          reviewBlockedReason,  // string shown when the user cannot review yet
                          onWriteReview,
                          onMarkHelpful,
                      }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl">
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">
                                {reviewType === 'vendor' ? vendorName : productName} Reviews
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {canWriteReview ? (
                                <button
                                    onClick={onWriteReview}
                                    className="px-4 py-2 text-sm font-semibold text-orange-600 border border-orange-500 rounded-xl hover:bg-orange-50 transition-colors"
                                >
                                    Write a Review
                                </button>
                            ) : reviewBlockedReason ? (
                                <span
                                    title={reviewBlockedReason}
                                    className="px-4 py-2 text-sm text-gray-400 border border-gray-200 rounded-xl cursor-default select-none"
                                >
                                    🔒 Order to unlock reviews
                                </span>
                            ) : null}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {reviewType === 'vendor' && (
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <Filter className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-700">Minimum Rating:</span>
                                <select
                                    value={ratingFilter}
                                    onChange={(e) => onRatingFilterChange(Number(e.target.value))}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value={0}>All Ratings</option>
                                    <option value={4}>4+ Stars</option>
                                    <option value={3}>3+ Stars</option>
                                    <option value={2}>2+ Stars</option>
                                    <option value={1}>1+ Stars</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-6">
                        {reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <ReviewCard
                                        key={review.reviewId}
                                        review={review}
                                        onMarkHelpful={onMarkHelpful}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No reviews yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewsModal;