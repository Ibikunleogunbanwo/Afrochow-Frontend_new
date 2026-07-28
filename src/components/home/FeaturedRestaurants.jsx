"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SearchAPI } from "@/lib/api/search.api";
import { PromotionsAPI } from "@/lib/api";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useLocation } from "@/contexts/LocationContext";
import FeaturedProductCard from "@/components/home/cards/FeaturedProductCard";
import FeaturedProductSkeleton from "@/components/home/cards/FeaturedProductSkeleton";
import LocationFallbackBanner from "@/components/home/LocationFallbackBanner";

// ── City + scheduleType-keyed cache with 5-minute TTL ────────────────────────
// Keyed by city (and geo-availability) so switching cities/coords fetches
// fresh results without busting unrelated cache entries. Each city key holds
// one entry per rail ('SAME_DAY' | 'ADVANCE_ORDER') since the two rails are
// fetched and cached independently.
const CACHE_TTL_MS = 5 * 60 * 1000;

const cityCache = {}; // { [city|'global']:{ geo|nogeo }: { [scheduleType]: { products, promoMap, isFallback, cachedAt } } }

const getCacheEntry = (key, scheduleType) => cityCache[key]?.[scheduleType];

const isCacheValid = (key, scheduleType) => {
    const entry = getCacheEntry(key, scheduleType);
    return entry && entry.cachedAt !== null && Date.now() - entry.cachedAt < CACHE_TTL_MS;
};

const setCacheEntry = (key, scheduleType, products, promoMap, isFallback = false) => {
    if (!cityCache[key]) cityCache[key] = {};
    cityCache[key][scheduleType] = { products, promoMap, isFallback, cachedAt: Date.now() };
};

// ── Shared fetch logic for one rail (city-scoped with nationwide fallback) ──
const fetchRail = async (scheduleType, city, lat, lng) => {
    let response = await SearchAPI.getFeaturedProducts(city || null, lat, lng, scheduleType);
    let products =
        response?.success && response?.data
            ? response.data
            : Array.isArray(response) ? response : [];

    let fallback = false;
    if (products.length === 0 && city) {
        response = await SearchAPI.getFeaturedProducts(null, lat, lng, scheduleType);
        products =
            response?.success && response?.data
                ? response.data
                : Array.isArray(response) ? response : [];
        fallback = true;
    }

    return { products, fallback };
};

const buildPromoMap = (list) =>
    list.reduce((m, p) => {
        if (p.vendorPublicId) {
            if (!m[p.vendorPublicId]) m[p.vendorPublicId] = [];
            m[p.vendorPublicId].push(p);
        }
        return m;
    }, {});

// ── One rail's presentation (skeleton / error / grid / empty) ───────────────
const ProductRail = ({
    products,
    loading,
    error,
    isFallback,
    city,
    promoMap,
    isAuthenticated,
    onUnauthenticated,
    onRetry,
    skeletonCount,
    emptyMessage,
    showViewAll,
}) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(skeletonCount)].map((_, i) => (
                    <FeaturedProductSkeleton key={`skeleton-${i}`} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center gap-4">
                <p className="text-gray-500 text-lg font-medium">Failed to load products.</p>
                <button
                    onClick={onRetry}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <>
            {isFallback && city && <LocationFallbackBanner city={city} />}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product, index) => (
                    <FeaturedProductCard
                        key={product.publicProductId || `product-${index}`}
                        product={product}
                        priority={index < 4}
                        isAuthenticated={isAuthenticated}
                        onUnauthenticated={onUnauthenticated}
                        promotions={promoMap[product.vendorPublicId] || []}
                    />
                ))}
            </div>

            {showViewAll && (
                <div className="mt-10 text-center">
                    <Link
                        href="/restaurants"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        <span>View All Products</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </>
    );
};

// ── Component ─────────────────────────────────────────────────────────────────
const FeaturedRestaurants = () => {
    const { isAuthenticated } = useAuth();
    const { openSignIn }      = useAuthModal();
    const { city, isDetecting, coordinates } = useLocation();
    const lat = coordinates?.lat ?? null;
    const lng = coordinates?.lng ?? null;

    // Cache key includes whether coordinates are known — once GPS/precise
    // coordinates arrive, distanceKm becomes available and results should be
    // refetched (and cached separately) rather than reusing a city-only cache
    // entry that has no distance data baked in.
    const cacheKey = `${city || 'global'}:${lat != null && lng != null ? 'geo' : 'nogeo'}`;

    const sameDayValid = isCacheValid(cacheKey, 'SAME_DAY');
    const sameDayCached = sameDayValid ? getCacheEntry(cacheKey, 'SAME_DAY') : null;
    const advanceValid = isCacheValid(cacheKey, 'ADVANCE_ORDER');
    const advanceCached = advanceValid ? getCacheEntry(cacheKey, 'ADVANCE_ORDER') : null;

    const [sameDayProducts, setSameDayProducts] = useState(sameDayCached?.products ?? []);
    const [sameDayPromoMap, setSameDayPromoMap] = useState(sameDayCached?.promoMap ?? {});
    const [sameDayLoading, setSameDayLoading]   = useState(!sameDayValid);
    const [sameDayError, setSameDayError]       = useState(false);
    const [sameDayFallback, setSameDayFallback] = useState(sameDayCached?.isFallback ?? false);

    const [advanceProducts, setAdvanceProducts] = useState(advanceCached?.products ?? []);
    const [advancePromoMap, setAdvancePromoMap] = useState(advanceCached?.promoMap ?? {});
    const [advanceLoading, setAdvanceLoading]   = useState(!advanceValid);
    const [advanceError, setAdvanceError]       = useState(false);
    const [advanceFallback, setAdvanceFallback] = useState(advanceCached?.isFallback ?? false);

    const [retryCount, setRetry] = useState(0);

    useEffect(() => {
        // Wait for location detection to settle before fetching
        if (isDetecting) return;

        // ── Ready-to-order (SAME_DAY) rail ──
        if (isCacheValid(cacheKey, 'SAME_DAY')) {
            const entry = getCacheEntry(cacheKey, 'SAME_DAY');
            setSameDayProducts(entry.products);
            setSameDayPromoMap(entry.promoMap);
            setSameDayFallback(entry.isFallback);
            setSameDayLoading(false);
        } else {
            setSameDayLoading(true);
            setSameDayError(false);
            fetchRail('SAME_DAY', city, lat, lng)
                .then(({ products, fallback }) => {
                    setSameDayProducts(products);
                    setSameDayFallback(fallback);

                    PromotionsAPI.getActivePromotions()
                        .then(res => {
                            const list = res?.success && Array.isArray(res.data)
                                ? res.data
                                : Array.isArray(res) ? res : [];
                            const map = buildPromoMap(list);
                            setCacheEntry(cacheKey, 'SAME_DAY', products, map, fallback);
                            setSameDayPromoMap(map);
                        })
                        .catch(() => setCacheEntry(cacheKey, 'SAME_DAY', products, {}, fallback));
                })
                .catch((err) => {
                    console.error("Error fetching ready-to-order products:", err);
                    setSameDayError(true);
                    setSameDayProducts([]);
                })
                .finally(() => setSameDayLoading(false));
        }

        // ── Pre-order / advance-notice (ADVANCE_ORDER) rail ──
        if (isCacheValid(cacheKey, 'ADVANCE_ORDER')) {
            const entry = getCacheEntry(cacheKey, 'ADVANCE_ORDER');
            setAdvanceProducts(entry.products);
            setAdvancePromoMap(entry.promoMap);
            setAdvanceFallback(entry.isFallback);
            setAdvanceLoading(false);
        } else {
            setAdvanceLoading(true);
            setAdvanceError(false);
            fetchRail('ADVANCE_ORDER', city, lat, lng)
                .then(({ products, fallback }) => {
                    setAdvanceProducts(products);
                    setAdvanceFallback(fallback);

                    PromotionsAPI.getActivePromotions()
                        .then(res => {
                            const list = res?.success && Array.isArray(res.data)
                                ? res.data
                                : Array.isArray(res) ? res : [];
                            const map = buildPromoMap(list);
                            setCacheEntry(cacheKey, 'ADVANCE_ORDER', products, map, fallback);
                            setAdvancePromoMap(map);
                        })
                        .catch(() => setCacheEntry(cacheKey, 'ADVANCE_ORDER', products, {}, fallback));
                })
                .catch((err) => {
                    console.error("Error fetching pre-order products:", err);
                    setAdvanceError(true);
                    setAdvanceProducts([]);
                })
                .finally(() => setAdvanceLoading(false));
        }
    }, [cacheKey, isDetecting, retryCount]); // eslint-disable-line react-hooks/exhaustive-deps -- lat/lng folded into cacheKey

    const handleRetry = () => {
        delete cityCache[cacheKey];
        setSameDayError(false);
        setAdvanceError(false);
        setRetry((n) => n + 1);
    };

    // Hide the pre-order rail entirely while it's empty (no advance-order
    // inventory in range) rather than showing a dead "nothing here" section —
    // it's a bonus rail, not a primary one.
    const showAdvanceRail = advanceLoading || advanceProducts.length > 0 || advanceError;

    return (
        <section className="py-16 bg-white">
            <div className="container px-4 mx-auto max-w-7xl">

                {/* ── Ready to order now ── */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center px-4 py-2 mb-4 bg-emerald-100 rounded-full">
                        <span className="text-sm font-semibold text-emerald-800">
                            Popular Dishes
                        </span>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 mb-4">
                        Featured Products{city ? ` in ${city}` : ""}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                        {city
                            ? `Ready-to-order dishes available near you in ${city} — no advance notice needed`
                            : "Ready-to-order dishes loved by our community — no advance notice needed"}
                    </p>
                </div>

                <ProductRail
                    products={sameDayProducts}
                    loading={sameDayLoading}
                    error={sameDayError}
                    isFallback={sameDayFallback}
                    city={city}
                    promoMap={sameDayPromoMap}
                    isAuthenticated={isAuthenticated}
                    onUnauthenticated={openSignIn}
                    onRetry={handleRetry}
                    skeletonCount={16}
                    emptyMessage="No featured products available at the moment"
                    showViewAll
                />

                {/* ── Pre-order / advance notice ── */}
                {showAdvanceRail && (
                    <div className="mt-20">
                        <div className="mb-10 text-center">
                            <div className="inline-flex items-center gap-1.5 justify-center px-4 py-2 mb-4 bg-blue-50 rounded-full">
                                <CalendarClock className="w-4 h-4 text-blue-700" />
                                <span className="text-sm font-semibold text-blue-700">
                                    Pre-Order
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4">
                                Worth the Wait
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                                Custom cakes, slow-cooked soups, and catering — order ahead so it&apos;s ready exactly when you need it.
                            </p>
                        </div>

                        <ProductRail
                            products={advanceProducts}
                            loading={advanceLoading}
                            error={advanceError}
                            isFallback={advanceFallback}
                            city={city}
                            promoMap={advancePromoMap}
                            isAuthenticated={isAuthenticated}
                            onUnauthenticated={openSignIn}
                            onRetry={handleRetry}
                            skeletonCount={4}
                            emptyMessage="No pre-order items available at the moment"
                            showViewAll={false}
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedRestaurants;
