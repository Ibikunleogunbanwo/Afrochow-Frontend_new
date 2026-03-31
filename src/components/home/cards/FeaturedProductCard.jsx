"use client";

import Image from "next/image";
import { Star, Flame, Clock, ArrowRight, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { memo, useState } from "react";
import { motion } from "framer-motion";
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

const StatItem = ({ label, value }) => (
    <div className="flex flex-col items-center">
        <span className="text-sm font-bold text-gray-900">{value}</span>
        <span className="text-[10px] text-gray-400 mt-0.5">{label}</span>
    </div>
);

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
        scheduleType,
        advanceNoticeHours,
        isVegan,
        isVegetarian,
        isGlutenFree,
        isSpicy,
    } = product;

    const isAdvance = scheduleType === 'ADVANCE_ORDER';

    const router = useRouter();
    const [imgError, setImgError] = useState(false);
    const promoBadge = getPromoBadge(promotions);

    const handleClick = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            sessionStorage.setItem('returnTo', `/restaurant/${vendorPublicId}`);
            onUnauthenticated();
        } else {
            router.push(`/restaurant/${vendorPublicId}`);
        }
    };

    const dietaryTags = [
        isVegan        && { label: '🌱 Vegan',       bg: 'bg-green-50 text-green-700 border-green-100' },
        isVegetarian && !isVegan && { label: '🥬 Vegetarian',  bg: 'bg-green-50 text-green-700 border-green-100' },
        isGlutenFree   && { label: '🌾 Gluten-Free',  bg: 'bg-blue-50 text-blue-700 border-blue-100' },
        isSpicy        && { label: '🌶️ Spicy',        bg: 'bg-red-50 text-red-700 border-red-100' },
    ].filter(Boolean);

    return (
        <motion.div
            onClick={handleClick}
            className="group w-full h-full cursor-pointer"
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <div className="w-full h-full flex flex-col overflow-hidden rounded-2xl bg-white shadow-md">

                {/* ── Image section ── */}
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                    {resolveImageUrl(imageUrl) && !imgError ? (
                        <Image
                            src={resolveImageUrl(imageUrl)}
                            alt={name}
                            fill
                            priority={priority}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            quality={75}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-gray-100">
                            <Flame className="w-12 h-12 text-orange-200" />
                        </div>
                    )}

                    {/* Gradient overlay — stronger at bottom for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top-left: category */}
                    {categoryName && (
                        <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 text-[11px] font-bold bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-sm">
                                {categoryName}
                            </span>
                        </div>
                    )}

                    {/* Top-right: orders badge */}
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

                    {/* Bottom overlay: name + restaurant + hover button */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4">
                        <div className="text-white min-w-0 flex-1 mr-2">
                            <h3 className="text-base font-bold leading-snug line-clamp-1 drop-shadow">
                                {name}
                            </h3>
                            {restaurantName && (
                                <p className="text-xs text-white/80 truncate mt-0.5 drop-shadow">
                                    {restaurantName}
                                </p>
                            )}
                        </div>

                        {/* "View Menu" button — slides in on hover via pure CSS group-hover.
                            Previously used a nested motion.div with animate={{ opacity:0 }}
                            which overrides CSS and kept the button permanently invisible. */}
                        <div className="opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out shrink-0">
                            <button
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-full shadow-lg hover:bg-orange-500 hover:text-white transition-colors"
                                aria-label={`View menu for ${restaurantName || name}`}
                            >
                                View Store
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Promo badge — bottom right when no button overlap */}
                    {promoBadge && (
                        <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white backdrop-blur-sm shadow-sm opacity-100 group-hover:opacity-0 transition-opacity duration-200 ${promoBadge.bg}`}>
                            {promoBadge.label}
                        </div>
                    )}
                </div>

                {/* ── Bottom section ── */}
                <div className="px-4 pt-3 pb-4 flex flex-col flex-1">

                    {/* Order type pill — fulfilment, not dietary */}
                    <div className="mb-2">
                        {isAdvance ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[11px] font-semibold">
                                📅 Advance order &mdash; {advanceNoticeHours ? `${advanceNoticeHours}h` : '24h+'} notice required
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-[11px] font-semibold">
                                ⚡ Ready to order &mdash; {preparationTimeMinutes > 0 ? `ready in ${preparationTimeMinutes} min` : 'same day'}
                            </span>
                        )}
                    </div>

                    {/* Dietary tags — reserve min height so cards stay uniform */}
                    <div className="flex flex-wrap gap-1.5 mb-3 min-h-[1.75rem]">
                        {dietaryTags.map((tag) => (
                            <span
                                key={tag.label}
                                className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${tag.bg}`}
                            >
                                {tag.label}
                            </span>
                        ))}
                    </div>

                    {/* Push stats to bottom */}
                    <div className="mt-auto">

                    {/* Divider */}
                    <div className="h-px w-full bg-gray-100 mb-3" />

                    {/* 3-column stats */}
                    <div className="flex items-center justify-between">
                        <StatItem
                            label="Rating"
                            value={averageRating > 0
                                ? `⭐ ${averageRating.toFixed(1)}${reviewCount > 0 ? ` (${reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})` : ''}`
                                : '⭐ 0'}
                        />
                        <div className="w-px h-8 bg-gray-100" />
                        <StatItem
                            label="Orders"
                            value={totalOrders > 0
                                ? (totalOrders >= 1000 ? `${(totalOrders / 1000).toFixed(1)}k` : totalOrders)
                                : 0}
                        />
                        <div className="w-px h-8 bg-gray-100" />
                        <StatItem
                            label="Price"
                            value={price != null ? `$${Number(price).toFixed(2)}` : '—'}
                        />
                    </div>

                    </div>{/* end mt-auto */}
                </div>
            </div>
        </motion.div>
    );
};

export default memo(FeaturedProductCard);
