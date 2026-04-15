"use client";

import React from "react";
import Image from "next/image";
import { Star, Flame, Clock, MapPin, Store, Truck, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { resolveImageUrl } from "@/lib/utils/imageUrl";

// ── Promo badge helper ────────────────────────────────────────────────────────

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

// ── Card ──────────────────────────────────────────────────────────────────────

const PopularStoreCard = ({ product, priority = false, isAuthenticated, onUnauthenticated, promotions = [] }) => {
    const router = useRouter();

    const handleClick = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            sessionStorage.setItem('returnTo', `/restaurant/${product.vendorPublicId}`);
            onUnauthenticated();
        } else {
            router.push(`/restaurant/${product.vendorPublicId}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e);
        }
    };

    const promoBadge = getPromoBadge(promotions);

    const deliveryFeeLabel = product.deliveryFee === 0 || product.deliveryFee === '0'
        ? 'Free delivery'
        : product.deliveryFee != null
            ? `CA$${product.deliveryFee} delivery`
            : null;

    return (
        <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className="group block h-full cursor-pointer"
            role="button"
            tabIndex={0}
        >
            <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

                {/* ── Image ── */}
                <div className="relative w-full h-52 overflow-hidden bg-gray-100">
                    {resolveImageUrl(product.imageUrl) ? (
                        <Image
                            src={resolveImageUrl(product.imageUrl)}
                            alt={product.restaurantName || product.name}
                            fill
                            priority={priority}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            quality={75}
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                            <Flame className="w-12 h-12 text-orange-200" />
                        </div>
                    )}

                    {/* Subtle gradient for badge legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Top-left: store category */}
                    {product.storeCategory && (
                        <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 text-[11px] font-bold bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-sm">
                                {product.storeCategory}
                            </span>
                        </div>
                    )}

                    {/* Top-right: orders badge OR promo */}
                    {product.totalOrders > 0 ? (
                        <div className="absolute top-3 right-3">
                            <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-orange-500 text-white rounded-full shadow-sm">
                                <Flame className="w-3 h-3" />
                                {product.totalOrders >= 1000
                                    ? `${(product.totalOrders / 1000).toFixed(1)}k`
                                    : product.totalOrders} orders
                            </span>
                        </div>
                    ) : promoBadge ? (
                        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-sm ${promoBadge.bg}`}>
                            {promoBadge.label}
                        </div>
                    ) : null}

                    {/* Bottom-left: open/closed status */}
                    {product.isOpenNow !== null && product.isOpenNow !== undefined && (
                        <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-sm shadow-sm ${
                            product.isOpenNow ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
                        }`}>
                            {product.isOpenNow ? "🟢 Open Now" : "🔴 Closed"}
                        </div>
                    )}

                    {/* Bottom-right: promo (when orders badge occupies top-right) */}
                    {product.totalOrders > 0 && promoBadge && (
                        <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white backdrop-blur-sm shadow-sm ${promoBadge.bg}`}>
                            {promoBadge.label}
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="p-4 flex flex-col flex-1">

                    {/* Restaurant name */}
                    <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-1 mb-1">
                        {product.restaurantName || product.name}
                    </h3>

                    {/* Location — always reserve one line of space */}
                    <p className="flex items-center gap-1 text-xs text-gray-400 truncate mb-2 min-h-[1rem]">
                        {product.location && (
                            <>
                                <MapPin className="w-3 h-3 shrink-0 text-gray-300" />
                                {product.location}
                            </>
                        )}
                    </p>

                    {/* Today's hours — always reserve one line of space */}
                    <p className="flex items-center gap-1 text-xs text-gray-400 truncate mb-3 min-h-[1rem]">
                        {product.todayHoursFormatted && (
                            <>
                                <Clock className="w-3 h-3 shrink-0 text-gray-300" />
                                {product.todayHoursFormatted}
                            </>
                        )}
                    </p>

                    {/* Delivery fee pill — always reserve height */}
                    <div className="mb-3 min-h-[1.75rem]">
                        {deliveryFeeLabel && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                                product.deliveryFee === 0 || product.deliveryFee === '0'
                                    ? 'bg-green-50 text-green-700 border-green-100'
                                    : 'bg-gray-50 text-gray-500 border-gray-100'
                            }`}>
                                <Truck className="w-3 h-3 shrink-0" />
                                {deliveryFeeLabel}
                            </span>
                        )}
                    </div>

                    {/* ── Stats row — pinned to bottom ── */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">

                        {/* Rating */}
                        <div className="flex flex-col items-center gap-0.5 flex-1">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                                <span className="text-sm font-bold text-gray-800">
                                    {product.averageRating > 0 ? product.averageRating.toFixed(1) : "0"}
                                </span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                                {product.reviewCount > 0
                                    ? `${product.reviewCount >= 1000 ? `${(product.reviewCount / 1000).toFixed(1)}k` : product.reviewCount} reviews`
                                    : "0 reviews"}
                            </span>
                        </div>

                        <div className="w-px h-8 bg-gray-100" />

                        {/* Prep time */}
                        <div className="flex flex-col items-center gap-0.5 flex-1">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-bold text-gray-800">
                                    {product.preparationTimeMinutes > 0 ? `${product.preparationTimeMinutes}` : "0"}
                                </span>
                            </div>
                            <span className="text-[10px] text-gray-400">min prep</span>
                        </div>

                        <div className="w-px h-8 bg-gray-100" />

                        {/* Fulfillment */}
                        <div className="flex flex-col items-center gap-0.5 flex-1">
                            {product.offersPickup && (product.offersDelivery ?? true) ? (
                                <>
                                    <div className="flex items-center gap-1">
                                        <Truck className="w-3.5 h-3.5 text-gray-400" />
                                        <Store className="w-3.5 h-3.5 text-teal-500" />
                                    </div>
                                    <span className="text-[10px] text-gray-400">Delivery &amp; Pickup</span>
                                </>
                            ) : product.offersPickup ? (
                                <>
                                    <Store className="w-4 h-4 text-teal-500" />
                                    <span className="text-[10px] text-gray-400">Pickup only</span>
                                </>
                            ) : (
                                <>
                                    <Truck className="w-4 h-4 text-gray-400" />
                                    <span className="text-[10px] text-gray-400">Delivery</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(PopularStoreCard);
