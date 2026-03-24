import { useState, useEffect } from 'react';
import { VendorReviewsAPI } from '@/lib/api/vendor/reviews.api';
import { ReviewsAPI } from '@/lib/api/reviews.api';
import { toast } from '@/components/ui/toast';

/**
 * Custom hook for fetching product reviews and ratings.
 *
 * When `allProducts: true` (vendor dashboard) it reuses the authenticated
 * GET /vendor/reviews endpoint and filters to reviews that have a
 * productPublicId set — avoiding an expensive per-product public API loop.
 *
 * When `productPublicId` is supplied it fetches a single product's public reviews.
 */
export const useProductReviews = ({
    productPublicId = null,
    allProducts = false,
    autoFetch = true,
} = {}) => {
    const [reviews, setReviews] = useState([]);
    const [rating,  setRating]  = useState(0);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);

            if (allProducts) {
                // ── Vendor dashboard: use authenticated endpoint, filter to product reviews ──
                const reviewsResponse = await VendorReviewsAPI.getMyVendorReviews();

                if (reviewsResponse?.success) {
                    // Keep only reviews that are linked to a product
                    const productOnly = (reviewsResponse.data || []).filter(r => r.productPublicId);

                    // Sort newest first
                    productOnly.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    // Average rating across product reviews
                    const avg = productOnly.length > 0
                        ? productOnly.reduce((sum, r) => sum + (r.rating || 0), 0) / productOnly.length
                        : 0;

                    setReviews(productOnly);
                    setRating(Math.round(avg * 10) / 10);
                }

            } else if (productPublicId) {
                // ── Single product (public page) ──
                const [reviewsResponse, ratingResponse] = await Promise.all([
                    ReviewsAPI.getProductReviews(productPublicId),
                    ReviewsAPI.getProductAverageRating(productPublicId),
                ]);

                if (reviewsResponse?.success) setReviews(reviewsResponse.data || []);
                if (ratingResponse?.success)  setRating(ratingResponse.data  || 0);

            } else {
                throw new Error('Either productPublicId or allProducts must be specified');
            }

        } catch (err) {
            const errorMessage = err.message || 'Failed to load product reviews';
            setError(errorMessage);

            const isAuthError = errorMessage.toLowerCase().includes('unauthorized') ||
                                errorMessage.toLowerCase().includes('authentication') ||
                                errorMessage.toLowerCase().includes('session');
            if (!isAuthError) toast.error('Error', errorMessage);

            setReviews([]);
            setRating(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch && (productPublicId || allProducts)) {
            fetchReviews();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productPublicId, allProducts, autoFetch]);

    return { reviews, rating, loading, error, refetch: fetchReviews };
};
