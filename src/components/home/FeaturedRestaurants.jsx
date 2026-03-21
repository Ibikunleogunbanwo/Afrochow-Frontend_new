"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SearchAPI } from "@/lib/api/search.api";
import { SignInModal } from "@/components/signin/SignInModal";
import { SignUpModal } from "@/components/register/SignUpModal";
import FeaturedProductCard from "@/components/home/cards/FeaturedProductCard";
import FeaturedProductSkeleton from "@/components/home/cards/FeaturedProductSkeleton";

// Module-level cache — persists across re-renders without hitting the API again
let cachedFeaturedProducts = [];

const FeaturedRestaurants = () => {
    const { isAuthenticated } = useAuth();

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

                const products =
                    response?.success && response?.data
                        ? response.data
                        : Array.isArray(response)
                            ? response
                            : [];

                cachedFeaturedProducts = products;
                setFeaturedProducts(products);
            } catch (error) {
                console.error("Error fetching featured products:", error);
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
                                        isAuthenticated={isAuthenticated}
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