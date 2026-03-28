"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SearchAPI } from "@/lib/api/search.api";
import { PromotionsAPI } from "@/lib/api";
import { useAuthModal } from "@/contexts/AuthModalContext";
import FeaturedProductCard from "@/components/home/cards/FeaturedProductCard";
import FeaturedProductSkeleton from "@/components/home/cards/FeaturedProductSkeleton";

// ── Module-level cache with 5-minute TTL ─────────────────────────────────────
// Featured products are global (no location/auth dependency) so a single shared
// object is correct. The TTL ensures a mid-session vendor spike is picked up on
// the next mount after the window expires.
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const featuredCache = {
    products: [],
    promoMap: {},
    cachedAt:  null,   // null = never fetched
};

const isCacheValid = () =>
    featuredCache.products.length > 0 &&
    featuredCache.cachedAt !== null &&
    Date.now() - featuredCache.cachedAt < CACHE_TTL_MS;

// ── Component ─────────────────────────────────────────────────────────────────
const FeaturedRestaurants = () => {
    const { isAuthenticated } = useAuth();
    const { openSignIn }      = useAuthModal();

    const valid = isCacheValid();

    const [featuredProducts, setFeaturedProducts] = useState(valid ? featuredCache.products : []);
    const [promoMap, setPromoMap]                 = useState(valid ? featuredCache.promoMap  : {});
    const [loading, setLoading]                   = useState(!valid);
    const [error, setError]                       = useState(false);
    const [retryCount, setRetry]                  = useState(0);

    useEffect(() => {
        if (isCacheValid()) {
            setFeaturedProducts(featuredCache.products);
            setPromoMap(featuredCache.promoMap);
            setLoading(false);
            return;
        }

        const fetchFeatured = async () => {
            try {
                setLoading(true);
                setError(false);

                const response = await SearchAPI.getFeaturedProducts();

                // The featured endpoint already returns the full ProductResponseDto —
                // dietary flags (isVegetarian, isVegan, isGlutenFree, isSpicy),
                // imageUrl, and all stats are included. No background enrichment needed.
                const products =
                    response?.success && response?.data
                        ? response.data
                        : Array.isArray(response) ? response : [];

                featuredCache.products = products;
                featuredCache.cachedAt = Date.now();
                setFeaturedProducts(products);

                // Promos fetched in background — never blocks product render
                PromotionsAPI.getActivePromotions()
                    .then(res => {
                        const list = res?.success && Array.isArray(res.data)
                            ? res.data
                            : Array.isArray(res) ? res : [];
                        const map = list.reduce((m, p) => {
                            if (p.vendorPublicId) {
                                if (!m[p.vendorPublicId]) m[p.vendorPublicId] = [];
                                m[p.vendorPublicId].push(p);
                            }
                            return m;
                        }, {});
                        featuredCache.promoMap = map;
                        setPromoMap(map);
                    })
                    .catch(() => { /* promos are optional */ });

            } catch (err) {
                console.error("Error fetching featured products:", err);
                setError(true);
                setFeaturedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchFeatured();
    }, [retryCount]);

    const handleRetry = () => {
        featuredCache.products = [];
        featuredCache.promoMap = {};
        featuredCache.cachedAt = null;
        setError(false);
        setRetry((n) => n + 1);
    };

    return (
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
                        {[...Array(16)].map((_, i) => (
                            <FeaturedProductSkeleton key={`skeleton-${i}`} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center gap-4">
                        <p className="text-gray-500 text-lg font-medium">
                            Failed to load featured products.
                        </p>
                        <button
                            onClick={handleRetry}
                            className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
                        >
                            Retry
                        </button>
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
                                    onUnauthenticated={openSignIn}
                                    promotions={promoMap[product.vendorPublicId] || []}
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
    );
};

export default FeaturedRestaurants;
