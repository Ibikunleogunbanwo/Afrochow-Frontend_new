"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthAPI } from '@/lib/api/auth';

const HeroSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const [popularCuisines, setPopularCuisines] = useState([
        "Jollof Rice", "Suya", "Egusi Soup", "Pounded Yam", "Fufu"
    ]);
    const [loadingPopular, setLoadingPopular] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const router = useRouter();

    useEffect(() => {
        void fetchPopularProducts();
        void fetchStats();
    }, []);


    const fetchPopularProducts = async () => {
        try {
            setLoadingPopular(true);
            setError(null);

            const response = await AuthAPI.getPopularProductNames(10);

            let productNames = [];

            if (Array.isArray(response)) {
                productNames = response;
            } else if (Array.isArray(response?.data)) {
                productNames = response.data;
            } else {
                throw new Error('Invalid response format');
            }

            if (productNames.length > 0) {
                setPopularCuisines(productNames);
            }

        } catch (error) {
            setError('Failed to load popular items');
        } finally {
            setLoadingPopular(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await AuthAPI.getStats();
            if (response?.success && response?.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };


    const handleSearch = (e) => {
        e.preventDefault();

        if (!searchQuery?.trim() && !location?.trim()) {
            return;
        }

        const params = new URLSearchParams();
        if (searchQuery?.trim()) params.append('search', searchQuery.trim());
        if (location?.trim()) params.append('city', location.trim());

        router.push(`/restaurants?${params.toString()}`);
    };

    const handlePopularClick = (cuisine) => {
        const params = new URLSearchParams();
        params.append('search', cuisine);
        if (location?.trim()) params.append('city', location.trim());

        router.push(`/restaurants?${params.toString()}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    return (
        <section className="relative flex items-center justify-center min-h-[90vh] overflow-hidden bg-linear-to-br from-orange-50 via-white to-orange-50">

            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-orange-900/60 z-10"></div>
                <Image
                    className="object-cover"
                    src="/image/Jollof.jpg"
                    alt="Delicious African Cuisine"
                    fill
                    priority
                    sizes="100vw"
                    quality={70}
                />
            </div>

            {/* Hero Content */}
            <div className="relative z-20 w-full max-w-6xl px-4 mx-auto sm:px-6 lg:px-8 py-20">
                <div className="text-center space-y-8">

                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full animate-fade-in-down">
                        <span className="text-sm font-medium text-orange-100">
                            Authentic African Flavors
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="space-y-2 animate-fade-in-up">
                        <span className="block text-5xl font-black text-white sm:text-6xl md:text-7xl lg:text-8xl tracking-tight drop-shadow-2xl">
                            Taste of
                        </span>
                        <span className="block text-5xl font-black bg-linear-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-lg">
                            Africa
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="max-w-2xl mx-auto text-lg text-gray-200 sm:text-xl md:text-2xl font-medium drop-shadow-lg animate-fade-in">
                        Discover authentic African cuisine from the best home Kitchens.
                        <span className="block mt-1 text-orange-300">Delivered fresh to your doorstep!</span>
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="max-w-4xl mx-auto mt-12 animate-fade-in-up animation-delay-200">
                        <div className="flex flex-col gap-3 p-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl sm:flex-row">

                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Search for Jollof, Suya, Egusi..."
                                    className="w-full pl-12 pr-4 py-4 text-gray-800 placeholder-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0 text-base font-medium"
                                    aria-label="Search for food"
                                />
                            </div>

                            {/* Divider */}
                            <div className="hidden sm:block w-px bg-gray-300"></div>

                            {/* Location Input */}
                            <div className="relative flex-1">
                                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter your location..."
                                    className="w-full pl-12 pr-4 py-4 text-gray-800 placeholder-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0 text-base font-medium"
                                    aria-label="Enter location"
                                />
                            </div>

                            {/* Search Button */}
                            <button
                                type="submit"
                                disabled={!searchQuery?.trim() && !location?.trim()}
                                className="flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-linear-to-r from-orange-600 to-orange-500 rounded-xl hover:from-orange-700 hover:to-orange-600 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                            >
                                <span className="mr-2">Search</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>

                    {/* Popular Cuisines */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-8 animate-fade-in animation-delay-400">
                        <span className="text-sm font-medium text-gray-300">Popular:</span>
                        {loadingPopular ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading popular items...</span>
                            </div>
                        ) : error ? (
                            <span className="text-sm text-red-400">{error}</span>
                        ) : (
                            popularCuisines.map((cuisine, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePopularClick(cuisine)}
                                    className="px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    aria-label={`Search for ${cuisine}`}
                                >
                                    {cuisine}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Stats */}
                    {stats ? (
                        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto mt-12 sm:grid-cols-3 animate-fade-in animation-delay-600">
                            <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                                <div className="text-3xl font-black text-white">{stats.totalActiveVendors}+</div>
                                <div className="text-sm text-gray-300">Kitchens</div>
                            </div>
                            <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                                <div className="text-3xl font-black text-white">{stats.totalCustomers}+</div>
                                <div className="text-sm text-gray-300">Happy Customers</div>
                            </div>
                            <div className="hidden sm:block p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                                <div className="text-3xl font-black text-white">{stats.averageDeliveryTimeMinutes} min</div>
                                <div className="text-sm text-gray-300">Avg. Delivery</div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto mt-12 sm:grid-cols-3 animate-fade-in animation-delay-600">
                            <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                                <div className="text-3xl font-black text-white">50+</div>
                                <div className="text-sm text-gray-300">Kitchens</div>
                            </div>
                            <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                                <div className="text-3xl font-black text-white">200+</div>
                                <div className="text-sm text-gray-300">Happy Customers</div>
                            </div>
                            <div className="hidden sm:block p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                                <div className="text-3xl font-black text-white">30 min</div>
                                <div className="text-sm text-gray-300">Avg. Delivery</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
                <svg className="w-full h-24 fill-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>
        </section>
    );
};

export default HeroSection;
