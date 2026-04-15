import React, { useEffect } from 'react';
import { X, Star, User, Calendar, MessageSquare, Store } from 'lucide-react';
import { useVendorReviews } from '@/hooks/useVendorReviews';

const VendorReviewsModal = ({ isOpen, onClose, vendorPublicId, restaurantName }) => {
    const {
        reviews,
        rating: averageRating,
        loading,
        refetch
    } = useVendorReviews({
        authenticated: false,
        vendorPublicId,
        autoFetch: false
    });

    useEffect(() => {
        if (isOpen && vendorPublicId) {
            refetch();
        }
    }, [isOpen, vendorPublicId, refetch]);

    if (!isOpen) return null;

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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-linear-to-r from-orange-500 to-amber-500 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between shrink-0">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="bg-white/20 p-2 rounded-lg shrink-0">
                                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                                {restaurantName || 'Store'} Reviews
                            </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-0 sm:ml-11">
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                                <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                                <span className="text-white font-bold text-sm">
                                    {averageRating > 0 ? averageRating.toFixed(1) : '0.0'} / 5.0
                                </span>
                            </div>
                            <span className="text-white/90 text-sm">
                                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>
                </div>

                {/* Reviews List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                            <p className="text-gray-600 mt-4">Loading reviews...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                            <p className="text-sm sm:text-base text-gray-600 max-w-md">
                                Your store hasn&#39;t received any reviews yet. Keep providing great service to earn your first review!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review, index) => (
                                <div
                                    key={review.id || review.publicReviewId || `review-${index}`}
                                    className="bg-linear-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-all"
                                >
                                    {/* Review Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-linear-to-br from-orange-500 to-amber-500 p-2 sm:p-2.5 rounded-full shrink-0">
                                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                                                    {review.customerName || 'Anonymous Customer'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {renderStars(review.rating)}
                                                    <span className="text-xs sm:text-sm font-semibold text-gray-700">
                                                        {review.rating?.toFixed(1) || '0.0'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm shrink-0">
                                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            <span>{formatDate(review.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Review Comment */}
                                    {review.comment && (
                                        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-100">
                                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap wrap-break-word">
                                                {review.comment}
                                            </p>
                                        </div>
                                    )}

                                    {/* Verified Badge */}
                                    {review.verified && (
                                        <div className="mt-3 flex items-center gap-1.5">
                                            <div className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                                Verified Customer
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 sm:py-3 bg-linear-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all shadow-md hover:shadow-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorReviewsModal;
