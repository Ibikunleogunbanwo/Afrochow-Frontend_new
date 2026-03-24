"use client";

import Image from "next/image";
import { Star, Flame, Clock, MapPin, Store,Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { resolveImageUrl } from "@/lib/utils/imageUrl";

// ── Badge sub-components ──────────────────────────────────────────────────────

const CategoryBadge = ({ category }) => (
    <div className="absolute top-3 left-3">
        <span className="px-2.5 py-1 text-[11px] font-bold bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-sm">
            {category}
        </span>
    </div>
);

const OrdersBadge = ({ totalOrders }) => (
    <div className="absolute top-3 right-3">
        <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-orange-500 text-white rounded-full shadow-sm">
            <Flame className="w-3 h-3" />
            {totalOrders >= 1000 ? `${(totalOrders / 1000).toFixed(1)}k` : totalOrders} orders
        </span>
    </div>
);

const OpenStatusBadge = ({ isOpen }) => (
    <div
        className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-sm shadow-sm ${
            isOpen ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
        }`}
    >
        {isOpen ? "🟢 Open Now" : "🔴 Closed"}
    </div>
);

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

    return (
        <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className="group block h-full cursor-pointer"
            role="button"
            tabIndex={0}
        >
            <div className="h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

                {/* Image */}
                <div className="relative w-full aspect-4/3 overflow-hidden bg-gray-100">
                    {resolveImageUrl(product.imageUrl) ? (
                        <Image
                            src={resolveImageUrl(product.imageUrl)}
                            alt={product.name}
                            fill
                            priority={priority}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-orange-50">
                            <Flame className="w-10 h-10 text-orange-300" />
                        </div>
                    )}

                    {product.categoryName && <CategoryBadge category={product.categoryName} />}
                    {product.totalOrders > 0 && <OrdersBadge totalOrders={product.totalOrders} />}
                    {product.isOpenNow !== null && <OpenStatusBadge isOpen={product.isOpenNow} />}

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
                <div className="p-4 flex flex-col">
                    {/* Variable content — grows to fill available space */}
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 truncate mb-0.5">
                            {product.name}
                        </h3>

                        {product.restaurantName && (
                            <p className="text-xs text-orange-500 font-medium truncate mb-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 shrink-0" /> {product.restaurantName}
                            </p>
                        )}

                        {product.location && (
                            <p className="text-xs text-gray-400 truncate mb-3">{product.location}</p>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">

                                {/* Rating */}
                                <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                                    <span className="text-xs font-bold text-gray-800">
                                        {product.averageRating > 0 ? product.averageRating.toFixed(1) : "0"}
                                    </span>
                                    {product.reviewCount > 0 && (
                                        <span className="text-xs text-gray-400">
                                            ({product.reviewCount >= 1000
                                            ? `${(product.reviewCount / 1000).toFixed(1)}k`
                                            : product.reviewCount})
                                        </span>
                                    )}
                                </div>

                                {/* Prep time */}
                                {product.preparationTimeMinutes > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock className="w-3 h-3" /> {product.preparationTimeMinutes} min
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            {product.price != null && (
                                <span className="text-sm font-bold text-gray-900">
                                    ${Number(product.price).toFixed(2)}
                                </span>
                            )}
                        </div>

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

                        {product.todayHoursFormatted && (
                            <p className="text-[11px] text-gray-400 mt-2 truncate">
                                {product.todayHoursFormatted}
                            </p>
                        )}
                    </div>

                    {/* Fulfilment — always rendered so all cards share the same bottom height */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        {product.offersPickup ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 text-teal-700 text-xs font-semibold rounded-xl border border-teal-100 w-full justify-center">
                                <Store className="w-3.5 h-3.5 shrink-0" />
                                Store pickup available
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 text-gray-400 text-xs font-medium rounded-xl border border-gray-100 w-full justify-center">
                                <Truck className="w-3.5 h-3.5 shrink-0" />
                                Delivery only
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopularStoreCard;