'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { X, Loader2, Clock, Star } from 'lucide-react';

const ProductDetailModal = ({ product, vendorName, isLoading, onClose }) => {
    const [quantity, setQuantity] = useState(1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                <div className="p-6 pb-0">
                    <h2 className="text-2xl font-black text-gray-900 pr-8">{product.name}</h2>
                    {vendorName && (
                        <p className="text-sm text-gray-500 mt-1">{vendorName}</p>
                    )}
                </div>

                <div className="relative w-full h-64 mt-4 px-6">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                        {isLoading ? (
                            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                            </div>
                        ) : product.imageUrl ? (
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
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

                <div className="p-6 space-y-4">

                    {product.description && (
                        <div>
                            <h3 className="text-base font-bold text-gray-900 mb-1">Description</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {product.isVegetarian && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                🌱 Vegetarian
                            </span>
                        )}
                        {product.isVegan && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                🌿 Vegan
                            </span>
                        )}
                        {product.isGlutenFree && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                🌾 Gluten Free
                            </span>
                        )}
                        {product.isSpicy && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                🌶️ Spicy
                            </span>
                        )}
                    </div>

                    {product.preparationTimeMinutes && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{product.preparationTimeMinutes} min prep time</span>
                        </div>
                    )}

                    {product.averageRating > 0 && (
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-semibold text-gray-900">
                                {product.averageRating?.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                                ({product.reviewCount || 0} reviews)
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                            >
                                −
                            </button>
                            <span className="px-4 py-3 text-gray-900 font-bold text-base min-w-[48px] text-center">
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
                            disabled={!product.available}
                            className={`flex-1 py-3 rounded-xl font-bold text-base transition-all duration-200 ${
                                product.available
                                    ? 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg active:scale-95'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {product.available
                                ? `Add to Order • $${(product.price * quantity).toFixed(2)}`
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