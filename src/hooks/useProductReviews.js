import { useState, useEffect } from 'react';
import { ReviewsAPI } from '@/lib/api/reviews.api';
import { getVendorProducts } from '@/lib/api/vendorProducts';
import { toast } from '@/components/ui/toast';

/**
 * Custom hook for fetching product reviews and ratings
 * @param {Object} options - Configuration options
 * @param {string} options.productPublicId - Product public ID (for single product)
 * @param {boolean} options.allProducts - Whether to fetch reviews for all vendor products
 * @param {boolean} options.autoFetch - Whether to fetch automatically on mount
 * @returns {Object} - { reviews, rating, loading, error, refetch }
 */
export const useProductReviews = ({
    productPublicId = null,
    allProducts = false,
    autoFetch = true
} = {}) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSingleProductReviews = async (productId) => {
        const [reviewsResponse, ratingResponse] = await Promise.all([
            ReviewsAPI.getProductReviews(productId),
            ReviewsAPI.getProductAverageRating(productId)
        ]);

        return {
            reviews: reviewsResponse?.success ? reviewsResponse.data || [] : [],
            rating: ratingResponse?.success ? ratingResponse.data || 0 : 0
        };
    };

    const fetchAllProductsReviews = async () => {
        // Fetch all vendor products first
        const productsResponse = await getVendorProducts();

        if (!productsResponse?.success || !productsResponse.data || productsResponse.data.length === 0) {
            return { reviews: [], rating: 0 };
        }

        const products = productsResponse.data;

        // Fetch reviews and ratings for each product
        const reviewPromises = products.map(product =>
            ReviewsAPI.getProductReviews(product.publicProductId)
                .catch(() => ({ success: false, data: [] }))
        );

        const ratingPromises = products.map(product =>
            ReviewsAPI.getProductAverageRating(product.publicProductId)
                .catch(() => ({ success: false, data: 0 }))
        );

        const [reviewsResults, ratingsResults] = await Promise.all([
            Promise.all(reviewPromises),
            Promise.all(ratingPromises)
        ]);

        // Aggregate all reviews from all products
        const allReviews = [];
        reviewsResults.forEach((result, index) => {
            if (result?.success && result.data) {
                const productName = products[index].name;
                const reviewsWithProductName = result.data.map(review => ({
                    ...review,
                    productName
                }));
                allReviews.push(...reviewsWithProductName);
            }
        });

        // Calculate average rating across all products
        const validRatings = ratingsResults
            .map(result => result?.success ? result.data : 0)
            .filter(rating => rating > 0);

        const avgRating = validRatings.length > 0
            ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
            : 0;

        // Sort reviews by date (newest first)
        allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return { reviews: allReviews, rating: avgRating };
    };

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);

            let result;

            if (allProducts) {
                result = await fetchAllProductsReviews();
            } else if (productPublicId) {
                result = await fetchSingleProductReviews(productPublicId);
            } else {
                throw new Error('Either productPublicId or allProducts must be specified');
            }

            setReviews(result.reviews);
            setRating(result.rating);
        } catch (err) {
            const errorMessage = err.message || 'Failed to load product reviews';
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
        if (autoFetch && (productPublicId || allProducts)) {
            fetchReviews();
        }
    }, [productPublicId, allProducts, autoFetch]);

    return {
        reviews,
        rating,
        loading,
        error,
        refetch: fetchReviews
    };
};
