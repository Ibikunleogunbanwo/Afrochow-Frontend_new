"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HiSearch } from 'react-icons/hi';
import { ChevronRight, Home, X } from 'lucide-react';
import PopularStoreCard from '@/components/home/cards/PopularStoreCard';
import StoreCardSkeleton from '@/components/home/cards/StoreCardSkeleton';
import { SearchAPI } from '@/lib/api/search.api';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/contexts/LocationContext';
import { SignInModal } from '@/components/signin/SignInModal';
import { SignUpModal } from '@/components/register/SignUpModal';

// ── Module-level cache keyed by query + city + page ───────────────────────────
const storesCache = {};
const getCacheKey = (query, city, page) =>
    `${query || ''}|${city || ''}|${page}`;

const PAGE_SIZE = 20;

// ── isOpenNow helpers ─────────────────────────────────────────────────────────

// Parse "Open HH:MM - HH:MM" (24h) or "HH:MM AM - HH:MM PM" (12h) using browser local time.
const computeIsOpenNow = (todayHoursFormatted) => {
    if (!todayHoursFormatted) return null;
    // 24-hour: "Open 09:00 - 22:00" or "09:00 - 22:00"
    const m24 = todayHoursFormatted.match(/^(?:open\s+)?(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})$/i);
    if (m24) {
        const now = new Date();
        const cur = now.getHours() * 60 + now.getMinutes();
        const o = parseInt(m24[1]) * 60 + parseInt(m24[2]);
        const c = parseInt(m24[3]) * 60 + parseInt(m24[4]);
        return c > o ? cur >= o && cur < c : cur >= o || cur < c;
    }
    // 12-hour: "06:00 AM - 10:00 PM"
    const m12 = todayHoursFormatted.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m12) {
        const to24 = (h, m, p) => { let hr = parseInt(h); const mn = parseInt(m); if (p.toUpperCase()==='PM'&&hr!==12) hr+=12; if (p.toUpperCase()==='AM'&&hr===12) hr=0; return hr*60+mn; };
        const now = new Date();
        const cur = now.getHours() * 60 + now.getMinutes();
        const o = to24(m12[1], m12[2], m12[3]);
        const c = to24(m12[4], m12[5], m12[6]);
        return c > o ? cur >= o && cur < c : cur >= o || cur < c;
    }
    return null;
};

// Extract today's formatted hours from weeklySchedule using browser local day.
const computeTodayHoursFromSchedule = (weeklySchedule) => {
    if (!weeklySchedule || typeof weeklySchedule !== 'object' || Array.isArray(weeklySchedule)) return null;
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const today = days[new Date().getDay()];
    const cap = today.charAt(0).toUpperCase() + today.slice(1);
    const day = weeklySchedule[today] ?? weeklySchedule[cap] ?? weeklySchedule[today.toUpperCase()];
    if (!day) return null;
    if (!(day.isOpen ?? day.open ?? false)) return 'Closed today';
    const ot = day.openTime ?? day.open_time ?? day.startTime;
    const ct = day.closeTime ?? day.close_time ?? day.endTime;
    if (!ot || !ct) return null;
    return `${ot} - ${ct}`;
};

// Compute from full weeklySchedule using local browser day — most accurate.
const computeIsOpenFromSchedule = (weeklySchedule) => {
    if (!weeklySchedule || typeof weeklySchedule !== 'object' || Array.isArray(weeklySchedule)) return null;
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const today = days[new Date().getDay()];
    const cap = today.charAt(0).toUpperCase() + today.slice(1);
    const day = weeklySchedule[today] ?? weeklySchedule[cap] ?? weeklySchedule[today.toUpperCase()];
    if (!day) return null;
    if (!(day.isOpen ?? day.open ?? false)) return false;
    const ot = day.openTime ?? day.open_time ?? day.startTime ?? day.openingTime;
    const ct = day.closeTime ?? day.close_time ?? day.endTime ?? day.closingTime;
    if (!ot || !ct) return null;
    const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const o = toMins(ot), c = toMins(ct);
    return c > o ? cur >= o && cur < c : cur >= o || cur < c;
};

// Open rank: open=0, unknown=1, closed=2
const openRank = (v) => v.isOpenNow === true ? 0 : v.isOpenNow === false ? 2 : 1;

// ── Vendor → PopularStoreCard shape ──────────────────────────────────────────
const transformVendor = (vendor) => {
    const isOpenNow = computeIsOpenFromSchedule(vendor.weeklySchedule ?? vendor.operatingHours)
        ?? computeIsOpenNow(vendor.todayHoursFormatted)
        ?? vendor.isOpenNow
        ?? null;
    return {
        // identity
        vendorPublicId: vendor.publicUserId,
        // image — prefer banner, fall back to logo
        imageUrl: vendor.bannerUrl || vendor.logoUrl || null,
        // names & meta
        restaurantName: vendor.restaurantName,
        cuisineType: vendor.cuisineType || null,
        location: vendor.address?.city && vendor.address?.province
            ? `${vendor.address.city}, ${vendor.address.province}`
            : vendor.address?.city || '',
        // open status
        isOpenNow,
        todayHoursFormatted: computeTodayHoursFromSchedule(vendor.weeklySchedule ?? vendor.operatingHours)
            ?? vendor.todayHoursFormatted
            ?? null,
        // delivery
        deliveryFee: vendor.deliveryFee ?? 0,
        offersPickup: vendor.offersPickup ?? false,
        offersDelivery: vendor.offersDelivery ?? true,
        // stats
        preparationTimeMinutes: vendor.estimatedDeliveryMinutes || 0,
        averageRating: vendor.averageRating || 0,
        reviewCount: vendor.reviewCount || 0,
        totalOrders: vendor.totalOrdersCompleted || 0,
    };
};

const unwrap = (response) =>
    Array.isArray(response)
        ? response
        : response?.success && response?.data
            ? response.data
            : [];

// ── Main component ─────────────────────────────────────────────────────────────
const DisplayStores = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const urlQuery = searchParams.get('query') || '';
    const urlCity  = searchParams.get('city') || '';
    const urlPage  = parseInt(searchParams.get('page') || '0', 10);

    // Fall back to LocationContext city when no city is in the URL.
    const { city: locationCity } = useLocation();
    const effectiveCity = urlCity || locationCity || '';

    const [queryInput, setQueryInput] = useState(urlQuery);
    const [cityInput, setCityInput]   = useState(effectiveCity);
    const [isLoading, setIsLoading]   = useState(true);
    const [stores, setStores]         = useState([]);
    const [error, setError]           = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(urlPage);
    const [totalPages, setTotalPages]   = useState(0);
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const { isAuthenticated } = useAuth();

    // ── fetch ──────────────────────────────────────────────────────────────────
    const fetchStores = useCallback(async () => {
        const key = getCacheKey(urlQuery, effectiveCity, urlPage);

        if (storesCache[key]) {
            const c = storesCache[key];
            setStores(c.stores);
            setTotalCount(c.totalCount);
            setTotalPages(c.totalPages);
            setCurrentPage(urlPage);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            let rawVendors = [];

            // Only show vendors that can receive orders (VERIFIED or PROVISIONAL).
            // We omit `isVerified: true` from the backend call so PROVISIONAL vendors
            // are included, and instead filter by canReceiveOrders from the DTO.
            const isLive = (v) => v.canReceiveOrders === true
                || v.vendorStatus === 'VERIFIED'
                || v.vendorStatus === 'PROVISIONAL';

            if (urlQuery && effectiveCity) {
                // Both query and city — run vendor name search and product name
                // search in parallel, then filter both by city and merge
                const [byNameRes, byProductRes] = await Promise.all([
                    SearchAPI.searchVendorsAdvanced({
                        query: urlQuery,
                        city: effectiveCity,
                    }),
                    SearchAPI.getVendorsByProductName(urlQuery),
                ]);

                const byName    = unwrap(byNameRes).filter(isLive);
                const byProduct = unwrap(byProductRes)
                    .filter(v => isLive(v) && v.address?.city?.toLowerCase() === effectiveCity.toLowerCase());

                // Merge and deduplicate by publicUserId
                const seen = new Set();
                rawVendors = [...byName, ...byProduct].filter(v => {
                    if (seen.has(v.publicUserId)) return false;
                    seen.add(v.publicUserId);
                    return true;
                });

            } else if (urlQuery) {
                // Query only — search vendor names/cuisine AND product names in parallel
                const [byNameRes, byProductRes] = await Promise.all([
                    SearchAPI.searchVendorsAdvanced({
                        query: urlQuery,
                    }),
                    SearchAPI.getVendorsByProductName(urlQuery),
                ]);

                const byName    = unwrap(byNameRes).filter(isLive);
                const byProduct = unwrap(byProductRes).filter(isLive);

                const seen = new Set();
                rawVendors = [...byName, ...byProduct].filter(v => {
                    if (seen.has(v.publicUserId)) return false;
                    seen.add(v.publicUserId);
                    return true;
                });

            } else if (effectiveCity) {
                // City only — dedicated DB-level endpoint
                rawVendors = unwrap(await SearchAPI.getVendorsByCity(effectiveCity));

            } else {
                // No filters — all verified vendors
                rawVendors = unwrap(await SearchAPI.getVerifiedVendors());
            }

            const transformed = rawVendors.map(transformVendor);

            // Open stores first, closed at the bottom
            const sorted = transformed.sort((a, b) => {
                if (a.isOpenNow === b.isOpenNow) return 0;
                return a.isOpenNow ? -1 : 1;
            });

            // Client-side pagination
            const total     = sorted.length;
            const pages     = Math.ceil(total / PAGE_SIZE);
            const start     = urlPage * PAGE_SIZE;
            const paginated = sorted.slice(start, start + PAGE_SIZE);

            storesCache[key] = { stores: paginated, totalCount: total, totalPages: pages };

            setStores(paginated);
            setTotalCount(total);
            setTotalPages(pages);
            setCurrentPage(urlPage);
        } catch (err) {
            console.error('Error fetching stores:', err);
            setError(err.message || 'Failed to load stores');
            setStores([]);
        } finally {
            setIsLoading(false);
        }
    }, [urlQuery, urlCity, urlPage, locationCity]);

    useEffect(() => {
        void fetchStores();
    }, [fetchStores]);

    // Sync inputs on URL change (browser back/forward) or location context change
    useEffect(() => {
        setQueryInput(urlQuery);
        setCityInput(urlCity || locationCity || '');
    }, [urlQuery, urlCity, locationCity]);

    // ── navigation helpers ────────────────────────────────────────────────────
    const buildUrl = (overrides = {}) => {
        const params = new URLSearchParams();
        const query  = overrides.query ?? urlQuery;
        const city   = overrides.city  ?? urlCity;
        const page   = overrides.page  ?? 0;

        if (query)    params.set('query', query);
        if (city)     params.set('city', city);
        if (page > 0) params.set('page', String(page));

        const qs = params.toString();
        return `/allstore${qs ? `?${qs}` : ''}`;
    };

    const handleSearch = () => {
        router.push(buildUrl({ query: queryInput, city: cityInput, page: 0 }));
    };

    const handleClearAll = () => {
        setQueryInput('');
        setCityInput('');
        router.push('/allstore');
    };

    const handlePageChange = (page) => {
        router.push(buildUrl({ page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── derived UI values ─────────────────────────────────────────────────────
    const hasActiveFilters = !!(urlQuery || effectiveCity);

    const getPageTitle = () => {
        if (urlQuery && effectiveCity) return `"${urlQuery}" in ${effectiveCity}`;
        if (urlQuery)                  return `Results for "${urlQuery}"`;
        if (effectiveCity)             return `Vendors in ${effectiveCity}`;
        return 'All Vendors';
    };

    const getPageSubtitle = () => {
        if (urlQuery && effectiveCity)
            return `Verified African vendors and dishes matching "${urlQuery}" in ${effectiveCity}`;
        if (urlQuery)
            return `Vendors and dishes matching "${urlQuery}" across Canada`;
        if (effectiveCity)
            return `Discover authentic African vendors in ${effectiveCity}`;
        return 'Browse all verified African vendors across Canada';
    };

    const getEmptyMessage = () => {
        if (urlQuery && effectiveCity)
            return `No vendors or dishes matching "${urlQuery}" found in ${effectiveCity}. Try clearing some filters.`;
        if (urlQuery)
            return `No vendors or dishes matching "${urlQuery}" found. Try a different search term.`;
        if (effectiveCity)
            return `No vendors found in ${effectiveCity}. Try a different city.`;
        return 'No vendors available at the moment. Check back soon.';
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            for (let i = 0; i < totalPages; i++) pages.push(i);
        } else {
            pages.push(0);
            const start = Math.max(1, currentPage - 1);
            const end   = Math.min(totalPages - 2, currentPage + 1);
            if (start > 1) pages.push('ellipsis-start');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 2) pages.push('ellipsis-end');
            pages.push(totalPages - 1);
        }

        return pages;
    };

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-white py-12">
            <div className="container px-4 mx-auto max-w-7xl">

                <div className="mb-12">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-sm mb-8 flex-wrap" aria-label="Breadcrumb">
                        <Link
                            href="/"
                            className="flex items-center gap-1 text-gray-400 hover:text-orange-600 font-medium transition-colors"
                        >
                            <Home className="w-3.5 h-3.5" />
                            <span>Home</span>
                        </Link>

                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />

                        <Link
                            href="/allstore"
                            className="text-gray-400 hover:text-orange-600 font-medium transition-colors"
                        >
                            All Vendors
                        </Link>

                        {effectiveCity && (
                            <>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                <span className="text-gray-500 font-medium">{effectiveCity}</span>
                            </>
                        )}

                        {urlQuery && (
                            <>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                <span className="text-gray-700 font-semibold truncate max-w-48">
                                    &quot;{urlQuery}&quot;
                                </span>
                            </>
                        )}
                    </nav>

                    {/* Page Title */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
                            {getPageTitle()}
                            {!isLoading && totalCount > 0 && (
                                <span className="block text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600 mt-1">
                                    {totalCount} {totalCount === 1 ? 'product' : 'products'} found
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl">
                            {getPageSubtitle()}
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">

                        {/* Universal search — searches store name, cuisine, and dish names */}
                        <div className="relative flex-1">
                            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={queryInput}
                                onChange={(e) => setQueryInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                placeholder="Search vendors, cuisine, or dishes — e.g. Jollof Rice, Nigerian, Mama's Kitchen..."
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                            />
                        </div>

                        {/* City filter */}
                        <div className="relative sm:w-60">
                            <input
                                type="text"
                                value={cityInput}
                                onChange={(e) => setCityInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                placeholder="City..."
                                className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-semibold whitespace-nowrap"
                        >
                            <HiSearch className="w-5 h-5" />
                            <span>Search</span>
                        </button>
                    </div>

                    {/* Results count */}
                    {!isLoading && totalCount > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-semibold text-orange-600">
                                {totalCount} {totalCount === 1 ? 'product' : 'products'}
                                {effectiveCity ? ` in ${effectiveCity}` : ''}
                            </span>
                            {totalPages > 1 && (
                                <span>— Page {currentPage + 1} of {totalPages}</span>
                            )}
                        </div>
                    )}

                    {/* Active filter pills */}
                    {hasActiveFilters && !isLoading && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {urlQuery && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                    🔍 {urlQuery}
                                </span>
                            )}
                            {effectiveCity && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                    📍 {effectiveCity}
                                    {!urlCity && <span className="opacity-60 font-normal"> (your location)</span>}
                                </span>
                            )}
                            <button
                                onClick={handleClearAll}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-3 h-3" />
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            <p className="font-semibold">Error loading stores</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Store Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
                        {[...Array(PAGE_SIZE)].map((_, i) => (
                            <StoreCardSkeleton key={i} />
                        ))}
                    </div>
                ) : stores.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
                            {stores.map((store, index) => (
                                <div
                                    key={store.vendorPublicId || `store-${index}`}
                                    className="h-full animate-fade-in"
                                    style={{ animationDelay: `${index * 40}ms` }}
                                >
                                    <PopularStoreCard
                                        product={store}
                                        priority={index < 3}
                                        isAuthenticated={isAuthenticated}
                                        onUnauthenticated={() => setShowSignIn(true)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col items-center gap-4 mt-8">
                                <div className="flex items-center gap-2 flex-wrap justify-center">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-orange-50 hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        {getPageNumbers().map((page, idx) => (
                                            typeof page === 'number' ? (
                                                <button
                                                    key={idx}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`min-w-10 px-3 py-2 rounded-lg font-semibold transition-all ${
                                                        currentPage === page
                                                            ? 'bg-orange-600 text-white shadow-lg'
                                                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-400'
                                                    }`}
                                                >
                                                    {page + 1}
                                                </button>
                                            ) : (
                                                <span key={idx} className="px-2 text-gray-400">...</span>
                                            )
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages - 1}
                                        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-orange-50 hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700"
                                    >
                                        Next
                                    </button>
                                </div>

                                <p className="text-center text-gray-400 text-sm">
                                    Showing {stores.length} of {totalCount} vendors — page {currentPage + 1} of {totalPages}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                                <HiSearch className="w-12 h-12 text-orange-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                No vendors found
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {getEmptyMessage()}
                            </p>
                            <button
                                onClick={handleClearAll}
                                className="inline-block px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors"
                            >
                                Browse All Vendors
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Auth modals */}
            <SignInModal
                isOpen={showSignIn}
                onClose={() => setShowSignIn(false)}
                onSignUpClick={() => { setShowSignIn(false); setShowSignUp(true); }}
            />
            <SignUpModal
                isOpen={showSignUp}
                onClose={() => setShowSignUp(false)}
                onSignInClick={() => { setShowSignUp(false); setShowSignIn(true); }}
            />
        </div>
    );
};

export default DisplayStores;