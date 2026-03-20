"use client";
import React, { useEffect, useState } from 'react';
import StoreCard from '@/components/home/cards/storeCard';
import StoreCardSkeleton from '@/components/home/cards/StoreCardSkeleton';
import { SearchAPI } from '@/lib/api/search.api';

const FeaturedRestaurants = () => {
    const [featuredStores, setFeaturedStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedData = async () => {
            try {
                setLoading(true);

                // fetch both in parallel
                const [productsResponse, vendorsResponse] = await Promise.all([
                    SearchAPI.getFeaturedProducts(),
                    SearchAPI.getVerifiedVendors(),
                ]);

                const products = productsResponse?.success && productsResponse?.data
                    ? productsResponse.data
                    : Array.isArray(productsResponse) ? productsResponse : [];

                const vendors = Array.isArray(vendorsResponse) ? vendorsResponse : [];

                // build a vendor lookup map by publicUserId for O(1) access
                const vendorMap = vendors.reduce((map, vendor) => {
                    map[vendor.publicUserId] = vendor;
                    return map;
                }, {});

                // only include products whose vendor exists in the verified vendor map,
                // then merge product data with vendor data
                const transformedStores = products
                    .filter(product => vendorMap[product.vendorPublicId])
                    .map(product => {
                        const vendor = vendorMap[product.vendorPublicId];

                        return {
                            // ids
                            storeId: product.publicProductId,
                            vendorPublicId: product.vendorPublicId,
                            publicProductId: product.publicProductId,

                            // product details
                            name: product.name,
                            rating: product.averageRating || 0,
                            reviewCount: product.reviewCount || 0,
                            categories: product.categoryName
                                ? [product.categoryName]
                                : ['African Cuisine'],
                            popularItems: [{
                                name: product.name,
                                imageUrl: product.imageUrl || '/image/placeholder.jpg',
                                price: product.price,
                                description: product.description,
                            }],

                            // vendor details
                            restaurantName: product.restaurantName || vendor.restaurantName,
                            deliveryTime: vendor.estimatedDeliveryMinutes || product.preparationTimeMinutes || 30,
                            deliveryFee: vendor.deliveryFee || 2.99,
                            location: vendor.address?.city && vendor.address?.province
                                ? `${vendor.address.city}, ${vendor.address.province}`
                                : product.vendorCity && product.vendorProvince
                                    ? `${product.vendorCity}, ${product.vendorProvince}`
                                    : product.vendorCity || '',

                            // open status — from vendor (timezone-aware)
                            isOpenNow: vendor.isOpenNow ?? null,
                            todayHoursFormatted: vendor.todayHoursFormatted ?? null,
                        };
                    });

                // open first, closed at the bottom
                const sortedStores = transformedStores.sort((a, b) => {
                    if (a.isOpenNow === b.isOpenNow) return 0;
                    return a.isOpenNow ? -1 : 1;
                });

                setFeaturedStores(sortedStores);
            } catch (error) {
                console.error('Error fetching featured data:', error);
                setFeaturedStores([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchFeaturedData();
    }, []);

    return (
        <section className="py-16 bg-white">
            <div className="container px-4 mx-auto max-w-7xl">

                {/* Section Header */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center px-4 py-2 mb-4 bg-orange-100 rounded-full">
                        <span className="text-sm font-semibold text-orange-800">Popular Dishes</span>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 mb-4">
                        Featured Products
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover the most popular African dishes loved by our community
                    </p>
                </div>

                {/* Cards Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(8)].map((_, index) => (
                            <StoreCardSkeleton key={`skeleton-${index}`} />
                        ))}
                    </div>
                ) : featuredStores.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {featuredStores.map((store, index) => (
                            <div
                                key={store.publicProductId || `product-${index}`}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <StoreCard store={store} priority={index < 4} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg font-medium">
                            No featured products available at the moment
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedRestaurants;