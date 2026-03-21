"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StoreCard from '@/components/home/cards/storeCard';
import StoreCardSkeleton from '@/components/home/cards/StoreCardSkeleton';
import LocationSelector from '@/components/LocationSelector';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { SearchAPI } from '@/lib/api/search.api';
import { useLocation } from '@/contexts/LocationContext';

// ── Module-level cache keyed by city — survives component remounts within
// the same session. Each unique city gets its own cached result so switching
// cities still fetches fresh data, but going back to a previously viewed
// city renders instantly and allows the browser to restore scroll position.
const storesCache = {};

const getCacheKey = (city) => city ? city.toLowerCase().trim() : '__default__';

const TopStores = () => {
    const { city } = useLocation();
    const cacheKey = getCacheKey(city);

    const [stores, setStores] = useState(storesCache[cacheKey] || []);
    const [loading, setLoading] = useState(!storesCache[cacheKey]);

    useEffect(() => {
        const key = getCacheKey(city);

        // Cache hit — data already loaded for this city, skip fetch.
        if (storesCache[key]) {
            setStores(storesCache[key]);
            setLoading(false);
            return;
        }

        const fetchTopStores = async () => {
            try {
                setLoading(true);

                // Fetch vendors and verified list in parallel.
                // Use city-specific endpoint when a city is selected — avoids
                // fetching all vendors and filtering in-memory on the frontend.
                const [vendorsResponse, verifiedResponse] = await Promise.all([
                    city
                        ? SearchAPI.getVendorsByCity(city)
                        : SearchAPI.getTopRatedVendors(),
                    SearchAPI.getVerifiedVendors(),
                ]);

                const vendors = Array.isArray(vendorsResponse)
                    ? vendorsResponse
                    : vendorsResponse?.success && vendorsResponse?.data
                        ? vendorsResponse.data
                        : [];

                const verified = Array.isArray(verifiedResponse)
                    ? verifiedResponse
                    : verifiedResponse?.success && verifiedResponse?.data
                        ? verifiedResponse.data
                        : [];

                // Build a Set of verified vendor IDs for O(1) membership checks.
                const verifiedIds = new Set(verified.map(v => v.publicUserId));

                // Drop any vendor not present in the verified set.
                const transformedVendors = vendors
                    .filter(vendor => verifiedIds.has(vendor.publicUserId))
                    .map(vendor => ({
                        storeId: vendor.publicUserId,
                        vendorPublicId: vendor.publicUserId,
                        name: vendor.restaurantName,
                        restaurantName: vendor.restaurantName,
                        rating: vendor.averageRating || 0,
                        reviewCount: vendor.reviewCount || 0,
                        categories: vendor.cuisineType ? [vendor.cuisineType] : ['African Cuisine'],
                        deliveryTime: vendor.estimatedDeliveryMinutes || 30,
                        deliveryFee: vendor.deliveryFee || 0,
                        location: vendor.address?.city && vendor.address?.province
                            ? `${vendor.address.city}, ${vendor.address.province}`
                            : vendor.address?.city || '',
                        popularItems: vendor.bannerUrl
                            ? [{ name: vendor.restaurantName, imageUrl: vendor.bannerUrl }]
                            : vendor.logoUrl
                                ? [{ name: vendor.restaurantName, imageUrl: vendor.logoUrl }]
                                : [],
                        isOpenNow: vendor.isOpenNow,
                        todayHoursFormatted: vendor.todayHoursFormatted,
                    }));

                // Open first, closed at the bottom.
                const sortedVendors = transformedVendors.sort((a, b) => {
                    if (a.isOpenNow === b.isOpenNow) return 0;
                    return a.isOpenNow ? -1 : 1;
                });

                storesCache[key] = sortedVendors;
                setStores(sortedVendors);
            } catch (error) {
                console.error('Error fetching top stores:', error);
                setStores([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchTopStores();
    }, [city]);

    return (
        <section className="py-16 bg-linear-to-b from-white to-orange-50/30">
            <div className="container px-4 mx-auto max-w-7xl">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
                    <div className="flex-1">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 mb-4 bg-linear-to-r from-orange-100 to-red-100 rounded-full">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-semibold text-orange-800">Top Rated</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
                            Popular Stores
                            <span className="block text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">
                                {city ? `in ${city}` : 'Near You'}
                            </span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl">
                            Discover highly rated African stores in your area
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <LocationSelector />
                        <Link
                            href="/allstore"
                            className="inline-flex items-center space-x-2 px-8 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <span>View All</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Cards Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(12)].map((_, index) => (
                            <StoreCardSkeleton key={`skeleton-${index}`} />
                        ))}
                    </div>
                ) : stores.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {stores.map((store, index) => (
                            <div
                                key={store.storeId || `store-${index}`}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <StoreCard store={store} priority={index < 3} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg font-medium">
                            No stores available {city ? `in ${city}` : 'in your area'} at the moment
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Try selecting a different city from the dropdown above
                        </p>
                    </div>
                )}

                {/* Bottom CTA */}
                {stores.length > 0 && (
                    <div className="mt-12 text-center">
                        <p className="text-gray-600 mb-4">
                            Want to see more amazing stores?
                        </p>
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