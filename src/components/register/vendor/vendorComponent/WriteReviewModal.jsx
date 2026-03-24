'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Star, X } from 'lucide-react';
import { ReviewsAPI } from '@/lib/api/reviews.api';

const WriteReviewModal = ({
    isOpen,
    onClose,
    vendorPublicId,
    vendorName,
    product,
    onSuccess,
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Reset form state each time the modal opens
    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setHoverRating(0);
            setComment('');
            setSubmitting(false);
            setSuccess(false);
            setError(null);
        }
    }, [isOpen]);

    // ESC key handler
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Prevent background scroll while open
    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [isOpen]);

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                vendorPublicId,
                rating,
                comment,
            };
            if (product?.publicProductId) {
                payload.productPublicId = product.publicProductId;
            }

            const response = await ReviewsAPI.createReview(payload);

            setSuccess(true);

            // Brief success state, then close
            setTimeout(() => {
                if (onSuccess) onSuccess(response?.data ?? response);
                onClose();
            }, 1200);
        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err?.message || 'Something went wrong. Please try again.');
            setSubmitting(false);
        }
    }, [rating, comment, vendorPublicId, product, onSuccess, onClose]);

    if (!isOpen) return null;

    const isProductReview = Boolean(product);
    const subjectLabel = isProductReview
        ? `"${product.name}"`
        : vendorName || 'this store';

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="write-review-title"
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
                    <div>
                        <h2
                            id="write-review-title"
                            className="text-xl font-black text-gray-900"
                        >
                            Write a Review
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {isProductReview ? 'Product: ' : 'Store: '}
                            <span className="font-semibold text-gray-700">{subjectLabel}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0 ml-3"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Star Selector */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Rating <span className="text-orange-500">*</span>
                        </label>
                        <div
                            className="flex items-center gap-1"
                            role="radiogroup"
                            aria-label="Rating"
                        >
                            {[1, 2, 3, 4, 5].map((star) => {
                                const filled = star <= (hoverRating || rating);
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        role="radio"
                                        aria-checked={rating === star}
                                        aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${
                                                filled
                                                    ? 'text-amber-400 fill-amber-400'
                                                    : 'text-gray-300 fill-gray-100'
                                            }`}
                                        />
                                    </button>
                                );
                            })}
                            {rating > 0 && (
                                <span className="ml-2 text-sm text-gray-500">
                                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label
                            htmlFor="review-comment"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Comment
                            <span className="text-gray-400 font-normal ml-1">(min 10 characters suggested)</span>
                        </label>
                        <textarea
                            id="review-comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={`Share your experience with ${subjectLabel}…`}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || success}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                            success
                                ? 'bg-green-600 text-white'
                                : submitting
                                    ? 'bg-orange-400 text-white cursor-not-allowed'
                                    : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95'
                        }`}
                    >
                        {success
                            ? '✓ Review submitted!'
                            : submitting
                                ? 'Submitting…'
                                : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WriteReviewModal;
