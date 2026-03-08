"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StoreCard from '@/components/home/cards/storeCard';
import StoreCardSkeleton from '@/components/home/cards/StoreCardSkeleton';
import LocationSelector from '@/components/LocationSelector';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { AuthAPI } from '@/lib/api/auth';
import { useLocation } from '@/contexts/LocationContext';


const TopRestaurants = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { city } = useLocation();

    useEffect(() => {
        void fetchNearbyProducts(city);
    }, [city]);

    const fetchNearbyProducts = async (cityParam) => {
        try {
            setLoading(true);
            const response = await AuthAPI.getProductsNearMe(cityParam);

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

                setProducts(transformedProducts);
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

                setProducts(transformedProducts);
            }
        } catch (error) {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-16 bg-linear-to-b from-white to-orange-50/30">
            <div className="container px-4 mx-auto max-w-7xl">

                {/* Section Header with CTA */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
                    <div className="flex-1">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 mb-4 bg-linear-to-r from-orange-100 to-red-100 rounded-full">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-semibold text-orange-800">Top Rated</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
                            Best Restaurants
                            <span className="block text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">
                                in {city}
                            </span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl">
                            Discover top-rated dishes from the best restaurants in your area
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <LocationSelector />
                        <Link
                            href="/restaurants"
                            className="inline-flex items-center space-x-2 px-8 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <span>View All</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Cards Grid - Up to 12 Cards */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(12)].map((_, index) => (
                            <StoreCardSkeleton key={`skeleton-${index}`} />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product, index) => (
                            <div
                                key={product.publicProductId || `product-${index}`}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <StoreCard store={product} priority={index < 3} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg font-medium">No restaurants available in {city} at the moment</p>
                        <p className="text-sm text-gray-400 mt-2">Try selecting a different city from the dropdown above</p>
                    </div>
                )}

                {/* Bottom CTA */}
                {products.length > 0 && (
                    <div className="mt-12 text-center">
                        <p className="text-gray-600 mb-4">
                            Want to see more amazing kitchens?
                        </p>
                        <Link
                            href="/restaurants"
                            className="inline-flex items-center space-x-2 px-8 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <span>Explore All Restaurants</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}

            </div>
        </section>
    );
};

export default TopRestaurants;