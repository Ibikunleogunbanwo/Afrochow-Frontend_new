'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Loader2, Clock, Star, Pencil, Heart, MapPin, ArrowRight } from 'lucide-react';
import { useCart } from "@/contexts/CartContext";
import { useFavorite } from '@/hooks/useFavorite';
import { useLocation } from '@/contexts/LocationContext';
import { SearchAPI } from '@/lib/api/search.api';
import { formatDistance } from '@/lib/utils/distance';
import { customerWaitlistPath, isOrderingEnabled } from '@/lib/mvp';
import { isGroceryOrProduceCategory } from '@/lib/utils/productCategory';

const Tag = ({ text }) => (
    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
        {text}
    </span>
);

const ProductDetailModal = ({
                                product,
                                vendorName,
                                storeCategory,
                                isLoading,
                                isStoreOpen,
                                onClose,
                                onViewReviews,
                                onWriteReview,
                                onUnauthenticated,
                            }) => {
    const [quantity, setQuantity] = useState(1);
    const [cartError, setCartError] = useState(null);
    const [addedSuccess, setAddedSuccess] = useState(false);
    const timerRef = useRef(null);

    const { addToCart, clearCart } = useCart();
    const { coordinates } = useLocation();

    // "Also available at" — same dish, other vendors
    const [similarProductId, setSimilarProductId] = useState(product?.publicProductId);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [similarLoading, setSimilarLoading]   = useState(true);

    // Reset the rail when the modal opens for a different product (or closes).
    // Per React docs, adjusting state during render when a prop changes avoids
    // a synchronous setState cascade inside an effect.
    if (similarProductId !== product?.publicProductId) {
        setSimilarProductId(product?.publicProductId);
        setSimilarProducts([]);
        setSimilarLoading(Boolean(product?.publicProductId));
    }

    useEffect(() => {
        if (!product?.publicProductId) return;
        let cancelled = false;
        SearchAPI.getSimilarProducts(product.publicProductId, coordinates?.lat, coordinates?.lng)
            .then((res) => {
                if (cancelled) return;
                const list = res?.success && Array.isArray(res.data) ? res.data : [];
                setSimilarProducts(list);
            })
            .catch(() => { if (!cancelled) setSimilarProducts([]); })
            .finally(() => { if (!cancelled) setSimilarLoading(false); });
        return () => { cancelled = true; };
    }, [product?.publicProductId, coordinates?.lat, coordinates?.lng]);

    // Must stay above the `if (!product) return null;` guard below
    // (Rules of Hooks) — the hook itself already tolerates an undefined id.
    const { isFavorited, toggleFavorite } = useFavorite('PRODUCT', product?.publicProductId, {
        name: product?.name,
        onRequireAuth: onUnauthenticated,
    });

    // Handle ESC close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Prevent background scroll, restore previous value on cleanup
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    // Clear success timer on unmount
    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    if (!product) return null;

    const {
        name,
        description,
        imageUrl,
        price,
        available,
        calories,
        isVegetarian,
        isVegan,
        isGlutenFree,
        isSpicy,
        preparationTimeMinutes,
        averageRating,
        reviewCount,
    } = product;

    const hasDietaryTags = isVegetarian || isVegan || isGlutenFree || isSpicy;
    // Groceries/farm produce are pre-packaged/raw goods, not cooked-to-order —
    // "min prep time" doesn't make sense on a bag of poundo yam.
    const isGroceryOrProduce = isGroceryOrProduceCategory(storeCategory);
    const totalPrice = (price * quantity).toFixed(2);
    const isDisabled = !available || !isStoreOpen;

    const handleAddToCart = () => {
        if (!isOrderingEnabled) {
            window.location.href = customerWaitlistPath;
            return;
        }
        if (isDisabled) return;

        const result = addToCart(product, quantity, isStoreOpen);

        if (!result.success) {
            setCartError(result.message || 'Unable to add item');
            return;
        }

        setCartError(null);
        setAddedSuccess(true);

        timerRef.current = setTimeout(() => {
            setAddedSuccess(false);
            onClose();
        }, 1200);
    };

    const getButtonText = () => {
        if (addedSuccess) return '✓ Added to Cart!';
        if (!isOrderingEnabled) return 'Join Waitlist';
        if (!available) return 'Currently Unavailable';
        if (!isStoreOpen) return '🕐 Store is currently closed';
        return `Add to Order • CA$${totalPrice}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Header */}
                <div className="p-6 pb-0">
                    <h2 className="text-2xl font-black text-gray-900 pr-8">{name}</h2>
                    {vendorName && (
                        <p className="text-sm text-gray-500 mt-1">{vendorName}</p>
                    )}
                </div>

                {/* Image */}
                <div className="relative w-full h-64 mt-4 px-6">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                        {isLoading ? (
                            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                            </div>
                        ) : imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={name}
                                fill
                                priority
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-amber-100">
                                <span className="text-6xl">🍲</span>
                            </div>
                        )}

                        {/* Favorite Button */}
                        {!isLoading && (
                            <button
                                onClick={toggleFavorite}
                                className="absolute z-10 p-2 top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                <Heart
                                    className={`w-4 h-4 transition-colors ${
                                        isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                    }`}
                                />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">

                    {/* Description */}
                    {description && (
                        <div>
                            <h3 className="text-base font-bold text-gray-900 mb-1">Description</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                        </div>
                    )}

                    {/* Calories & Dietary Tags */}
                    {(calories > 0 || hasDietaryTags) && (
                        <div className="space-y-3">
                            {calories > 0 && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl w-fit">
                                    <span>🔥</span>
                                    <span className="font-bold">{calories}</span>
                                    <span className="text-gray-500 text-sm">cal</span>
                                </div>
                            )}

                            {hasDietaryTags && (
                                <div className="flex flex-wrap gap-2">
                                    {isVegetarian && <Tag text="🌱 Vegetarian" />}
                                    {isVegan && <Tag text="🌿 Vegan" />}
                                    {isGlutenFree && <Tag text="🌾 Gluten Free" />}
                                    {isSpicy && <Tag text="🌶️ Spicy" />}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Prep Time */}
                    {preparationTimeMinutes > 0 && !isGroceryOrProduce && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{preparationTimeMinutes} min prep time</span>
                        </div>
                    )}

                    {/* Rating */}
                    {averageRating > 0 && (
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={onViewReviews}
                                className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                            >
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="font-semibold">{averageRating.toFixed(1)}</span>
                                <span className="text-xs text-gray-500 underline">({reviewCount || 0} reviews)</span>
                            </button>
                            {onWriteReview && (
                                <button
                                    onClick={onWriteReview}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Write a Review
                                </button>
                            )}
                        </div>
                    )}

                    {/* Also available at — same dish, other vendors */}
                    {(similarLoading || similarProducts.length > 0) && (
                        <div>
                            <h3 className="text-base font-bold text-gray-900 mb-2">Also available at</h3>
                            {similarLoading ? (
                                <div className="space-y-2">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {similarProducts.map((item) => (
                                        <Link
                                            key={item.publicProductId}
                                            href={`/restaurant/${item.vendorPublicId}`}
                                            onClick={onClose}
                                            className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors group"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {item.restaurantName}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                    <span>CA${Number(item.price).toFixed(2)}</span>
                                                    {formatDistance(item.distanceKm) && (
                                                        <span className="flex items-center gap-0.5">
                                                            <MapPin className="w-3 h-3" />
                                                            {formatDistance(item.distanceKm)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cart Error */}
                    {cartError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            ⚠️ {cartError}
                            <button
                                onClick={() => {
                                    clearCart();
                                    setCartError(null);
                                }}
                                className="ml-2 underline font-bold"
                            >
                                Clear cart
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">

                        {/* Quantity */}
                        <div className="flex items-center justify-center sm:justify-start border-2 border-gray-200 rounded-xl overflow-hidden w-full sm:w-auto">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="px-4 py-3 hover:bg-gray-100 font-bold"
                            >
                                −
                            </button>
                            <span className="px-4 font-bold">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="px-4 py-3 hover:bg-gray-100 font-bold"
                            >
                                +
                            </button>
                        </div>

                        {/* Add to Cart */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isDisabled}
                            className={`flex-1 py-3 rounded-xl font-bold transition ${
                                addedSuccess
                                    ? 'bg-green-600 text-white'
                                    : isDisabled
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                            }`}
                        >
                            {getButtonText()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
