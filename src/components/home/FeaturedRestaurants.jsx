"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Flame, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SearchAPI } from '@/lib/api/search.api';
import { SignInModal } from '@/components/signin/SignInModal';
import { SignUpModal } from '@/components/register/SignUpModal';

// ── Module-level cache ────────────────────────────────────────────────────────
let cachedFeaturedProducts = [];

// ── Card ──────────────────────────────────────────────────────────────────────
const FeaturedProductCard = ({ product, priority = false, onUnauthenticated }) => {
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
                </div>

                {/* Content */}
                <div className="p-4">

                    {/* Product name */}
                    <h3 className="text-sm font-bold text-gray-900 truncate mb-0.5">
                        {name}
                    </h3>

                    {/* Restaurant name */}
                    {restaurantName && (
                        <p className="text-xs text-gray-400 truncate mb-3">
                            {restaurantName}
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
                </div>
            </div>
        </div>
    );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const FeaturedProductSkeleton = () => (
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
const FeaturedRestaurants = () => {
    const [featuredProducts, setFeaturedProducts] = useState(cachedFeaturedProducts);
    const [loading, setLoading]                   = useState(cachedFeaturedProducts.length === 0);
    const [showSignIn, setShowSignIn]             = useState(false);
    const [showSignUp, setShowSignUp]             = useState(false);

    useEffect(() => {
        if (cachedFeaturedProducts.length > 0) return;

        const fetchFeatured = async () => {
            try {
                setLoading(true);

                const response = await SearchAPI.getFeaturedProducts();

                const products = response?.success && response?.data
                    ? response.data
                    : Array.isArray(response) ? response : [];

                cachedFeaturedProducts = products;
                setFeaturedProducts(products);
            } catch (error) {
                console.error('Error fetching featured products:', error);
                setFeaturedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchFeatured();
    }, []);

    return (
        <>
            <section className="py-16 bg-white">
                <div className="container px-4 mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="mb-12 text-center">
                        <div className="inline-flex items-center justify-center px-4 py-2 mb-4 bg-orange-100 rounded-full">
                            <span className="text-sm font-semibold text-orange-800">
                                Popular Dishes
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                            Featured Products
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Discover the most popular African dishes loved by our community
                        </p>
                    </div>

                    {/* Cards */}
                    {loading ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {[...Array(8)].map((_, i) => (
                                <FeaturedProductSkeleton key={`skeleton-${i}`} />
                            ))}
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {featuredProducts.map((product, index) => (
                                    <FeaturedProductCard
                                        key={product.publicProductId || `product-${index}`}
                                        product={product}
                                        priority={index < 4}
                                        onUnauthenticated={() => setShowSignIn(true)}
                                    />
                                ))}
                            </div>

                            {/* View all CTA */}
                            <div className="mt-10 text-center">
                                <Link
                                    href="/restaurants"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
                                >
                                    <span>View All Products</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg font-medium">
                                No featured products available at the moment
                            </p>
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

export default FeaturedRestaurants;