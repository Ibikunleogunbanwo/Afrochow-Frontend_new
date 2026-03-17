'use client';

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Flame,
    Gift,
    Sprout,
    Coffee,
    Cookie,
    Droplets,
    ShoppingBasket,
    Sparkles,
    ChefHat,
} from "lucide-react";
import { SearchAPI } from "@/lib/api/search.api";
import { CardStack } from "@/components/ui/card-stack";

const iconMap = {
    "African Kitchen": Flame,
    "African Soups": Droplets,
    "Cakes": Gift,
    "Farm Produce": Sprout,
    "Pastries": Coffee,
    "Baked Goods": Cookie,
    "Soups": Droplets,
    "Groceries": ShoppingBasket,
    "default": ChefHat,
};

const cardGradients = [
    "from-orange-500 to-red-600",
    "from-pink-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-yellow-500 to-orange-600",
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-indigo-700",
];

// Custom card renderer for each category
const CategoryStackCard = ({ item }) => {
    const Icon = item.icon || ChefHat;
    const gradient = cardGradients[item.colorIndex % cardGradients.length];

    return (
        <Link href={item.path} className="block h-full w-full">
            <div className={`relative h-full w-full bg-linear-to-br ${gradient} overflow-hidden`}>

                {/* Dot grid */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '18px 18px',
                    }}
                />

                {/* Glow orbs */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full blur-xl" />

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center z-10">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl">
                        <Icon className="w-10 h-10 text-white" strokeWidth={2} />
                    </div>

                    {/* Label */}
                    <div>
                        <h3 className="text-2xl font-black text-white drop-shadow-md">
                            {item.title}
                        </h3>
                        {item.description && (
                            <p className="text-sm text-white/80 mt-2 leading-relaxed max-w-xs mx-auto">
                                {item.description}
                            </p>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 text-white text-sm font-bold hover:bg-white/30 transition-colors">
                        <span>Explore {item.title}</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/20 to-transparent" />
            </div>
        </Link>
    );
};

const CategoriesAndBanner = () => {
    const [categories, setCategories] = useState([]);
    const [stackItems, setStackItems] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // detect mobile for responsive card sizing
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const loadCategories = useCallback(async () => {
        try {
            setLoadingCategories(true);
            const response = await SearchAPI.getAllCategories();

            if (response?.success && response?.data) {
                const mapped = response.data.map((category, index) => ({
                    id: category.categoryId,
                    categoryId: category.categoryId,
                    icon: iconMap[category.name] || iconMap.default,
                    label: category.name,
                    color: cardGradients[index % cardGradients.length],
                    path: `/restaurants?categoryId=${category.categoryId}`,
                }));
                setCategories(mapped);

                // transform to CardStack item shape
                const items = mapped.map((cat, index) => ({
                    id: cat.id,
                    title: cat.label,
                    description: cat.label === 'African Kitchen'
                        ? 'Authentic home-cooked meals delivered fresh'
                        : cat.label === 'Groceries'
                            ? 'African ingredients & pantry essentials'
                            : cat.label === 'Farm Produce'
                                ? 'Fresh fruits, vegetables & more'
                                : cat.label === 'Cakes'
                                    ? 'Custom cakes for every occasion'
                                    : cat.label === 'Soups' || cat.label === 'African Soups'
                                        ? 'Rich, hearty soups from across Africa'
                                        : cat.label === 'Pastries' || cat.label === 'Baked Goods'
                                            ? 'Freshly baked treats every day'
                                            : 'Explore our delicious selection',
                    href: cat.path,
                    // extra fields for custom renderer
                    icon: cat.icon,
                    colorIndex: index,
                    path: cat.path,
                }));

                setStackItems(items);
            } else {
                setCategories([]);
                setStackItems([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
            setStackItems([]);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    useEffect(() => {
        void loadCategories();
    }, [loadCategories]);

    const cardWidth = isMobile ? 300 : 480;
    const cardHeight = isMobile ? 260 : 320;

    return (
        <div className="py-16 md:py-20 bg-linear-to-b from-white via-orange-50/40 to-white relative overflow-hidden">

            {/* Decorative Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
            </div>

            <div className="container px-4 mx-auto max-w-7xl relative z-10">

                {/* Section Header */}
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-orange-100 to-red-100 rounded-full mb-5 shadow-sm border border-orange-200/50">
                        <Sparkles className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-bold text-orange-800 tracking-wide uppercase">
                            Explore Categories
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Everything African {' '}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">
                            All in One Place
                        </span>
                    </h2>
                    <p className="text-gray-500 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
                        From sizzling home kitchens to African grocery stores find exactly what you&#39;re craving
                    </p>
                </div>

                {/* Category Card Stack */}
                {loadingCategories ? (
                    <div
                        className="w-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center"
                        style={{ height: cardHeight + 80 }}
                    >
                        <p className="text-gray-400 text-sm">Loading categories...</p>
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
                        renderCard={(item) => (
                            <CategoryStackCard item={item} />
                        )}
                    />
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400">No categories available</p>
                    </div>
                )}

                {/* Browse all link */}
                <div className="text-center mt-8">
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