'use client';

import React, {useEffect, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {ArrowRight, Cake, ChefHat, Croissant, Leaf, Sparkles, Store, TrendingUp, Utensils} from "lucide-react";
import {SearchAPI} from "@/lib/api/search.api";


const CategoriesAndBanner = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [featuredProduct, setFeaturedProduct] = useState(null);
    const [loadingFeatured, setLoadingFeatured] = useState(true);

    const iconMap = {
        "African Kitchen": ChefHat,
        "Cakes": Cake,
        "Farm Produce": Leaf,
        "Pastries": Croissant,
        "Baked Goods": Croissant,
        "Soups": Utensils,
        "Groceries": Store,
        "default": ChefHat
    };

    const colorSchemes = [
        "from-orange-500 to-red-500",
        "from-pink-500 to-purple-500",
        "from-green-500 to-emerald-500",
        "from-yellow-600 to-orange-500",
        "from-blue-500 to-indigo-500",
        "from-purple-500 to-indigo-500"
    ];

    const fetchAllCategories = async () => {
        try {
            setLoadingCategories(true);

            const responseCat = await SearchAPI.getAllCategories();

            if (responseCat?.success && responseCat?.data) {
                return responseCat.data.map((category, index) => ({
                    id: category.categoryId,
                    categoryId: category.categoryId,
                    icon: iconMap[category.name] || iconMap.default,
                    label: category.name,
                    description: category.description || "Delicious options",
                    color: colorSchemes[index % colorSchemes.length],
                    path: `/restaurants?categoryId=${category.categoryId}`,
                    bgPattern: index % 2 === 0 ? "dots" : "grid"
                }));
            }

            return null;
        } catch (error) {
            return null;
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        const loadCategories = async () => {
            const data = await fetchAllCategories();
            if (data && Array.isArray(data)) {
                setCategories(data);
            } else {
                setCategories([]);
            }
        };

        const loadFeaturedProduct = async () => {
            try {
                setLoadingFeatured(true);
                const response = await SearchAPI.getChefSpecials(1);

                if (response?.success && response?.data && response.data.length > 0) {
                    setFeaturedProduct(response.data[0]);
                } else if (Array.isArray(response) && response.length > 0) {
                    setFeaturedProduct(response[0]);
                }
            } catch (error) {
            } finally {
                setLoadingFeatured(false);
            }
        };

        void loadCategories();
        void loadFeaturedProduct();
    }, []);



    const banners = [
        featuredProduct ? {
            src: featuredProduct.imageUrl || "/image/ofada.jpg",
            title: featuredProduct.name || "Chef's Special",
            subtitle: featuredProduct.description || "Experience the taste of authentic cuisine",
            badge: "Chef's Special",
            cta: "Order Now",
            path: `/restaurants?search=${encodeURIComponent(featuredProduct.name)}`
        } : {
            src: "/image/ofada.jpg",
            title: "Chef's Special",
            subtitle: "Discover our most popular dishes",
            badge: "Chef's Special",
            cta: "Order Now",
            path: "/restaurants"
        },

        {
            src: "/image/SORTED-Food.jpg",
            title: "Explore Our Menu",
            subtitle: "Delicious variety of African dishes delivered fresh",
            badge: "Popular",
            cta: "Browse Menu",
            path: "/restaurants"
        }
    ];

    return (
        <div className="py-20 bg-linear-to-b from-white via-orange-50/40 to-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="container px-4 mx-auto max-w-7xl relative z-10">

                {/* Section Header */}
                <div className="text-center mb-16 animate-fade-in">
                    <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-linear-to-r from-orange-100 to-red-100 rounded-full mb-4 shadow-sm border border-orange-200/50">
                        <Sparkles className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-bold text-orange-800 tracking-wide">WHAT WE OFFER</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Discover Amazing <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">Flavors</span>
                    </h2>
                    <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        From traditional home-cooked meals to party platters, explore the best of African cuisine
                    </p>
                </div>

                {/* Categories Grid */}
                <section className="grid grid-cols-2 gap-6 mb-20 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {loadingCategories ? (
                        [...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className="relative aspect-square p-6 text-center bg-white rounded-2xl shadow-md border border-gray-100 animate-pulse"
                            >
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto"></div>
                            </div>
                        ))
                    ) : categories.length > 0 ? (
                        categories.map((item, index) => {
                            const Icon = item.icon;
                            const isHovered = hoveredIndex === index;

                            return (
                                <Link
                                    href={item.path}
                                    key={item.id || index}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    className=" flex justify-center items-center group relative aspect-square p-3 md:p-6 text-center transition-all duration-300 bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 animate-fade-up cursor-pointer overflow-hidden border-2 border-gray-100 hover:border-orange-200"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    aria-label={`Explore ${item.label}`}
                                >
                                    {/* Animated Gradient Background */}
                                    <div className={`absolute inset-0 bg-linear-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-all duration-300`}></div>

                                    {/* Content Container */}
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        {/* Icon Container */}
                                        <div className={`relative md:p-5 p-3 rounded-2xl bg-linear-to-br ${item.color} transition-all duration-300 ${isHovered ? 'scale-110 shadow-2xl' : 'scale-100 shadow-lg'}`}>
                                            <Icon className="md:w-10 md:h-10 w-7 h-7 text-white" strokeWidth={2.5} />
                                        </div>

                                        {/* Text Content */}
                                        <h3 className=" text-sm md:text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 text-center">
                                            {item.label}
                                        </h3>
                                    </div>

                                    {/* Hover Arrow Indicator */}
                                    <div className="absolute bottom-3 right-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <ArrowRight className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500">No categories available</p>
                        </div>
                    )}
                </section>

                {/* Featured Banners - Side by Side */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                    {loadingFeatured && !featuredProduct ? (
                        <>
                            <div className="relative w-full h-80 md:h-96 bg-gray-200 rounded-2xl animate-pulse">
                                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                                    <div className="w-24 h-6 bg-gray-300 rounded-full mb-3"></div>
                                    <div className="w-3/4 h-8 bg-gray-300 rounded mb-2"></div>
                                    <div className="w-1/2 h-4 bg-gray-300 rounded mb-4"></div>
                                    <div className="w-32 h-6 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                            {/* Show second banner normally */}
                            <Link
                                href="/restaurants"
                                className="group relative w-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-up border-2 border-gray-100 hover:border-orange-200"
                            >
                                <div className="relative w-full h-80 md:h-96">
                                    <Image
                                        src="/image/SORTED-Food.jpg"
                                        alt="Explore Our Menu"
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        quality={70}
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/80 transition-all duration-500"></div>
                                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
                                        <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-linear-to-r from-orange-500 to-red-500 rounded-full mb-3 w-fit shadow-lg">
                                            <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                                            <span className="text-xs font-bold uppercase tracking-wide">Popular</span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black mb-2 drop-shadow-lg leading-tight">
                                            Explore Our Menu
                                        </h3>
                                        <p className="text-sm md:text-base text-gray-200 mb-4 drop-shadow-md line-clamp-2">
                                            Delicious variety of African dishes delivered fresh
                                        </p>
                                        <div className="inline-flex items-center space-x-2 text-white font-bold group-hover:text-orange-300 transition-colors duration-300">
                                            <span className="text-sm">Browse Menu</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </>
                    ) : (
                        banners.map((banner, index) => (
                            <Link
                                key={index}
                                href={banner.path}
                                className="group relative w-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-up border-2 border-gray-100 hover:border-orange-200"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                            {/* Image Container */}
                            <div className="relative w-full h-80 md:h-96">
                                <Image
                                    src={banner.src}
                                    alt={banner.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    quality={70}
                                />

                                {/* Enhanced Gradient Overlay */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/80 transition-all duration-500"></div>

                                {/* Content Overlay */}
                                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
                                    {/* Badge */}
                                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-linear-to-r from-orange-500 to-red-500 rounded-full mb-3 w-fit shadow-lg">
                                        <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                                        <span className="text-xs font-bold uppercase tracking-wide">
                                            {banner.badge}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl md:text-3xl font-black mb-2 drop-shadow-lg leading-tight">
                                        {banner.title}
                                    </h3>

                                    {/* Subtitle */}
                                    <p className="text-sm md:text-base text-gray-200 mb-4 drop-shadow-md line-clamp-2">
                                        {banner.subtitle}
                                    </p>

                                    {/* CTA Button */}
                                    <div className="inline-flex items-center space-x-2 text-white font-bold group-hover:text-orange-300 transition-colors duration-300">
                                        <span className="text-sm">{banner.cta}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" strokeWidth={2.5} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                        ))
                    )}
                </section>

                {/* Enhanced Bottom CTA Section */}
                <div className="mt-16 text-center animate-fade-in">
                    <div className="relative max-w-3xl mx-auto p-10 md:p-12 bg-linear-to-br from-orange-50 via-red-50 to-orange-50 rounded-3xl border-2 border-orange-200 shadow-xl overflow-hidden">
                        {/* Decorative Background Pattern */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(251,146,60,0.1)_1px,transparent_1px)] bg-size-[40px_40px]"></div>

                        {/* Content */}
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-orange-500 to-red-500 rounded-2xl mb-6 shadow-lg">
                                <ChefHat className="w-8 h-8 text-white" strokeWidth={2.5} />
                            </div>

                            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
                                Can&#39;t find what you&#39;re looking for?
                            </h3>
                            <p className="text-gray-700 text-lg md:text-xl mb-8 max-w-xl mx-auto leading-relaxed">
                                Browse our full collection of kitchens and discover more amazing African cuisine
                            </p>
                            <Link
                                href="/restaurants"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-orange-600 via-orange-500 to-red-500 text-white font-black rounded-2xl hover:from-orange-700 hover:via-orange-600 hover:to-red-600 transition-all duration-300 shadow-2xl hover:shadow-orange-500/50 hover:scale-105 text-lg group"
                            >
                                <span>View All Products</span>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" strokeWidth={2.5} />
                            </Link>
                        </div>

                        {/* Decorative Corner Elements */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-linear-to-br from-orange-300/30 to-transparent rounded-br-full"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-linear-to-tl from-red-300/30 to-transparent rounded-tl-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriesAndBanner;