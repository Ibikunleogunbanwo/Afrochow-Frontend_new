"use client";

import React, { useEffect, useState } from "react";
import { Star, MapPin } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { SearchAPI } from "@/lib/api/search.api";
import { PromotionsAPI } from "@/lib/api";
import PopularStoreCard from "@/components/home/cards/PopularStoreCard";
import PopularStoreSkeleton from "@/components/home/cards/PopularStoreSkeleton";
import LocationFallbackBanner from "@/components/home/LocationFallbackBanner";

const MAX_POPULAR = 8;
const SKELETON_COUNT = MAX_POPULAR;

// ── Module-level cache ────────────────────────────────────────────────────────
// Keyed by a composite of lat+lng+city so we re-fetch when location changes.
// 3-minute TTL: short enough to catch nearby vendor changes, long enough to
// avoid thrashing on rapid navigation back to the home page.
const POPULAR_CACHE_TTL_MS = 3 * 60 * 1000;

const cache = {
    stores:   null,
    promoMap: null,
    lat:      null,
    lng:      null,
    city:     null,
    scrollY:  0,
    cachedAt: null,  // timestamp for TTL
};

const cacheKey = (lat, lng, city) =>
    `${lat ?? ''}:${lng ?? ''}:${city ?? ''}`;


// ── Transform a VendorProfileResponseDto into a PopularStoreCard-compatible object ──
const transformVendor = (vendor) => ({
    vendorPublicId:         vendor.publicUserId,
    // Prefer banner (wider, more visual) over logo for the card hero image
    imageUrl:               vendor.bannerUrl || vendor.logoUrl || null,
    restaurantName:         vendor.restaurantName || "Store",
    storeCategory:            vendor.storeCategory    || null,
    location:               vendor.address?.city && vendor.address?.province
                                ? `${vendor.address.city}, ${vendor.address.province}`
                                : vendor.address?.city || "",
    // Trust the backend's vendor-timezone-aware isOpenNow (VendorProfile.isOpenNow())
    // rather than recomputing client-side — the detail page does the same, and a
    // client-side recompute using the customer's browser timezone against the
    // vendor's local hours produced disagreements between the two pages.
    isOpenNow:              vendor.isOpenNow ?? null,
    todayHoursFormatted:    vendor.todayHoursFormatted ?? null,
    // Use ?? not || so that deliveryFee: 0 (free delivery) is preserved
    deliveryFee:            vendor.deliveryFee            ?? 2.99,
    offersPickup:           vendor.offersPickup           ?? false,
    offersDelivery:         vendor.offersDelivery         ?? true,
    preparationTimeMinutes: vendor.estimatedDeliveryMinutes ?? vendor.preparationTime ?? 30,
    averageRating:          vendor.averageRating          ?? 0,
    reviewCount:            vendor.reviewCount            ?? 0,
    totalOrders:            vendor.totalOrdersCompleted   ?? 0,
});

// ── Main component ────────────────────────────────────────────────────────────
const PopularStores = () => {
    const { isAuthenticated }                        = useAuth();
    const { openSignIn }                             = useAuthModal();
    const { city, locationSource, coordinates }      = useLocation();

    const currentKey = cacheKey(coordinates?.lat, coordinates?.lng, city);

    const isCacheValid = () =>
        cache.stores !== null &&
        cacheKey(cache.lat, cache.lng, cache.city) === currentKey &&
        cache.cachedAt !== null &&
        Date.now() - cache.cachedAt < POPULAR_CACHE_TTL_MS;

    const [popularStores, setPopularStores] = useState(isCacheValid() ? cache.stores : []);
    const [promoMap, setPromoMap]           = useState(isCacheValid() ? cache.promoMap ?? {} : {});
    const [loading, setLoading]             = useState(!isCacheValid());
    const [error, setError]       = useState(false);
    const [isFallback, setIsFallback] = useState(false);
    const [retryCount, setRetry]  = useState(0);

    // Restore scroll position on remount — only when the cache key matches
    useEffect(() => {
        if (isCacheValid() && cache.scrollY) {
            window.scrollTo({ top: cache.scrollY, behavior: "instant" });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save scroll position on unmount
    useEffect(() => () => { cache.scrollY = window.scrollY; }, []);

    useEffect(() => {
        if (isCacheValid()) {
            setPopularStores(cache.stores);
            setPromoMap(cache.promoMap ?? {});
            setLoading(false);
            setError(false);
            return;
        }

        const fetchPopular = async () => {
            try {
                setLoading(true);
                setError(false);

                let vendorList = [];

                // Priority 1: GPS coordinates → radius search (most accurate)
                if (coordinates?.lat && coordinates?.lng) {
                    const res = await SearchAPI.getVendorsNearCoordinates(
                        coordinates.lat, coordinates.lng, 25
                    ).catch((err) => {
                        console.error("Vendors near-coordinates fetch failed:", err.message);
                        return null;
                    });

                    vendorList = res?.success && Array.isArray(res.data)
                        ? res.data
                        : Array.isArray(res) ? res : [];
                }

                // Priority 2: City name → city-scoped vendor search
                if (vendorList.length === 0 && city) {
                    const res = await SearchAPI.getVendorsByCity(city).catch((err) => {
                        console.error("Vendors by city fetch failed:", err.message);
                        return null;
                    });

                    vendorList = res?.success && Array.isArray(res.data)
                        ? res.data
                        : Array.isArray(res) ? res : [];
                }

                // Fallback: no local results → fetch top-rated nationwide
                let fallback = false;
                if (vendorList.length === 0) {
                    const res = await SearchAPI.getTopRatedVendors().catch(() => null);
                    vendorList = res?.success && Array.isArray(res.data)
                        ? res.data
                        : Array.isArray(res) ? res : [];
                    fallback = true;
                }

                setIsFallback(fallback && (!!city || !!(coordinates?.lat)));

                if (vendorList.length === 0) {
                    setPopularStores([]);
                    cache.stores   = [];
                    cache.promoMap = {};
                    cache.lat      = coordinates?.lat ?? null;
                    cache.lng      = coordinates?.lng ?? null;
                    cache.city     = city ?? null;
                    cache.cachedAt = Date.now();
                    return;
                }

                // Deduplicate by vendorPublicId (belt-and-suspenders — API already returns unique vendors)
                const seen = new Set();
                const unique = vendorList.filter((v) => {
                    const id = v.publicUserId;
                    if (!id || seen.has(id)) return false;
                    seen.add(id);
                    return true;
                });

                const transformed = unique
                    .slice(0, MAX_POPULAR)
                    .map(transformVendor);

                // Open first → unknown (null) → closed last
                const openRank = (v) => v.isOpenNow === true ? 0 : v.isOpenNow === false ? 2 : 1;
                const sorted = [...transformed].sort((a, b) => openRank(a) - openRank(b));

                // Update cache
                cache.stores   = sorted;
                cache.promoMap = {};
                cache.lat      = coordinates?.lat ?? null;
                cache.lng      = coordinates?.lng ?? null;
                cache.city     = city ?? null;
                cache.cachedAt = Date.now();

                setPopularStores(sorted);

                // Fetch active promos in the background — never blocks store rendering
                PromotionsAPI.getActivePromotions()
                    .then(res => {
                        const list = res?.success && Array.isArray(res.data)
                            ? res.data
                            : Array.isArray(res) ? res : [];
                        const map = list.reduce((m, p) => {
                            if (p.vendorPublicId) {
                                if (!m[p.vendorPublicId]) m[p.vendorPublicId] = [];
                                m[p.vendorPublicId].push(p);
                            }
                            return m;
                        }, {});
                        cache.promoMap = map;
                        setPromoMap(map);
                    })
                    .catch(() => { /* promos are optional */ });

            } catch (err) {
                console.error("PopularStores fetch error:", err.message);
                setError(true);
                setPopularStores([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchPopular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [city, coordinates?.lat, coordinates?.lng, retryCount]);

    const handleRetry = () => {
        cache.stores   = null;
        cache.promoMap = null;
        cache.lat      = null;
        cache.lng      = null;
        cache.city     = null;
        cache.cachedAt = null;
        setError(false);
        setRetry((n) => n + 1);
    };

    return (
        <section className="py-20 bg-white">
            <div className="container px-4 mx-auto max-w-7xl">

                {/* Header */}
                <div className="max-w-2xl mx-auto text-center mb-10">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 mb-6 bg-linear-to-r from-orange-100 to-red-100 rounded-full">
                        <Star className="w-4 h-4 text-orange-600 fill-orange-600" />
                        <span className="text-sm font-semibold text-orange-800">Customer Favorites</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        Popular Home Kitchens and African Stores
                        <span className="block text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">
                            Near You
                        </span>
                    </h2>

                </div>

                {/* Fallback banner */}
                {!loading && isFallback && city && (
                    <LocationFallbackBanner city={city} />
                )}

                {/* Cards */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(SKELETON_COUNT)].map((_, i) => (
                            <PopularStoreSkeleton key={`skeleton-${i}`} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-4">
                        <p className="text-gray-600 text-lg font-semibold">
                            Failed to load stores. Please try again.
                        </p>
                        <button
                            onClick={handleRetry}
                            className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : popularStores.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {popularStores.map((store, index) => (
                            <PopularStoreCard
                                key={store.vendorPublicId || `store-${index}`}
                                product={store}
                                priority={index < 4}
                                isAuthenticated={isAuthenticated}
                                onUnauthenticated={openSignIn}
                                promotions={promoMap[store.vendorPublicId] || []}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg font-semibold mb-1">
                            No stores found{city ? ` in ${city}` : " near you"}
                        </p>
                        <p className="text-gray-400 text-sm mb-6">
                            Try searching a different city or address above
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PopularStores;
