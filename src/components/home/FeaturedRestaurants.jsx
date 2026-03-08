"use client";
import React, {useEffect, useState} from 'react';
import StoreCard from '@/components/home/cards/storeCard';
import StoreCardSkeleton from '@/components/home/cards/StoreCardSkeleton';
import {AuthAPI} from '@/lib/api/auth';

const FeaturedRestaurants = () => {
    const [featuredStores, setFeaturedStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);
                const response = await AuthAPI.getFeaturedProducts();

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

                    setFeaturedStores(transformedProducts);
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

                    setFeaturedStores(transformedProducts);
                }
            } catch (error) {
                setFeaturedStores([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchFeaturedProducts();
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

                {/* Cards Grid - Up to 8 Cards */}
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
                        <p className="text-gray-500 text-lg font-medium">No featured products available at the moment</p>
                    </div>
                )}

            </div>
        </section>
    );
};

export default FeaturedRestaurants;