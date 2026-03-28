"use client";

import React, { useEffect, useState } from "react";
import { Star, MapPin, Loader2 } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { SearchAPI } from "@/lib/api/search.api";
import { PromotionsAPI } from "@/lib/api";
import PopularStoreCard from "@/components/home/cards/PopularStoreCard";
import PopularStoreSkeleton from "@/components/home/cards/PopularStoreSkeleton";

const MAX_POPULAR = 8;
const SKELETON_COUNT = MAX_POPULAR;

// Parse "Open HH:MM - HH:MM" (24h) or "HH:MM AM - HH:MM PM" (12h) using browser local time.
const computeIsOpenNow = (todayHoursFormatted) => {
    if (!todayHoursFormatted) return null;
    const m24 = todayHoursFormatted.match(/^(?:open\s+)?(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})$/i);
    if (m24) {
        const now = new Date(); const cur = now.getHours() * 60 + now.getMinutes();
        const o = parseInt(m24[1]) * 60 + parseInt(m24[2]);
        const c = parseInt(m24[3]) * 60 + parseInt(m24[4]);
        return c > o ? cur >= o && cur < c : cur >= o || cur < c;
    }
    const m12 = todayHoursFormatted.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m12) {
        const to24 = (h, m, p) => { let hr = parseInt(h); const mn = parseInt(m); if (p.toUpperCase()==='PM'&&hr!==12) hr+=12; if (p.toUpperCase()==='AM'&&hr===12) hr=0; return hr*60+mn; };
        const now = new Date(); const cur = now.getHours() * 60 + now.getMinutes();
        const o = to24(m12[1], m12[2], m12[3]); const c = to24(m12[4], m12[5], m12[6]);
        return c > o ? cur >= o && cur < c : cur >= o || cur < c;
    }
    return null;
};

// Extract today's formatted hours from weeklySchedule using browser local day.
const computeTodayHoursFromSchedule = (weeklySchedule) => {
    if (!weeklySchedule || typeof weeklySchedule !== 'object' || Array.isArray(weeklySchedule)) return null;
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const today = days[new Date().getDay()];
    const cap = today.charAt(0).toUpperCase() + today.slice(1);
    const day = weeklySchedule[today] ?? weeklySchedule[cap] ?? weeklySchedule[today.toUpperCase()];
    if (!day) return null;
    if (!(day.isOpen ?? day.open ?? false)) return 'Closed today';
    const ot = day.openTime ?? day.open_time ?? day.startTime;
    const ct = day.closeTime ?? day.close_time ?? day.endTime;
    if (!ot || !ct) return null;
    return `${ot} - ${ct}`;
};

// Compute from full weeklySchedule object using browser local day (most accurate).
const computeIsOpenFromSchedule = (weeklySchedule) => {
    if (!weeklySchedule || typeof weeklySchedule !== 'object' || Array.isArray(weeklySchedule)) return null;
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const today = days[new Date().getDay()];
    const cap = today.charAt(0).toUpperCase() + today.slice(1);
    const day = weeklySchedule[today] ?? weeklySchedule[cap] ?? weeklySchedule[today.toUpperCase()];
    if (!day) return null;
    if (!(day.isOpen ?? day.open ?? false)) return false;
    const ot = day.openTime ?? day.open_time ?? day.startTime;
    const ct = day.closeTime ?? day.close_time ?? day.endTime;
    if (!ot || !ct) return null;
    const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const now = new Date(); const cur = now.getHours() * 60 + now.getMinutes();
    const o = toMins(ot), c = toMins(ct);
    return c > o ? cur >= o && cur < c : cur >= o || cur < c;
};

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

// ── Detect location button ────────────────────────────────────────────────────
const DetectLocationButton = ({ isDetecting, onClick, label = "Use my exact location" }) => (
    <button
        onClick={onClick}
        disabled={isDetecting}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {isDetecting ? (
            <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting...
            </>
        ) : (
            <>
                <MapPin className="w-3.5 h-3.5" /> {label}
            </>
        )}
    </button>
);

// ── Transform a VendorProfileResponseDto into a PopularStoreCard-compatible object ──
const transformVendor = (vendor) => ({
    vendorPublicId:         vendor.publicUserId,
    // Prefer banner (wider, more visual) over logo for the card hero image
    imageUrl:               vendor.bannerUrl || vendor.logoUrl || null,
    restaurantName:         vendor.restaurantName || "Store",
    cuisineType:            vendor.cuisineType    || null,
    location:               vendor.address?.city && vendor.address?.province
                                ? `${vendor.address.city}, ${vendor.address.province}`
                                : vendor.address?.city || "",
    isOpenNow:              computeIsOpenFromSchedule(vendor.weeklySchedule)
                                ?? computeIsOpenNow(vendor.todayHoursFormatted)
                                ?? vendor.isOpenNow
                                ?? null,
    todayHoursFormatted:    computeTodayHoursFromSchedule(vendor.weeklySchedule)
                                ?? vendor.todayHoursFormatted
                                ?? null,
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
    const { isAuthenticated }                                                         = useAuth();
    const { openSignIn }                                                              = useAuthModal();
    const { city, isDetecting, locationSource, requestPreciseLocation, coordinates } = useLocation();

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

    const locationLabel = locationSource === "gps" ? `${city} (GPS)` : city || null;

    return (
        <section className="py-20 bg-white">
            <div className="container px-4 mx-auto max-w-7xl">

                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16">
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

                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        {locationLabel && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                <MapPin className="w-3.5 h-3.5" /> {locationLabel}
                            </span>
                        )}
                        <DetectLocationButton
                            isDetecting={isDetecting}
                            onClick={requestPreciseLocation}
                        />
                    </div>
                </div>

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
                            Try a different city or enable location access for better results
                        </p>
                        <DetectLocationButton
                            isDetecting={isDetecting}
                            onClick={requestPreciseLocation}
                            label="Detect my location"
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export default PopularStores;
