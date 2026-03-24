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
// `stores` and `city` are invalidated together when city changes.
// `vendors` persists across city changes — verified vendor list rarely changes.
// `scrollY` restores scroll position on remount.
const cache = {
    stores:   null,
    vendors:  null,
    promoMap: null,
    city:     null,
    scrollY:  0,
};

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

// ── Main component ────────────────────────────────────────────────────────────
const PopularStores = () => {
    const { isAuthenticated }                                                          = useAuth();
    const { openSignIn }                                                               = useAuthModal();
    const { city, isDetecting, locationSource, requestPreciseLocation, coordinates }  = useLocation();

    const [popularStores, setPopularStores] = useState(cache.stores || []);
    const [promoMap, setPromoMap]           = useState(cache.promoMap || {});
    const [loading, setLoading]             = useState(!cache.stores);
    const [error, setError]                 = useState(false);
    const [retryCount, setRetry]            = useState(0);

    // Restore scroll position on remount
    useEffect(() => {
        if (cache.stores && cache.scrollY) {
            window.scrollTo({ top: cache.scrollY, behavior: "instant" });
        }
    }, []);

    // Save scroll position on unmount
    useEffect(() => () => { cache.scrollY = window.scrollY; }, []);

    useEffect(() => {
        const isCacheValid = cache.stores && cache.city === city;
        if (isCacheValid) {
            setPopularStores(cache.stores);
            setPromoMap(cache.promoMap || {});
            setLoading(false);
            setError(false);
            return;
        }

        const fetchPopular = async () => {
            try {
                setLoading(true);
                setError(false);

                // Fetch products — city-specific if available, otherwise monthly popular
                const productsResponse = await (city
                        ? SearchAPI.getProductsNearMe(city)
                        : SearchAPI.getMonthlyPopularProducts()
                ).catch((err) => {
                    console.error("Products fetch failed:", {
                        status:  err.status,
                        message: err.message,
                        data:    err.data,
                    });
                    return null;
                });

                if (!productsResponse) {
                    setPopularStores([]);
                    return;
                }

                // Reuse cached vendors if available — verified list rarely changes
                let vendors = cache.vendors;
                if (!vendors) {
                    const vendorsResponse = await SearchAPI.getVerifiedVendors().catch((err) => {
                        console.error("Vendors fetch failed:", {
                            status:  err.status,
                            message: err.message,
                            data:    err.data,
                        });
                        return null;
                    });

                    vendors = vendorsResponse?.success && vendorsResponse?.data
                        ? vendorsResponse.data
                        : Array.isArray(vendorsResponse) ? vendorsResponse : [];

                    cache.vendors = vendors;
                }

                const productList = productsResponse?.success && productsResponse?.data
                    ? productsResponse.data
                    : Array.isArray(productsResponse) ? productsResponse : [];

                // O(1) vendor lookups
                const vendorMap = vendors.reduce((map, vendor) => {
                    map[vendor.publicUserId] = vendor;
                    return map;
                }, {});

                const transformed = productList
                    .slice(0, MAX_POPULAR)
                    .map((product) => {
                        const vendor = vendorMap[product.vendorPublicId] || {};
                        return {
                            publicProductId:        product.publicProductId,
                            vendorPublicId:         product.vendorPublicId,
                            name:                   product.name,
                            imageUrl:               product.imageUrl || null,
                            price:                  product.price,
                            averageRating:          product.averageRating          || 0,
                            reviewCount:            product.reviewCount            || 0,
                            totalOrders:            product.totalOrders            || 0,
                            categoryName:           product.categoryName           || null,
                            preparationTimeMinutes: vendor.estimatedDeliveryMinutes
                                || product.preparationTimeMinutes
                                || 30,
                            restaurantName:         product.restaurantName || vendor.restaurantName,
                            location:               vendor.address?.city && vendor.address?.province
                                ? `${vendor.address.city}, ${vendor.address.province}`
                                : product.vendorCity && product.vendorProvince
                                    ? `${product.vendorCity}, ${product.vendorProvince}`
                                    : product.vendorCity || "",
                            isOpenNow:           computeIsOpenFromSchedule(vendor.weeklySchedule ?? vendor.operatingHours) ?? computeIsOpenNow(vendor.todayHoursFormatted) ?? vendor.isOpenNow ?? null,
                            todayHoursFormatted: computeTodayHoursFromSchedule(vendor.weeklySchedule ?? vendor.operatingHours) ?? vendor.todayHoursFormatted ?? null,
                            deliveryFee:         vendor.deliveryFee         || 2.99,
                            offersPickup:        vendor.offersPickup        ?? false,
                            isVegetarian:        product.isVegetarian       || false,
                            isVegan:             product.isVegan            || false,
                            isGlutenFree:        product.isGlutenFree       || false,
                            isSpicy:             product.isSpicy            || false,
                        };
                    });

                // Open first → unknown (null) → closed last
                const openRank = (v) => v.isOpenNow === true ? 0 : v.isOpenNow === false ? 2 : 1;
                const sorted = [...transformed].sort((a, b) => openRank(a) - openRank(b));

                // Render cards immediately
                setPopularStores(sorted);

                // Enrich with full product details (dietary flags) in the background.
                if (sorted.length > 0) {
                    Promise.allSettled(
                        sorted.map(p => SearchAPI.getProductById(p.publicProductId))
                    ).then(results => {
                        const enriched = sorted.map((product, i) => {
                            const result = results[i];
                            if (result.status === 'fulfilled' && result.value?.success && result.value?.data) {
                                const d = result.value.data;
                                return {
                                    ...product,
                                    isVegetarian: d.isVegetarian ?? product.isVegetarian ?? false,
                                    isVegan:      d.isVegan      ?? product.isVegan      ?? false,
                                    isGlutenFree: d.isGlutenFree ?? product.isGlutenFree ?? false,
                                    isSpicy:      d.isSpicy      ?? product.isSpicy      ?? false,
                                };
                            }
                            return product;
                        });
                        cache.stores = enriched;
                        cache.city   = city;
                        setPopularStores(enriched);
                    });
                } else {
                    cache.stores = sorted;
                    cache.city   = city;
                }

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
                console.error("PopularStores fetch error:", {
                    status:  err.status,
                    message: err.message,
                    data:    err.data,
                });
                setError(true);
                setPopularStores([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchPopular();
        // Use primitive coordinate values to avoid re-fetching on object reference changes
    }, [city, coordinates?.lat, coordinates?.lng, retryCount]);

    const handleRetry = () => {
        cache.stores   = null;
        cache.promoMap = null;
        cache.city     = null;
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

                    <h2 className="text-5xl font-black text-gray-900 mb-6 leading-tight">
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
                                key={store.publicProductId || `product-${index}`}
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
                            No restaurants found{city ? ` in ${city}` : " near you"}
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