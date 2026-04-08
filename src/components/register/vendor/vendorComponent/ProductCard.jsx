'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Clock, Calendar, ShoppingBag, ChevronRight } from 'lucide-react';

// ── Promo badge helper ────────────────────────────────────────────────────────
const getPromoBadge = (promotions) => {
    if (!promotions?.length) return null;
    const active = promotions.filter(p => p.isActive !== false);
    if (!active.length) return null;
    const free = active.find(p => p.type === 'FREE_DELIVERY');
    if (free) return { label: '🚚 Free Delivery', bg: 'bg-blue-500' };
    const pct = active.filter(p => p.type === 'PERCENTAGE').sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
    if (pct) return { label: `${pct.value}% OFF`, bg: 'bg-green-500' };
    const fixed = active.filter(p => p.type === 'FIXED_AMOUNT').sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
    if (fixed) return { label: `$${fixed.value} OFF`, bg: 'bg-orange-500' };
    return null;
};

// ── Component ─────────────────────────────────────────────────────────────────
const ProductCard = ({ product, onViewReviews, onCardClick, promotions = [] }) => {
    const [imgError, setImgError] = useState(false);
    const promo    = getPromoBadge(promotions);
    const isAdvance = product.scheduleType === 'ADVANCE_ORDER';

    const dietaryTags = [
        product.isVegan                        && { label: '🌱 Vegan',      css: 'bg-green-50 text-green-700 border-green-100' },
        product.isVegetarian && !product.isVegan && { label: '🥬 Veg',      css: 'bg-green-50 text-green-700 border-green-100' },
        product.isGlutenFree                   && { label: '🌾 GF',         css: 'bg-blue-50 text-blue-700 border-blue-100'   },
        product.isSpicy                        && { label: '🌶️ Spicy',      css: 'bg-red-50 text-red-700 border-red-100'     },
    ].filter(Boolean);

    return (
        <div
            onClick={onCardClick}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100
                       hover:shadow-md hover:border-orange-200 transition-all duration-200
                       cursor-pointer flex flex-col"
        >
            {/* ── Image ── */}
            <div className="relative w-full h-36 sm:h-40 bg-gray-100 shrink-0 overflow-hidden">
                {product.imageUrl && !imgError ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-gray-100">
                        <ShoppingBag className="w-10 h-10 text-orange-200" />
                    </div>
                )}

                {/* Bottom gradient for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Promo badge — top left */}
                {promo && (
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm ${promo.bg}`}>
                        {promo.label}
                    </div>
                )}

                {/* Unavailable overlay */}
                {!product.available && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold rounded-full">
                            Unavailable
                        </span>
                    </div>
                )}

                {/* Price pill — bottom right on image */}
                {product.price != null && (
                    <div className="absolute bottom-2 right-2">
                        <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-black rounded-full shadow-md">
                            CA${product.price.toFixed(2)}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Content ── */}
            <div className="p-3 flex flex-col flex-1 gap-1.5">

                {/* Name */}
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1 leading-snug">
                    {product.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {product.description || ''}
                </p>

                {/* Category + schedule */}
                <div className="flex flex-wrap gap-1">
                    {product.categoryName && (
                        <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-semibold rounded">
                            {product.categoryName}
                        </span>
                    )}
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                        isAdvance ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                    }`}>
                        {isAdvance
                            ? <><Calendar className="w-2.5 h-2.5" />
                                {product.advanceNoticeHours ? `${product.advanceNoticeHours}h notice` : 'Advance'}</>
                            : <><Clock className="w-2.5 h-2.5" /> Same day</>
                        }
                    </span>
                </div>

                {/* Dietary tags — only render row if any exist */}
                {dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {dietaryTags.map(tag => (
                            <span key={tag.label} className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${tag.css}`}>
                                {tag.label}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer: rating + "View" cue */}
                <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewReviews(); }}
                        className="flex items-center gap-1 group/star hover:text-orange-500 transition-colors"
                        aria-label="View reviews"
                    >
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        <span className="text-xs font-semibold text-gray-800 group-hover/star:text-orange-500 transition-colors">
                            {product.averageRating?.toFixed(1) ?? '0.0'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            ({product.reviewCount ?? 0})
                        </span>
                    </button>

                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-400 group-hover:text-orange-500 transition-colors">
                        View <ChevronRight className="w-3 h-3" />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
