"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HiSearch } from 'react-icons/hi';
import { ChevronRight, Home } from 'lucide-react';
import StoreCard from '@/components/home/cards/storeCard';
import StoreCardSkeleton from "@/components/home/cards/StoreCardSkeleton";
import { SearchAPI } from '@/lib/api/search.api';

const DisplayRestaurant = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSearchQuery = searchParams.get('search') || '';
    const urlCity       = searchParams.get('city') || '';
    const urlCategoryId = searchParams.get('categoryId') || '';
    const urlCategory   = searchParams.get('category') || '';

    const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
    const [cityFilter, setCityFilter]   = useState(urlCity);
    const [isLoading, setIsLoading]     = useState(true);
    const [products, setProducts]       = useState([]);
    const [error, setError]             = useState(null);
    const [categoryName, setCategoryName] = useState('');

    const [currentPage, setCurrentPage]     = useState(0);
    const [totalPages, setTotalPages]       = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [hasMore, setHasMore]             = useState(false);
    const pageSize = 20;

    useEffect(() => {
        const fetchCategoryName = async () => {
            if (!urlCategoryId) return;
            try {
                const response = await SearchAPI.getAllCategories();
                if (response?.success && response?.data) {
                    const match = response.data.find(
                        cat => String(cat.categoryId) === String(urlCategoryId)
                    );
                    if (match) setCategoryName(match.name);
                }
            } catch (error) {
                console.error('Error fetching category name:', error);
            }
        };
        void fetchCategoryName();
    }, [urlCategoryId]);

    useEffect(() => {
        if (!urlCategoryId) setCategoryName('');
    }, [urlCategoryId]);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Determine which product endpoint to call
                let productRequest;
                if (urlCategoryId || urlSearchQuery) {
                    productRequest = SearchAPI.searchProductsAdvanced({
                        ...(urlSearchQuery && { query: urlSearchQuery }),
                        ...(urlCity && { city: urlCity }),
                        ...(urlCategoryId && { categoryId: urlCategoryId }),
                        page: currentPage,
                        size: pageSize,
                    });
                } else if (urlCity || urlCategory) {
                    productRequest = SearchAPI.searchProducts({
                        ...(urlCity && { city: urlCity }),
                        ...(urlCategory && { category: urlCategory }),
                        page: currentPage,
                        size: pageSize,
                    });
                } else {
                    productRequest = SearchAPI.searchProductsAdvanced({
                        page: currentPage,
                        size: pageSize,
                    });
                }

                // Fetch products and verified vendors in parallel
                const [response, vendorsResponse] = await Promise.all([
                    productRequest,
                    SearchAPI.getVerifiedVendors(),
                ]);

                if (response?.success && response?.data) {
                    const pageData    = response.data;
                    const productList = pageData.content || [];

                    // Handle both plain array and wrapped response shapes
                    const vendors = Array.isArray(vendorsResponse)
                        ? vendorsResponse
                        : vendorsResponse?.success && vendorsResponse?.data
                            ? vendorsResponse.data
                            : [];

                    // Build verified vendor lookup map by publicUserId
                    const vendorMap = vendors.reduce((map, vendor) => {
                        map[vendor.publicUserId] = vendor;
                        return map;
                    }, {});

                    // Drop products whose vendor is not in the verified map,
                    // then merge product data with vendor data
                    const transformedResults = productList
                        .filter(product => vendorMap[product.vendorPublicId])
                        .map(product => {
                            const vendor = vendorMap[product.vendorPublicId];
                            return {
                                storeId: product.vendorPublicId,
                                publicProductId: product.publicProductId,
                                vendorPublicId: product.vendorPublicId,
                                name: product.name,
                                categories: product.categoryName
                                    ? [product.categoryName]
                                    : ['African Cuisine'],
                                rating: product.averageRating || 0,
                                reviewCount: product.reviewCount || 0,
                                deliveryTime: vendor.estimatedDeliveryMinutes
                                    || product.preparationTimeMinutes
                                    || 30,
                                location: vendor.address?.city && vendor.address?.province
                                    ? `${vendor.address.city}, ${vendor.address.province}`
                                    : product.vendorCity && product.vendorProvince
                                        ? `${product.vendorCity}, ${product.vendorProvince}`
                                        : product.vendorCity || '',
                                deliveryFee: vendor.deliveryFee || 2.99,
                                popularItems: [{
                                    name: product.name,
                                    imageUrl: product.imageUrl || '/image/placeholder.jpg',
                                    price: product.price,
                                    description: product.description,
                                }],
                                available: product.available !== false,
                                restaurantName: product.restaurantName || vendor.restaurantName,
                                categoryName: product.categoryName,
                                description: product.description,
                                price: product.price,
                                vendorAddressLine: product.vendorAddressLine,
                                vendorCity: product.vendorCity,
                                vendorProvince: product.vendorProvince,
                                vendorPostalCode: product.vendorPostalCode,
                                vendorCountry: product.vendorCountry,
                                vendorFormattedAddress: product.vendorFormattedAddress,
                                isOpenNow: vendor.isOpenNow ?? null,
                                todayHoursFormatted: vendor.todayHoursFormatted ?? null,
                            };
                        });

                    // Open first, closed at the bottom
                    const sortedResults = transformedResults.sort((a, b) => {
                        if (a.isOpenNow === b.isOpenNow) return 0;
                        return a.isOpenNow ? -1 : 1;
                    });

                    setProducts(sortedResults);
                    setTotalPages(pageData.totalPages || 0);
                    setTotalElements(pageData.totalElements || 0);
                    setHasMore(pageData.hasNext || false);
                } else {
                    setProducts([]);
                    setTotalPages(0);
                    setTotalElements(0);
                    setHasMore(false);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message || 'Failed to load products');
                setProducts([]);
                setTotalPages(0);
                setTotalElements(0);
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchResults();
    }, [urlCategoryId, urlSearchQuery, urlCity, urlCategory, currentPage]);

    const decodedQuery    = urlSearchQuery ? decodeURIComponent(urlSearchQuery) : '';
    const decodedCity     = urlCity        ? decodeURIComponent(urlCity)        : '';
    const decodedCategory = urlCategory    ? decodeURIComponent(urlCategory)    : '';
    const resolvedCategory = categoryName || decodedCategory;

    const getPageTitle = () => {
        if (resolvedCategory && decodedCity) return `${resolvedCategory} in ${decodedCity}`;
        if (resolvedCategory)               return resolvedCategory;
        if (decodedQuery && decodedCity)    return `"${decodedQuery}" in ${decodedCity}`;
        if (decodedQuery)                   return `Results for "${decodedQuery}"`;
        if (decodedCity)                    return `Stores in ${decodedCity}`;
        return 'All Products';
    };

    const getPageSubtitle = () => {
        if (resolvedCategory && decodedCity)
            return `Browsing ${resolvedCategory} vendors and products in ${decodedCity}`;
        if (resolvedCategory)
            return `Explore all ${resolvedCategory} options from verified African vendors across Canada`;
        if (decodedQuery && decodedCity)
            return `Showing African food matching "${decodedQuery}" available in ${decodedCity}`;
        if (decodedQuery)
            return `African dishes and stores matching "${decodedQuery}" across Canada`;
        if (decodedCity)
            return `Discover authentic African cuisine from the best kitchens and stores in ${decodedCity}`;
        return 'Discover authentic African cuisine from the best kitchens and stores near you';
    };

    const getResultsLabel = () => {
        const count = totalElements;
        const noun  = count === 1 ? 'result' : 'results';
        if (resolvedCategory && decodedCity) return `${count} ${noun} in ${resolvedCategory} — ${decodedCity}`;
        if (resolvedCategory)               return `${count} ${noun} in ${resolvedCategory}`;
        if (decodedQuery && decodedCity)    return `${count} ${noun} for "${decodedQuery}" in ${decodedCity}`;
        if (decodedQuery)                   return `${count} ${noun} for "${decodedQuery}"`;
        if (decodedCity)                    return `${count} stores in ${decodedCity}`;
        return `${count} products available`;
    };

    const getEmptyStateMessage = () => {
        if (resolvedCategory && decodedCity)
            return `No ${resolvedCategory} products found in ${decodedCity}. Try browsing all stores or a different city.`;
        if (resolvedCategory)
            return `No products found in the ${resolvedCategory} category. Try browsing all stores.`;
        if (decodedQuery && decodedCity)
            return `No results for "${decodedQuery}" in ${decodedCity}. Try a different search term or city.`;
        if (decodedQuery)
            return `No results for "${decodedQuery}". Try a different search term.`;
        if (decodedCity)
            return `No stores found in ${decodedCity}. Try a different city.`;
        return "We couldn't find any products. Try searching for something specific.";
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 7;

        if (totalPages <= maxPagesToShow) {
            for (let i = 0; i < totalPages; i++) pages.push(i);
        } else {
            pages.push(0);
            const startPage = Math.max(1, currentPage - 1);
            const endPage   = Math.min(totalPages - 2, currentPage + 1);
            if (startPage > 1) pages.push('ellipsis-start');
            for (let i = startPage; i <= endPage; i++) pages.push(i);
            if (endPage < totalPages - 2) pages.push('ellipsis-end');
            pages.push(totalPages - 1);
        }

        return pages;
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = () => {
        setCurrentPage(0);
        router.push(`/restaurants?search=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(cityFilter)}`);
    };

    const handleClearAll = () => {
        setSearchQuery('');
        setCityFilter('');
        setCategoryName('');
        setCurrentPage(0);
        router.push('/restaurants');
    };

    const hasActiveFilters = !!(urlSearchQuery || urlCity || urlCategoryId || urlCategory);

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
                            href="/restaurants"
                            className="text-gray-400 hover:text-orange-600 font-medium transition-colors"
                        >
                            All Products
                        </Link>

                        {resolvedCategory && (
                            <>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                <Link
                                    href={`/restaurants?categoryId=${urlCategoryId}`}
                                    className="text-gray-400 hover:text-orange-600 font-medium transition-colors"
                                >
                                    {resolvedCategory}
                                </Link>
                            </>
                        )}

                        {decodedCity && (
                            <>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                <span className="text-gray-500 font-medium">{decodedCity}</span>
                            </>
                        )}

                        {decodedQuery && (
                            <>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                <span className="text-gray-700 font-semibold truncate max-w-45">
                                    &#34;{decodedQuery}&#34;
                                </span>
                            </>
                        )}

                        {!resolvedCategory && !decodedCity && !decodedQuery && (
                            <>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                <span className="text-gray-700 font-semibold">Browse</span>
                            </>
                        )}
                    </nav>

                    {/* Dynamic Title */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
                            {getPageTitle()}
                            {!isLoading && totalElements > 0 && (
                                <span className="block text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600 mt-1">
                                    {totalElements} {totalElements === 1 ? 'result' : 'results'} found
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl">
                            {getPageSubtitle()}
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                placeholder="Search Jollof Rice, Egusi, Suya, Groceries..."
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                            />
                        </div>

                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                placeholder="Calgary, Toronto, Vancouver..."
                                className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            className="flex items-center space-x-2 px-6 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-semibold whitespace-nowrap"
                        >
                            <HiSearch className="w-5 h-5" />
                            <span>Search</span>
                        </button>
                    </div>

                    {/* Results Count */}
                    {!isLoading && totalElements > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-semibold text-orange-600">
                                {getResultsLabel()}
                            </span>
                            {totalPages > 1 && (
                                <span>— Page {currentPage + 1} of {totalPages}</span>
                            )}
                        </div>
                    )}

                    {/* Active Filter Pills */}
                    {hasActiveFilters && !isLoading && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {(urlCategoryId || urlCategory) && resolvedCategory && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                    📂 {resolvedCategory}
                                </span>
                            )}
                            {urlSearchQuery && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                    🔍 {decodedQuery}
                                </span>
                            )}
                            {urlCity && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                    📍 {decodedCity}
                                </span>
                            )}
                            <button
                                onClick={handleClearAll}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full hover:bg-gray-200 transition-colors"
                            >
                                ✕ Clear all
                            </button>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            <p className="font-semibold">Error loading results</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Products Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
                        {[...Array(20)].map((_, index) => (
                            <StoreCardSkeleton key={index} />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
                            {products.map((product, index) => (
                                <div
                                    key={product.publicProductId}
                                    className="animate-fade-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <StoreCard store={product} priority={index < 3} />
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
                                        {getPageNumbers().map((page, index) => (
                                            typeof page === 'number' ? (
                                                <button
                                                    key={index}
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
                                                <span key={index} className="px-2 text-gray-400">...</span>
                                            )
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={!hasMore}
                                        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-orange-50 hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700"
                                    >
                                        Next
                                    </button>
                                </div>

                                <p className="text-center text-gray-400 text-sm">
                                    Showing {products.length} of {totalElements} on page {currentPage + 1} of {totalPages}
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
                                No results found
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {getEmptyStateMessage()}
                            </p>
                            <button
                                onClick={handleClearAll}
                                className="inline-block px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors"
                            >
                                Browse All Products
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplayRestaurant;