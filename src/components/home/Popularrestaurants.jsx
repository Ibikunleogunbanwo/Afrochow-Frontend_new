"use client";

import React, { useEffect, useState } from "react";
import { Star, MapPin, Loader2 } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import { useAuth } from "@/hooks/useAuth";
import { SearchAPI } from "@/lib/api/search.api";
import { SignInModal } from "@/components/signin/SignInModal";
import { SignUpModal } from "@/components/register/SignUpModal";
import PopularStoreCard from "@/components/home/cards/PopularStoreCard";
import PopularStoreSkeleton from "@/components/home/cards/PopularStoreSkeleton";

const MAX_POPULAR = 8;
const SKELETON_COUNT = MAX_POPULAR;

// ── Module-level cache ────────────────────────────────────────────────────────
// `stores` and `city` are invalidated together when city changes.
// `vendors` persists across city changes — verified vendor list rarely changes.
// `scrollY` restores scroll position on remount.
const cache = {
    stores:  null,
    vendors: null,
    city:    null,
    scrollY: 0,
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
    const { isAuthenticated } = useAuth();
    const { city, isDetecting, locationSource, requestPreciseLocation, coordinates } = useLocation();

    const [popularStores, setPopularStores] = useState(cache.stores || []);
    const [loading, setLoading]             = useState(!cache.stores);
    const [error, setError]                 = useState(false);
    const [retryCount, setRetry]            = useState(0);
    const [showSignIn, setShowSignIn]       = useState(false);
    const [showSignUp, setShowSignUp]       = useState(false);

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
                    .filter((product) => vendorMap[product.vendorPublicId])
                    .slice(0, MAX_POPULAR)
                    .map((product) => {
                        const vendor = vendorMap[product.vendorPublicId];
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
                            isOpenNow:           vendor.isOpenNow           ?? null,
                            todayHoursFormatted: vendor.todayHoursFormatted ?? null,
                            deliveryFee:         vendor.deliveryFee         || 2.99,
                        };
                    });

                // Open stores first, closed at the bottom
                const sorted = [...transformed].sort((a, b) => {
                    if (a.isOpenNow === b.isOpenNow) return 0;
                    return a.isOpenNow ? -1 : 1;
                });

                cache.stores = sorted;
                cache.city   = city;
                setPopularStores(sorted);
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
        cache.stores = null;
        cache.city   = null;
        setError(false);
        setRetry((n) => n + 1);
    };

    const locationLabel = locationSource === "gps" ? `${city} (GPS)` : city || null;

    return (
        <>
            <section className="py-20 bg-white">
                <div className="container px-4 mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 mb-6 bg-gradient-to-r from-orange-100 to-red-100 rounded-full">
                            <Star className="w-4 h-4 text-orange-600 fill-orange-600" />
                            <span className="text-sm font-semibold text-orange-800">Customer Favorites</span>
                        </div>

                        <h2 className="text-5xl font-black text-gray-900 mb-6 leading-tight">
                            Popular Home Kitchens and African Stores
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
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
                                    onUnauthenticated={() => setShowSignIn(true)}
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

            <SignInModal
                isOpen={showSignIn}
                onClose={() => setShowSignIn(false)}
                onSignUpClick={() => {
                    setShowSignIn(false);
                    setShowSignUp(true);
                }}
            />

            <SignUpModal
                isOpen={showSignUp}
                onClose={() => setShowSignUp(false)}
                onSignInClick={() => {
                    setShowSignUp(false);
                    setShowSignIn(true);
                }}
            />
        </>
    );
};

export default PopularStores;