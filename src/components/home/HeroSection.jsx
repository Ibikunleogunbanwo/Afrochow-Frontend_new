"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, MapPin, ArrowRight, Loader2, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SearchAPI } from '@/lib/api/search.api';
import { DotGlobeHero } from '@/components/ui/globe-hero';

const HeroSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const [popularCuisines, setPopularCuisines] = useState([
        "Jollof Rice", "Suya", "Egusi Soup", "Pounded Yam", "Fufu"
    ]);
    const [loadingPopular, setLoadingPopular] = useState(false);
    const [stats, setStats] = useState(null);
    const [activeTag, setActiveTag] = useState(null);
    const router = useRouter();

    useEffect(() => {
        void fetchPopularProducts();
        void fetchStats();
    }, []);

    const fetchPopularProducts = async () => {
        try {
            setLoadingPopular(true);
            const response = await SearchAPI.getPopularProductNames(10);
            const productNames = Array.isArray(response)
                ? response
                : Array.isArray(response?.data) ? response.data : [];
            if (productNames.length > 0) setPopularCuisines(productNames);
        } catch (error) {
            console.error('Error fetching popular products:', error);
        } finally {
            setLoadingPopular(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await SearchAPI.getStats();
            if (response?.success && response?.data) setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery?.trim() && !location?.trim()) return;
        const params = new URLSearchParams();
        if (searchQuery?.trim()) params.append('search', searchQuery.trim());
        if (location?.trim()) params.append('city', location.trim());
        router.push(`/restaurants?${params.toString()}`);
    };

    const handlePopularClick = (cuisine) => {
        setActiveTag(cuisine);
        const params = new URLSearchParams();
        params.append('search', cuisine);
        if (location?.trim()) params.append('city', location.trim());
        router.push(`/restaurants?${params.toString()}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch(e);
    };

    const statItems = stats ? [
        { value: `${stats.totalActiveVendors}+`, label: 'Active Vendors' },
        { value: `${stats.totalCustomers}+`, label: 'Satisfied Customers' },
        { value: `${stats.averageDeliveryTimeMinutes} min`, label: 'Avg. Delivery' },
    ] : [
        { value: '50+', label: 'Active Vendors' },
        { value: '200+', label: 'Satisfied Customers' },
        { value: '30 min', label: 'Avg. Delivery' },
    ];

    return (
        <DotGlobeHero
            rotationSpeed={0.003}
            globeRadius={1.4}
            className="min-h-[92vh]"
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/image/Jollof.jpg"
                    alt="Delicious African Cuisine"
                    fill
                    priority
                    sizes="100vw"
                    quality={80}
                    className="object-cover scale-105"
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/70 to-black/50" />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/30" />
            </div>

            {/* Glow orbs */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-red-500/8 rounded-full blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex flex-col items-center text-center space-y-8">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-orange-400/40 bg-orange-500/15 backdrop-blur-md shadow-lg">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping" />
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-bold text-orange-200 tracking-wide">
                            🌍 Canada&#39;s #1 African Food Platform
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="space-y-3">
                        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
                            Authentic
                        </h1>
                        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none">
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 via-amber-400 to-orange-500 drop-shadow-lg">
                                African Flavors
                            </span>
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <p className="max-w-2xl text-lg sm:text-xl text-gray-300 leading-relaxed">
                        From home kitchens to African grocery stores order your favourite
                        dishes, spices, and ingredients from verified vendors near you.
                        <span className="block mt-1 text-orange-300 font-semibold">
                            Fresh. Authentic. Delivered fast.
                        </span>
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="w-full max-w-3xl">
                        <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 border border-white/20">

                            {/* Food Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Jollof Rice, Suya, Egusi, Groceries..."
                                    className="w-full pl-12 pr-4 py-3.5 text-gray-800 placeholder-gray-400 bg-transparent border-0 focus:outline-none text-base font-medium"
                                    aria-label="Search for food"
                                />
                            </div>

                            {/* Divider */}
                            <div className="hidden sm:block w-px bg-gray-200 my-2" />

                            {/* Location */}
                            <div className="relative flex-1">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Calgary, Toronto, Vancouver..."
                                    className="w-full pl-12 pr-4 py-3.5 text-gray-800 placeholder-gray-400 bg-transparent border-0 focus:outline-none text-base font-medium"
                                    aria-label="Enter location"
                                />
                            </div>

                            {/* Search Button */}
                            <button
                                type="submit"
                                disabled={!searchQuery?.trim() && !location?.trim()}
                                className="flex items-center justify-center gap-2 px-7 py-3.5 font-bold text-white bg-linear-to-r from-orange-600 to-orange-500 rounded-xl hover:from-orange-700 hover:to-orange-600 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 group shrink-0"
                            >
                                <span>Search</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>

                    {/* Trending Tags */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="text-sm font-medium text-gray-400 mr-1">Trending:</span>
                        {loadingPopular ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading...</span>
                            </div>
                        ) : (
                            popularCuisines.map((cuisine, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePopularClick(cuisine)}
                                    aria-label={`Search for ${cuisine}`}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 hover:scale-105 ${
                                        activeTag === cuisine
                                            ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                                            : 'bg-white/10 border-white/25 text-white hover:bg-white/20 hover:border-white/40'
                                    }`}
                                >
                                    {cuisine}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-lg pt-2">
                        {statItems.map((stat, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center p-4 bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl hover:bg-white/12 transition-colors"
                            >
                                <span className="text-2xl sm:text-3xl font-black text-white">
                                    {stat.value}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-400 mt-1 text-center leading-tight">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
                <svg
                    className="w-full h-20 fill-white"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
                </svg>
            </div>
        </DotGlobeHero>
    );
};

export default HeroSection;