'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { X, Loader2, Clock, Star } from 'lucide-react';
import { useCart } from "@/contexts/CartContext";

const ProductDetailModal = ({ product, vendorName, isLoading, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const [cartError, setCartError] = useState(null);
    const [addedSuccess, setAddedSuccess] = useState(false);
    const { addToCart, clearCart } = useCart();

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

    const handleAddToCart = () => {
        const result = addToCart(product, quantity);
        if (!result.success) {
            setCartError(result.message);
            return;
        }
        setCartError(null);
        setAddedSuccess(true);
        setTimeout(() => {
            setAddedSuccess(false);
            onClose();
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                                sizes="(max-width: 768px) 100vw, 448px"
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-100 to-red-100">
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
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    )}

                    {/* Calories + Dietary Tags */}
                    {(calories > 0 || hasDietaryTags) && (
                        <div className="space-y-3">
                            {calories > 0 && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl w-fit">
                                    <span className="text-lg">🔥</span>
                                    <span className="text-sm font-bold text-gray-900">{calories}</span>
                                    <span className="text-sm text-gray-500">cal</span>
                                </div>
                            )}
                            {hasDietaryTags && (
                                <div className="flex flex-wrap gap-2">
                                    {isVegetarian && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                            🌱 Vegetarian
                                        </span>
                                    )}
                                    {isVegan && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                            🌿 Vegan
                                        </span>
                                    )}
                                    {isGlutenFree && (
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                            🌾 Gluten Free
                                        </span>
                                    )}
                                    {isSpicy && (
                                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                            🌶️ Spicy
                                        </span>
                                    )}
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
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-semibold text-gray-900">
                                {averageRating?.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                                ({reviewCount || 0} reviews)
                            </span>
                        </div>
                    )}

                    {/* Cart conflict error */}
                    {cartError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            {cartError}
                            <button
                                onClick={() => {
                                    clearCart();
                                    setCartError(null);
                                }}
                                className="ml-2 font-bold underline"
                            >
                                Clear cart
                            </button>
                        </div>
                    )}

                    {/* Quantity Selector + Add to Order */}
                    <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                            >
                                −
                            </button>
                            <span className="px-4 py-3 text-gray-900 font-bold text-base min-w-12 text-center">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!available}
                            className={`flex-1 py-3 rounded-xl font-bold text-base transition-all duration-200 ${
                                addedSuccess
                                    ? 'bg-green-600 text-white'
                                    : available
                                        ? 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg active:scale-95'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {addedSuccess
                                ? '✓ Added to Cart!'
                                : available
                                    ? `Add to Order • $${(price * quantity).toFixed(2)}`
                                    : 'Currently Unavailable'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;