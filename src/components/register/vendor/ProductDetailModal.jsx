'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Loader2, Clock, Star } from 'lucide-react';
import { useCart } from "@/contexts/CartContext";

const Tag = ({ text }) => (
    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
        {text}
    </span>
);

const ProductDetailModal = ({
                                product,
                                vendorName,
                                isLoading,
                                isStoreOpen,
                                onClose,
                                onViewReviews,
                            }) => {
    const [quantity, setQuantity] = useState(1);
    const [cartError, setCartError] = useState(null);
    const [addedSuccess, setAddedSuccess] = useState(false);
    const timerRef = useRef(null);

    const { addToCart, clearCart } = useCart();

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
    const totalPrice = (price * quantity).toFixed(2);
    const isDisabled = !available || !isStoreOpen;

    const handleAddToCart = () => {
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
        if (!available) return 'Currently Unavailable';
        if (!isStoreOpen) return '🕐 Store is currently closed';
        return `Add to Order • $${totalPrice}`;
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
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                                <span className="text-6xl">🍲</span>
                            </div>
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
                    {preparationTimeMinutes > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{preparationTimeMinutes} min prep time</span>
                        </div>
                    )}

                    {/* Rating */}
                    {averageRating > 0 && (
                        <button
                            onClick={onViewReviews}
                            className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                        >
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="font-semibold">{averageRating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500 underline">({reviewCount || 0} reviews)</span>
                        </button>
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
                                        : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95'
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