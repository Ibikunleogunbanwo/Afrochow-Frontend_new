"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { SearchAPI } from "@/lib/api/search.api";
import { useLocation } from "@/contexts/LocationContext";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/contexts/AuthModalContext";
import PopularStoreCard from "@/components/home/cards/PopularStoreCard";
import PopularStoreSkeleton from "@/components/home/cards/PopularStoreSkeleton";
import LocationFallbackBanner from "@/components/home/LocationFallbackBanner";

// ── Cache keyed by composite of coords + city (same pattern as PopularRestaurants) ──
const CACHE_TTL_MS = 3 * 60 * 1000;
const storesCache  = {};

const getCacheKey = (lat, lng, city) =>
    `${lat ?? ''}:${lng ?? ''}:${city ? city.toLowerCase().trim() : ''}`;

const isCacheValid = (key) => {
    const entry = storesCache[key];
    return entry && entry.cachedAt && Date.now() - entry.cachedAt < CACHE_TTL_MS;
};

// ── Hours helpers (shared logic with PopularRestaurants) ──────────────────────
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

const transformVendor = (vendor) => ({
    vendorPublicId:         vendor.publicUserId,
    imageUrl:               vendor.bannerUrl || vendor.logoUrl || null,
    restaurantName:         vendor.restaurantName || "Store",
    storeCategory:            vendor.storeCategory    || null,
    location:               vendor.address?.city && vendor.address?.province
                                ? `${vendor.address.city}, ${vendor.address.province}`
                                : vendor.address?.city || "",
    isOpenNow:              computeIsOpenFromSchedule(vendor.weeklySchedule ?? vendor.operatingHours)
                                ?? computeIsOpenNow(vendor.todayHoursFormatted)
                                ?? vendor.isOpenNow
                                ?? null,
    todayHoursFormatted:    computeTodayHoursFromSchedule(vendor.weeklySchedule ?? vendor.operatingHours)
                                ?? vendor.todayHoursFormatted
                                ?? null,
    deliveryFee:            vendor.deliveryFee            ?? 2.99,
    offersPickup:           vendor.offersPickup           ?? false,
    offersDelivery:         vendor.offersDelivery         ?? true,
    preparationTimeMinutes: vendor.estimatedDeliveryMinutes ?? vendor.preparationTime ?? 30,
    averageRating:          vendor.averageRating          ?? 0,
    reviewCount:            vendor.reviewCount            ?? 0,
    totalOrders:            vendor.totalOrdersCompleted   ?? 0,
});

const SKELETON_COUNT = 6;

const TopStores = () => {
    const { city, coordinates, isDetecting } = useLocation();
    const { isAuthenticated }                = useAuth();
    const { openSignIn }                     = useAuthModal();

    const cacheKey = getCacheKey(coordinates?.lat, coordinates?.lng, city);

    const [stores,     setStores]     = useState(isCacheValid(cacheKey) ? storesCache[cacheKey].stores : []);
    const [loading,    setLoading]    = useState(!isCacheValid(cacheKey));
    const [error,      setError]      = useState(false);
    const [isFallback, setIsFallback] = useState(false);
    const [retryCount, setRetry]      = useState(0);

    useEffect(() => {
        if (isDetecting) return;

        const key = getCacheKey(coordinates?.lat, coordinates?.lng, city);

        if (isCacheValid(key)) {
            setStores(storesCache[key].stores);
            setLoading(false);
            setError(false);
            return;
        }

        const fetchTopStores = async () => {
            try {
                setLoading(true);
                setError(false);

                let vendorList = [];

                // Priority 1: GPS coordinates → radius search (most accurate)
                if (coordinates?.lat && coordinates?.lng) {
                    const res = await SearchAPI.getVendorsNearCoordinates(
                        coordinates.lat, coordinates.lng, 25
                    ).catch(() => null);
                    vendorList = res?.success && Array.isArray(res.data)
                        ? res.data
                        : Array.isArray(res) ? res : [];
                }

                // Priority 2: City name → city-scoped search
                if (vendorList.length === 0 && city) {
                    const res = await SearchAPI.getVendorsByCity(city).catch(() => null);
                    vendorList = res?.success && Array.isArray(res.data)
                        ? res.data
                        : Array.isArray(res) ? res : [];
                }

                // Priority 3: Global top-rated fallback (no location)
                let fallback = false;
                if (vendorList.length === 0) {
                    const res = await SearchAPI.getTopRatedVendors().catch(() => null);
                    vendorList = res?.success && Array.isArray(res.data)
                        ? res.data
                        : Array.isArray(res) ? res : [];
                    fallback = vendorList.length > 0 && !!(city || coordinates?.lat);
                }
                setIsFallback(fallback);

                const openRank = (v) => v.isOpenNow === true ? 0 : v.isOpenNow === false ? 2 : 1;
                const sorted = vendorList
                    .map(transformVendor)
                    .sort((a, b) => openRank(a) - openRank(b));

                storesCache[key] = { stores: sorted, cachedAt: Date.now() };
                setStores(sorted);
            } catch (err) {
                console.error("TopStores fetch error:", err.message);
                setError(true);
                setStores([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchTopStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [city, coordinates?.lat, coordinates?.lng, isDetecting, retryCount]);

    const handleRetry = () => {
        const key = getCacheKey(coordinates?.lat, coordinates?.lng, city);
        delete storesCache[key];
        setError(false);
        setRetry((n) => n + 1);
    };

    return (
        <section className="py-16 bg-linear-to-b from-white to-orange-50/30">
            <div className="container px-4 mx-auto max-w-7xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-6">
                    <div className="flex-1">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 mb-4 bg-linear-to-r from-orange-100 to-red-100 rounded-full">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-semibold text-orange-800">Top Rated</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
                            Popular Stores
                            <span className="block text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">
                                {city ? `in ${city}` : "Near You"}
                            </span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl">
                            Discover highly rated African stores in your area
                        </p>
                    </div>

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
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center gap-4">
                        <p className="text-gray-500 text-lg font-medium">
                            Failed to load stores. Please try again.
                        </p>
                        <button
                            onClick={handleRetry}
                            className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : stores.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {stores.map((store, index) => (
                            <PopularStoreCard
                                key={store.vendorPublicId || `store-${index}`}
                                product={store}
                                priority={index < 4}
                                isAuthenticated={isAuthenticated}
                                onUnauthenticated={openSignIn}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg font-medium">
                            No stores available {city ? `in ${city}` : "in your area"} at the moment
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Try searching a different city or address above
                        </p>
                    </div>
                )}

                {/* Bottom CTA */}
                {!loading && !error && stores.length > 0 && (
                    <div className="mt-12 text-center">
                        <p className="text-gray-600 mb-4">Want to see more amazing stores?</p>
                        <Link
                            href="/allstore"
                            className="inline-flex items-center space-x-2 px-8 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <span>Explore All Stores</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default TopStores;
