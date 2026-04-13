"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Search, MapPin, ArrowRight, Loader2, Flame, Navigation, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SearchAPI } from '@/lib/api/search.api';
import { DotGlobeHero } from '@/components/ui/globe-hero';
import { useLocation } from '@/contexts/LocationContext';

// ── Nominatim forward geocode (Canadian results only) ────────────────────────
const searchNominatim = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=ca&addressdetails=1&limit=5`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    return res.json();
};

const extractCity = (addr) =>
    addr?.city || addr?.town || addr?.village || addr?.municipality || addr?.county || null;

const buildLabel = (result) => {
    const addr = result.address || {};
    const city = extractCity(addr);
    const parts = [addr.neighbourhood || addr.suburb || addr.road, city, addr.state, addr.postcode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : result.display_name;
};

const HeroSection = () => {
    const [searchQuery, setSearchQuery]   = useState('');
    const [popularCuisines, setPopularCuisines] = useState([
        "Jollof Rice", "Suya", "Egusi Soup", "Pounded Yam", "Fufu"
    ]);
    const [loadingPopular, setLoadingPopular] = useState(false);
    const [stats, setStats]               = useState(null);
    const [activeTag, setActiveTag]       = useState(null);

    // ── location state ──────────────────────────────────────────────────────
    const { city: contextCity, isDetecting, locationSource, requestPreciseLocation, updateCityWithCoordinates } = useLocation();
    const [locationInput, setLocationInput]     = useState('');
    const [suggestions, setSuggestions]         = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [locSearching, setLocSearching]       = useState(false);
    const [locFocused, setLocFocused]           = useState(false);
    const debounceRef   = useRef(null);
    const suggestionsRef = useRef(null);

    const router = useRouter();

    // Sync input with LocationContext city (GPS / IP detect / navbar search)
    useEffect(() => {
        if (contextCity && !locFocused) setLocationInput(contextCity);
    }, [contextCity, locFocused]);

    // Close suggestions dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        void fetchPopularProducts();
        void fetchStats();
    }, []);

    // ── Nominatim search with 350 ms debounce ────────────────────────────────
    const searchLocation = useCallback(async (q) => {
        if (!q || q.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
        setLocSearching(true);
        try {
            const results = await searchNominatim(q);
            setSuggestions(Array.isArray(results) ? results : []);
            setShowSuggestions(true);
        } catch { setSuggestions([]); }
        finally { setLocSearching(false); }
    }, []);

    const handleLocationChange = (e) => {
        const val = e.target.value;
        setLocationInput(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchLocation(val), 350);
    };

    const handleSelectSuggestion = (result) => {
        const addr     = result.address || {};
        const city     = extractCity(addr) || addr.postcode || result.display_name;
        const lat      = parseFloat(result.lat);
        const lng      = parseFloat(result.lon);
        const details  = {
            neighbourhood: addr.neighbourhood || addr.suburb || null,
            city, province: addr.state || null,
            postalCode: addr.postcode || null,
            country: addr.country || null,
            displayName: result.display_name,
        };
        updateCityWithCoordinates(city, lat, lng, details);
        setLocationInput(buildLabel(result));
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleLocateMe = () => {
        requestPreciseLocation();
        setLocationInput('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleClearLocation = () => {
        setLocationInput('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

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

    const effectiveCity = locationInput.trim() || contextCity || '';

    const handleSearch = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (!searchQuery?.trim() && !effectiveCity) return;
        const params = new URLSearchParams();
        if (searchQuery?.trim()) params.append('search', searchQuery.trim());
        if (effectiveCity)       params.append('city',   effectiveCity);
        router.push(`/restaurants?${params.toString()}`);
    };

    const handlePopularClick = (cuisine) => {
        setActiveTag(cuisine);
        setShowSuggestions(false);
        const params = new URLSearchParams();
        params.append('search', cuisine);
        if (effectiveCity) params.append('city', effectiveCity);
        router.push(`/restaurants?${params.toString()}`);
    };

    // Enter on the location input: close dropdown + submit
    const handleLocationKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setShowSuggestions(false);
            setSuggestions([]);
            if (searchQuery?.trim() || locationInput.trim()) {
                const params = new URLSearchParams();
                if (searchQuery?.trim())  params.append('search', searchQuery.trim());
                if (locationInput.trim()) params.append('city',   locationInput.trim());
                router.push(`/restaurants?${params.toString()}`);
            }
        }
        if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
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

                            {/* Location — with Nominatim autocomplete + Locate Me */}
                            <div className="relative flex-1" ref={suggestionsRef}>
                                {/* Input row */}
                                <div className="flex items-center">
                                    {locSearching ? (
                                        <Loader2 className="absolute left-4 w-5 h-5 text-orange-400 animate-spin pointer-events-none" />
                                    ) : (
                                        <MapPin className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
                                    )}
                                    <input
                                        type="text"
                                        value={locFocused ? locationInput : (locationInput || contextCity || '')}
                                        onChange={handleLocationChange}
                                        onFocus={() => { setLocFocused(true); if (suggestions.length > 0) setShowSuggestions(true); }}
                                        onBlur={() => setLocFocused(false)}
                                        onKeyDown={handleLocationKeyDown}
                                        placeholder="City or postal code..."
                                        className="w-full pl-12 pr-28 py-3.5 text-gray-800 placeholder-gray-400 bg-transparent border-0 focus:outline-none text-base font-medium"
                                        aria-label="Enter location"
                                        autoComplete="off"
                                    />
                                    {/* Right-side actions */}
                                    <div className="absolute right-3 flex items-center gap-1">
                                        {locationInput && (
                                            <button
                                                type="button"
                                                onClick={handleClearLocation}
                                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                title="Clear location"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {/* Locate Me button */}
                                        <button
                                            type="button"
                                            onClick={handleLocateMe}
                                            disabled={isDetecting}
                                            title="Use my current location"
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50 text-xs font-semibold whitespace-nowrap"
                                        >
                                            {isDetecting
                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                : <Navigation className="w-3.5 h-3.5" />
                                            }
                                            <span>{isDetecting ? 'Locating…' : 'Locate me'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Autocomplete dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                                        {suggestions.map((result, i) => (
                                            <li key={result.place_id || i}>
                                                <button
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => handleSelectSuggestion(result)}
                                                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0"
                                                >
                                                    <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{buildLabel(result)}</p>
                                                        <p className="text-xs text-gray-400 truncate">{result.address?.state || 'Canada'}</p>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Search Button */}
                            <button
                                type="submit"
                                disabled={!searchQuery?.trim() && !effectiveCity}
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