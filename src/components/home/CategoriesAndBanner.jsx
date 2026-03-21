"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SearchAPI } from "@/lib/api/search.api";
import { CardStack } from "@/components/ui/card-stack";
import CategoryStackCard from "@/components/home/cards/CategoryStackCard";

// Module-level cache — persists across mounts without re-hitting the API
let cachedStackItems = [];

const MOBILE_BREAKPOINT = 640;

const CategoriesAndBanner = () => {
    const [stackItems, setStackItems]           = useState(cachedStackItems);
    const [loading, setLoading]                 = useState(cachedStackItems.length === 0);
    const [error, setError]                     = useState(false);
    const [isMobile, setIsMobile]               = useState(false);


    useEffect(() => {
        let timeout;
        const check = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
            }, 150);
        };
        check();
        window.addEventListener("resize", check);
        return () => {
            window.removeEventListener("resize", check);
            clearTimeout(timeout);
        };
    }, []);

    const loadCategories = useCallback(async () => {
        // Skip fetch if we already have cached data
        if (cachedStackItems.length > 0) {
            setStackItems(cachedStackItems);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(false);

            const response = await SearchAPI.getAllCategories();

            if (response?.success && Array.isArray(response?.data)) {
                const items = response.data.map((category, index) => ({
                    id: category.categoryId,
                    title: category.name,
                    description: category.description || "Explore our delicious selection",
                    iconUrl: category.iconUrl || null,
                    activeProductCount: category.activeProductCount || 0,
                    path: `/restaurants?categoryId=${category.categoryId}`,
                    colorIndex: index,
                }));

                cachedStackItems = items;
                setStackItems(items);
            } else {
                setStackItems([]);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError(true);
            setStackItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCategories();
    }, [loadCategories]);

    const cardWidth  = isMobile ? 300 : 480;
    const cardHeight = isMobile ? 260 : 320;

    return (
        <div className="pt-10 pb-8 md:pt-14 md:pb-10 bg-linear-to-b from-white via-orange-50/40 to-white relative overflow-hidden">

            {/* Decorative background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
            </div>

            <div className="container px-4 mx-auto max-w-7xl relative z-10">

                {/* Section Header */}
                <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight">
                        Everything African{" "}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">
                            All in One Place
                        </span>
                    </h2>
                    <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                        From sizzling home kitchens that promise amazing African dishes to African
                        stores find exactly what you&apos;re craving
                    </p>
                </div>

                {/* Category Card Stack */}
                {loading ? (
                    <div
                        className="w-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center"
                        style={{ height: cardHeight + 80 }}
                    >
                        <p className="text-gray-400 text-sm">Loading categories...</p>
                    </div>
                ) : error ? (
                    <div
                        className="w-full bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4"
                        style={{ height: cardHeight + 80 }}
                    >
                        <p className="text-gray-400 text-sm">Failed to load categories.</p>
                        <button
                            onClick={loadCategories}
                            className="px-5 py-2 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : stackItems.length > 0 ? (
                    <CardStack
                        items={stackItems}
                        cardWidth={cardWidth}
                        cardHeight={cardHeight}
                        autoAdvance
                        intervalMs={3000}
                        pauseOnHover
                        showDots
                        loop
                        overlap={isMobile ? 0.4 : 0.5}
                        spreadDeg={isMobile ? 32 : 44}
                        maxVisible={isMobile ? 5 : 7}
                        depthPx={isMobile ? 80 : 140}
                        activeLiftPx={isMobile ? 14 : 22}
                        renderCard={(item) => <CategoryStackCard item={item} />}
                    />
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400">No categories available</p>
                    </div>
                )}

                {/* Browse all CTA */}
                <div className="text-center mt-4">
                    <Link
                        href="/restaurants"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        <span>Browse All Categories</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CategoriesAndBanner;