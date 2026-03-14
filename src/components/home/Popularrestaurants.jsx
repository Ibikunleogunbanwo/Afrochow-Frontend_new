"use client";
import React, { useEffect, useState } from 'react';
import StoreCard from '@/components/home/cards/storeCard';
import StoreCardSkeleton from '@/components/home/cards/StoreCardSkeleton';
import { Star } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';
import { SearchAPI } from '@/lib/api/search.api';

const PopularRestaurants = () => {
    const [popularStores, setPopularStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const { city } = useLocation();

    useEffect(() => {
        const fetchMonthlyPopular = async () => {
            try {
                setLoading(true);
                const response = await SearchAPI.getMonthlyPopularProducts(city);

                if (response?.success && response?.data) {
                    const transformedProducts = response.data.map(product => ({
                        storeId: product.publicProductId,
                        name: product.name,
                        rating: product.averageRating || 0,
                        reviewCount: product.reviewCount || 0,
                        categories: product.categoryName ? [product.categoryName] : ['African Cuisine'],
                        deliveryTime: product.preparationTimeMinutes || 30,
                        location: product.vendorCity && product.vendorProvince
                            ? `${product.vendorCity}, ${product.vendorProvince}`
                            : product.vendorCity || '',
                        deliveryFee: 2.99,
                        popularItems: [{
                            name: product.name,
                            imageUrl: product.imageUrl || '/image/placeholder.jpg',
                            price: product.price,
                            description: product.description
                        }],
                        available: product.available !== false,
                        openingHour: 9,
                        closingHour: 21,
                        restaurantName: product.restaurantName,
                        publicProductId: product.publicProductId,
                        vendorPublicId: product.vendorPublicId
                    }));

                    setPopularStores(transformedProducts);
                } else if (Array.isArray(response)) {
                    const transformedProducts = response.map(product => ({
                        storeId: product.publicProductId,
                        name: product.name,
                        rating: product.averageRating || 0,
                        reviewCount: product.reviewCount || 0,
                        categories: product.categoryName ? [product.categoryName] : ['African Cuisine'],
                        deliveryTime: product.preparationTimeMinutes || 30,
                        location: product.vendorCity && product.vendorProvince
                            ? `${product.vendorCity}, ${product.vendorProvince}`
                            : product.vendorCity || '',
                        deliveryFee: 2.99,
                        popularItems: [{
                            name: product.name,
                            imageUrl: product.imageUrl || '/image/placeholder.jpg',
                            price: product.price,
                            description: product.description
                        }],
                        available: product.available !== false,
                        openingHour: 9,
                        closingHour: 21,
                        restaurantName: product.restaurantName,
                        publicProductId: product.publicProductId,
                        vendorPublicId: product.vendorPublicId
                    }));

                    setPopularStores(transformedProducts);
                }
            } catch (error) {
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
                        These restaurants are trending among our food lovers. Order now and taste why they&#39;re so popular!
                    </p>
                </div>

                {/* 4-Column Grid (3 rows of 4 cards) */}
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
                                    animationFillMode: 'backwards'
                                }}
                            >
                                <StoreCard store={store} priority={index < 4} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg font-medium">No popular products available in {city} this month</p>
                        <p className="text-sm text-gray-400 mt-2">Check back soon for trending dishes</p>
                    </div>
                )}

            </div>
        </section>
    );
};

export default PopularRestaurants;