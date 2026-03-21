"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Flame, Clock, MapPin, Loader2 } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { SearchAPI } from '@/lib/api/search.api';
import { SignInModal } from '@/components/signin/SignInModal';
import { SignUpModal } from '@/components/register/SignUpModal';

// ── Module-level cache ────────────────────────────────────────────────────────
const cache = {
    stores:  null,
    vendors: null,
    city:    null,
    scrollY: 0,
};

// ── Card ──────────────────────────────────────────────────────────────────────
const PopularStoreCard = ({ product, priority = false, onUnauthenticated }) => {
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
        isOpenNow,
        todayHoursFormatted,
        location,
    } = product;

    const { isAuthenticated } = useAuth();
    const router = useRouter();

    const handleClick = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            onUnauthenticated();
        } else {
            router.push(`/restaurant/${vendorPublicId}`);
        }
    };

    return (
        <div onClick={handleClick} className="group block h-full cursor-pointer">
            <div className="h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

                {/* Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={name}
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

                    {/* Category pill */}
                    {categoryName && (
                        <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 text-[11px] font-bold bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-sm">
                                {categoryName}
                            </span>
                        </div>
                    )}

                    {/* Order count badge */}
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

                    {/* Open/closed badge */}
                    {isOpenNow !== null && (
                        <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-sm shadow-sm ${
                            isOpenNow
                                ? 'bg-green-500/90 text-white'
                                : 'bg-red-500/90 text-white'
                        }`}>
                            {isOpenNow ? '🟢 Open Now' : '🔴 Closed'}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">

                    {/* Product name */}
                    <h3 className="text-sm font-bold text-gray-900 truncate mb-0.5">
                        {name}
                    </h3>

                    {/* Restaurant name */}
                    {restaurantName && (
                        <p className="text-xs text-orange-500 font-medium truncate mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {restaurantName}
                        </p>
                    )}

                    {/* Location */}
                    {location && (
                        <p className="text-xs text-gray-400 truncate mb-3">
                            {location}
                        </p>
                    )}

                    {/* Rating + prep time + price */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">

                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                                <span className="text-xs font-bold text-gray-800">
                                    {averageRating > 0 ? averageRating.toFixed(1) : '0'}
                                </span>
                                {reviewCount > 0 && (
                                    <span className="text-xs text-gray-400">
                                        ({reviewCount >= 1000
                                        ? `${(reviewCount / 1000).toFixed(1)}k`
                                        : reviewCount})
                                    </span>
                                )}
                            </div>

                            {/* Prep time */}
                            {preparationTimeMinutes > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {preparationTimeMinutes} min
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        {price != null && (
                            <span className="text-sm font-bold text-gray-900">
                                ${Number(price).toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* Today's hours */}
                    {todayHoursFormatted && (
                        <p className="text-[11px] text-gray-400 mt-2 truncate">
                            {todayHoursFormatted}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const PopularStoreSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
        <div className="w-full aspect-[4/3] bg-gray-100" />
        <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-full mt-3" />
        </div>
    </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const PopularStores = () => {
    const [popularStores, setPopularStores] = useState(cache.stores || []);
    const [loading, setLoading]             = useState(!cache.stores);
    const [showSignIn, setShowSignIn]       = useState(false);
    const [showSignUp, setShowSignUp]       = useState(false);

    const {
        city,
        isDetecting,
        locationSource,
        requestPreciseLocation,
    } = useLocation();

    // Restore scroll on mount
    useEffect(() => {
        if (cache.stores && cache.scrollY) {
            window.scrollTo({ top: cache.scrollY, behavior: 'instant' });
        }
    }, []);

    // Save scroll on unmount
    useEffect(() => {
        return () => { cache.scrollY = window.scrollY; };
    }, []);

    useEffect(() => {
        const isCacheValid = cache.stores && cache.city === city;
        if (isCacheValid) {
            setPopularStores(cache.stores);
            setLoading(false);
            return;
        }

        const fetchPopular = async () => {
            try {
                setLoading(true);

                let vendors = cache.vendors;

                const productsResponse = await (city
                        ? SearchAPI.getProductsNearMe(city)
                        : SearchAPI.getMonthlyPopularProducts()
                );

                if (!vendors) {
                    const vendorsResponse = await SearchAPI.getVerifiedVendors();
                    vendors = vendorsResponse?.success && vendorsResponse?.data
                        ? vendorsResponse.data
                        : Array.isArray(vendorsResponse) ? vendorsResponse : [];
                    cache.vendors = vendors;
                }

                const productList = productsResponse?.success && productsResponse?.data
                    ? productsResponse.data
                    : Array.isArray(productsResponse) ? productsResponse : [];

                const vendorMap = vendors.reduce((map, vendor) => {
                    map[vendor.publicUserId] = vendor;
                    return map;
                }, {});

                const transformed = productList
                    .filter(product => vendorMap[product.vendorPublicId])
                    .slice(0, 8)
                    .map(product => {
                        const vendor = vendorMap[product.vendorPublicId];
                        return {
                            publicProductId:        product.publicProductId,
                            vendorPublicId:         product.vendorPublicId,
                            name:                   product.name,
                            imageUrl:               product.imageUrl || null,
                            price:                  product.price,
                            averageRating:          product.averageRating || 0,
                            reviewCount:            product.reviewCount   || 0,
                            totalOrders:            product.totalOrders   || 0,
                            categoryName:           product.categoryName  || null,
                            preparationTimeMinutes: vendor.estimatedDeliveryMinutes
                                || product.preparationTimeMinutes
                                || 30,
                            restaurantName:         product.restaurantName || vendor.restaurantName,
                            location:               vendor.address?.city && vendor.address?.province
                                ? `${vendor.address.city}, ${vendor.address.province}`
                                : product.vendorCity && product.vendorProvince
                                    ? `${product.vendorCity}, ${product.vendorProvince}`
                                    : product.vendorCity || '',
                            isOpenNow:              vendor.isOpenNow          ?? null,
                            todayHoursFormatted:    vendor.todayHoursFormatted ?? null,
                            deliveryFee:            vendor.deliveryFee         || 2.99,
                        };
                    });

                const sorted = [...transformed].sort((a, b) => {
                    if (a.isOpenNow === b.isOpenNow) return 0;
                    return a.isOpenNow ? -1 : 1;
                });

                cache.stores = sorted;
                cache.city   = city;
                setPopularStores(sorted);
            } catch (error) {
                console.error('Error fetching popular stores:', error);
                setPopularStores([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchPopular();
    }, [city]);

    const locationLabel = locationSource === 'gps'
        ? `${city} (GPS)`
        : city || null;

    return (
        <>
            <section className="py-20 bg-white">
                <div className="container px-4 mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 mb-6 bg-linear-to-r from-orange-100 to-red-100 rounded-full">
                            <Star className="w-4 h-4 text-orange-600 fill-orange-600" />
                            <span className="text-sm font-semibold text-orange-800">
                                Customer Favorites
                            </span>
                        </div>

                        <h2 className="text-5xl font-black text-gray-900 mb-6 leading-tight">
                            Popular Home Kitchens and African Stores
                            <span className="block text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">
                                Near You
                            </span>
                        </h2>

                        {/* Location row */}
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            {locationLabel && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {locationLabel}
                                </span>
                            )}

                            <button
                                onClick={requestPreciseLocation}
                                disabled={isDetecting}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDetecting
                                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting...</>
                                    : <><MapPin className="w-3.5 h-3.5" /> Use my exact location</>
                                }
                            </button>
                        </div>
                    </div>

                    {/* Cards */}
                    {loading ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {[...Array(8)].map((_, i) => (
                                <PopularStoreSkeleton key={`skeleton-${i}`} />
                            ))}
                        </div>
                    ) : popularStores.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {popularStores.map((store, index) => (
                                <PopularStoreCard
                                    key={store.publicProductId || `product-${index}`}
                                    product={store}
                                    priority={index < 4}
                                    onUnauthenticated={() => setShowSignIn(true)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg font-semibold mb-1">
                                No restaurants found{city ? ` in ${city}` : ' near you'}
                            </p>
                            <p className="text-gray-400 text-sm mb-6">
                                Try a different city or enable location access for better results
                            </p>
                            <button
                                onClick={requestPreciseLocation}
                                disabled={isDetecting}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
                            >
                                {isDetecting
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting...</>
                                    : <><MapPin className="w-4 h-4" /> Detect my location</>
                                }
                            </button>
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