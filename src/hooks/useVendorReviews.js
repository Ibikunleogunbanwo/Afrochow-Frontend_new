import { useState, useEffect } from 'react';
import { VendorReviewsAPI } from '@/lib/api/vendor/reviews.api';
import { VendorProfileAPI } from '@/lib/api/vendor/profile.api';
import { ReviewsAPI } from '@/lib/api/reviews.api';
import { toast } from '@/components/ui/toast';

/**
 * Custom hook for fetching vendor reviews and ratings
 * @param {Object} options - Configuration options
 * @param {boolean} options.authenticated - Whether to use authenticated endpoint (my reviews)
 * @param {string} options.vendorPublicId - Vendor public ID (for public endpoint)
 * @param {boolean} options.autoFetch - Whether to fetch automatically on mount
 * @returns {Object} - { reviews, rating, loading, error, refetch }
 */
export const useVendorReviews = ({
    authenticated = false,
    vendorPublicId = null,
    autoFetch = true
} = {}) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);

            if (authenticated) {
                try {
                    // Try authenticated endpoints first
                    const [reviewsResponse, statsResponse] = await Promise.all([
                        VendorReviewsAPI.getMyVendorReviews(),
                        VendorReviewsAPI.getMyVendorReviewStats()
                    ]);

                    if (reviewsResponse?.success) {
                        // Only keep vendor-level reviews (no product attached)
                        const vendorOnly = (reviewsResponse.data || []).filter(r => !r.productPublicId);
                        setReviews(vendorOnly);
                    }

                    if (statsResponse?.success && statsResponse.data) {
                        setRating(statsResponse.data.averageRating || 0);
                    }
                } catch (authError) {
                    // If authenticated endpoints fail, fall back to public endpoints
                    const profileResponse = await VendorProfileAPI.getVendorProfile();
                    const publicId = profileResponse?.data?.publicUserId || profileResponse?.data?.publicVendorId;

                    if (publicId) {
                        const [reviewsResponse, ratingResponse] = await Promise.all([
                            ReviewsAPI.getVendorsReviews(publicId),
                            ReviewsAPI.getVendorAverageRating(publicId)
                        ]);

                        if (reviewsResponse?.success) {
                            // Public endpoint only returns vendor reviews, but filter just in case
                            const vendorOnly = (reviewsResponse.data || []).filter(r => !r.productPublicId);
                            setReviews(vendorOnly);
                        }

                        if (ratingResponse?.success) {
                            setRating(ratingResponse.data || 0);
                        }
                    }
                }
            } else {
                // Use public endpoints
                if (!vendorPublicId) {
                    throw new Error('Vendor ID is required for public endpoint');
                }

                const [reviewsResponse, ratingResponse] = await Promise.all([
                    ReviewsAPI.getVendorsReviews(vendorPublicId),
                    ReviewsAPI.getVendorAverageRating(vendorPublicId)
                ]);

                if (reviewsResponse?.success) {
                    setReviews(reviewsResponse.data || []);
                }

                if (ratingResponse?.success) {
                    setRating(ratingResponse.data || 0);
                }
            }
        } catch (err) {
            const errorMessage = err.message || 'Failed to load vendor reviews';
            setError(errorMessage);

            // Don't show toast for authentication errors (handled by VendorDashboardLayout)
            const isAuthError = errorMessage.toLowerCase().includes('unauthorized') ||
                               errorMessage.toLowerCase().includes('authentication') ||
                               errorMessage.toLowerCase().includes('session');

            if (!isAuthError) {
                toast.error('Error', errorMessage);
            }

            setReviews([]);
            setRating(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch) {
            if (authenticated || vendorPublicId) {
                fetchReviews();
            }
        }
    }, [authenticated, vendorPublicId, autoFetch]);

    return {
        reviews,
        rating,
        loading,
        error,
        refetch: fetchReviews
    };
};
