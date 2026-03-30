'use client';
import React from 'react';
import Image from 'next/image';
import { Star, ChevronRight } from 'lucide-react';

const getPromoBadge = (promotions) => {
    if (!promotions?.length) return null;
    const active = promotions.filter(p => p.isActive !== false);
    if (!active.length) return null;
    const free = active.find(p => p.type === 'FREE_DELIVERY');
    if (free) return { label: '🚚 Free Delivery', bg: 'bg-blue-500' };
    const pct = active.filter(p => p.type === 'PERCENTAGE').sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
    if (pct) return { label: `🏷️ ${pct.value}% OFF`, bg: 'bg-green-500' };
    const fixed = active.filter(p => p.type === 'FIXED_AMOUNT').sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
    if (fixed) return { label: `🏷️ $${fixed.value} OFF`, bg: 'bg-orange-500' };
    return null;
};

const ProductCard = ({ product, onViewReviews, onCardClick, promotions = [] }) => {
    return (
        <div
            onClick={onCardClick}
            className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        >
            <div className="relative w-full h-48 bg-gray-200">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-100 to-red-100">
                        <span className="text-6xl">🍲</span>
                    </div>
                )}
                {/* Promo Badge — top-left */}
                {(() => {
                    const promo = getPromoBadge(promotions);
                    return promo ? (
                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-md ${promo.bg}`}>
                            {promo.label}
                        </div>
                    ) : null;
                })()}

                {!product.available && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        Unavailable
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {product.description}
                    </p>
                    {product.categoryName && (
                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                            {product.categoryName}
                        </span>
                    )}

                    {/* Dietary badges */}
                    {(product.isVegan || product.isVegetarian || product.isGlutenFree || product.isSpicy) && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {product.isVegan && (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    🌱 Vegan
                                </span>
                            )}
                            {product.isVegetarian && !product.isVegan && (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    🥬 Vegetarian
                                </span>
                            )}
                            {product.isGlutenFree && (
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    🌾 Gluten-Free
                                </span>
                            )}
                            {product.isSpicy && (
                                <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                    🌶️ Spicy
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewReviews();
                    }}
                    className="flex items-center space-x-1 mb-3 hover:bg-gray-50 px-2 py-1 rounded transition-colors -ml-2"
                >
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-gray-900">
                        {product.averageRating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-xs text-gray-500">
                        ({product.reviewCount || 0})
                    </span>
                </button>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-2xl font-black text-orange-600">
                        ${product.price?.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-orange-500 transition-colors">
                        View Product detail
                        <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;