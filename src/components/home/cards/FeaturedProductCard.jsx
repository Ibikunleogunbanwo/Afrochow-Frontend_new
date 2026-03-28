"use client";

import Image from "next/image";
import { Star, Flame, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { memo, useState } from "react";
import { resolveImageUrl } from "@/lib/utils/imageUrl";

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

const FeaturedProductCard = ({ product, priority = false, isAuthenticated, onUnauthenticated, promotions = [] }) => {
    const {
        vendorPublicId,
        name,
        restaurantName,
        imageUrl,
        price,
        averageRating,
        reviewCount,
        totalOrders,
        categoryName,
        preparationTimeMinutes,
        isVegan,
        isVegetarian,
        isGlutenFree,
        isSpicy,
    } = product;

    const router = useRouter();
    const [imgError, setImgError] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            onUnauthenticated();
        } else {
            router.push(`/restaurant/${vendorPublicId}`);
        }
    };

    return (
        <div onClick={handleClick} className="group block h-full cursor-pointer">
            <div className="h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

                {/* Image */}
                <div className="relative h-48 bg-linear-to-br from-gray-100 to-gray-200">
                    {resolveImageUrl(product.imageUrl) && !imgError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={resolveImageUrl(product.imageUrl)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <Flame className="w-10 h-10 text-gray-300" />
                        </div>
                    )}

                    {/* Category pill */}
                    {categoryName && (
                        <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 text-[11px] font-bold bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-sm">
                                {categoryName}
                            </span>
                        </div>
                    )}

                    {/* Order count badge */}
                    {totalOrders > 0 && (
                        <div className="absolute top-3 right-3">
                            <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-orange-500 text-white rounded-full shadow-sm">
                                <Flame className="w-3 h-3" />
                                {totalOrders >= 1000
                                    ? `${(totalOrders / 1000).toFixed(1)}k`
                                    : totalOrders} orders
                            </span>
                        </div>
                    )}

                    {/* Promo Badge */}
                    {(() => {
                        const promo = getPromoBadge(promotions);
                        return promo ? (
                            <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white backdrop-blur-sm shadow-sm ${promo.bg}`}>
                                {promo.label}
                            </div>
                        ) : null;
                    })()}
                </div>

                {/* Content */}
                <div className="p-4">

                    {/* Product name */}
                    <h3 className="text-sm font-bold text-gray-900 truncate mb-0.5">
                        {name}
                    </h3>

                    {/* Restaurant name */}
                    {restaurantName && (
                        <p className="text-xs text-gray-400 truncate mb-2">
                            {restaurantName}
                        </p>
                    )}

                    {/* Dietary badges */}
                    {(isVegan || isVegetarian || isGlutenFree || isSpicy) && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {isVegan && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">
                                    🌱 Vegan
                                </span>
                            )}
                            {isVegetarian && !isVegan && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">
                                    🥬 Vegetarian
                                </span>
                            )}
                            {isGlutenFree && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full">
                                    🌾 Gluten-Free
                                </span>
                            )}
                            {isSpicy && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded-full">
                                    🌶️ Spicy
                                </span>
                            )}
                        </div>
                    )}

                    {/* Rating + prep time + price */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">

                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                                <span className="text-xs font-bold text-gray-800">
                                    {averageRating > 0 ? averageRating.toFixed(1) : "0"}
                                </span>
                                {reviewCount > 0 && (
                                    <span className="text-xs text-gray-400">
                                        ({reviewCount >= 1000
                                        ? `${(reviewCount / 1000).toFixed(1)}k`
                                        : reviewCount})
                                    </span>
                                )}
                            </div>

                            {/* Prep time */}
                            {preparationTimeMinutes > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {preparationTimeMinutes} min
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        {price != null && (
                            <span className="text-sm font-bold text-gray-900">
                                ${Number(price).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(FeaturedProductCard);