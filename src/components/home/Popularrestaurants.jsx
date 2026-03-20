"use client";
import React, { useEffect, useState } from 'react';
import StoreCard from '@/components/home/cards/storeCard';
import StoreCardSkeleton from '@/components/home/cards/StoreCardSkeleton';
import { Star } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';
import { SearchAPI } from '@/lib/api/search.api';

const PopularStores = () => {
    const [popularStores, setPopularStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const { city } = useLocation();

    useEffect(() => {
        const fetchMonthlyPopular = async () => {
            try {
                setLoading(true);

                const [productsResponse, vendorsResponse] = await Promise.all([
                    // Pass undefined instead of null when city is not set —
                    // avoids sending an explicit null to the backend query param.
                    SearchAPI.getMonthlyPopularProducts(city || undefined),
                    SearchAPI.getVerifiedVendors(),
                ]);

                const productList = productsResponse?.success && productsResponse?.data
                    ? productsResponse.data
                    : Array.isArray(productsResponse) ? productsResponse : [];

                const vendors = Array.isArray(vendorsResponse) ? vendorsResponse : [];

                // build vendor lookup map
                const vendorMap = vendors.reduce((map, vendor) => {
                    map[vendor.publicUserId] = vendor;
                    return map;
                }, {});

                // only include products whose vendor exists in the verified vendor map,
                // then merge product data with vendor data
                const transformedProducts = productList
                    .filter(product => vendorMap[product.vendorPublicId])
                    .map(product => {
                        const vendor = vendorMap[product.vendorPublicId];

                        return {
                            storeId: product.publicProductId,
                            publicProductId: product.publicProductId,
                            vendorPublicId: product.vendorPublicId,
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
                            restaurantName: product.restaurantName || vendor.restaurantName,
                            deliveryTime: vendor.estimatedDeliveryMinutes || product.preparationTimeMinutes || 30,
                            deliveryFee: vendor.deliveryFee || 2.99,
                            location: vendor.address?.city && vendor.address?.province
                                ? `${vendor.address.city}, ${vendor.address.province}`
                                : product.vendorCity && product.vendorProvince
                                    ? `${product.vendorCity}, ${product.vendorProvince}`
                                    : product.vendorCity || '',
                            isOpenNow: vendor.isOpenNow ?? null,
                            todayHoursFormatted: vendor.todayHoursFormatted ?? null,
                        };
                    });

                // open first, closed at the bottom
                const sortedProducts = transformedProducts.sort((a, b) => {
                    if (a.isOpenNow === b.isOpenNow) return 0;
                    return a.isOpenNow ? -1 : 1;
                });

                setPopularStores(sortedProducts);
            } catch (error) {
                console.error('Error fetching popular stores:', error);
                setPopularStores([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchMonthlyPopular();
    }, [city]);

    return (
        <section className="py-20 bg-white">
            <div className="container px-4 mx-auto max-w-7xl">

                {/* Centered Header */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 mb-6 bg-linear-to-r from-orange-100 to-red-100 rounded-full">
                        <Star className="w-4 h-4 text-orange-600 fill-orange-600" />
                        <span className="text-sm font-semibold text-orange-800">Customer Favorites</span>
                    </div>

                    <h2 className="text-5xl font-black text-gray-900 mb-6 leading-tight">
                        Most Popular
                        <span className="block text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">
                            This Month
                        </span>
                    </h2>

                    <p className="text-xl text-gray-600">
                        From home kitchens to African grocery stores — these are the most ordered spots
                        {city ? ` in ${city}` : ' in your area'} this month. Fresh, authentic, and loved by thousands.
                    </p>
                </div>

                {/* Cards Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(12)].map((_, index) => (
                            <StoreCardSkeleton key={`skeleton-${index}`} />
                        ))}
                    </div>
                ) : popularStores.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {popularStores.map((store, index) => (
                            <div
                                key={store.publicProductId || `product-${index}`}
                                className="animate-scale-in"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animationFillMode: 'backwards',
                                }}
                            >
                                <StoreCard store={store} priority={index < 4} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg font-medium">
                            No popular stores available {city ? `in ${city}` : 'in your area'} this month
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Check back soon for trending stores
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PopularStores;