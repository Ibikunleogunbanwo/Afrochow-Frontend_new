"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HiArrowLeft, HiSearch } from 'react-icons/hi';
import StoreCard from '@/components/home/cards/storeCard';
import StoreCardSkeleton from "@/components/home/cards/StoreCardSkeleton";
import { SearchAPI } from '@/lib/api/search.api';

const DisplayRestaurant = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSearchQuery = searchParams.get('search') || '';
    const urlCity = searchParams.get('city') || '';
    const urlCategoryId = searchParams.get('categoryId') || '';
    const urlCategory = searchParams.get('category') || '';

    const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
    const [cityFilter, setCityFilter] = useState(urlCity);
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const pageSize = 20;

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setIsLoading(true);
                setError(null);

                let response;

                if (urlCategoryId || urlSearchQuery) {
                    response = await SearchAPI.searchProductsAdvanced({
                        ...(urlSearchQuery && { query: urlSearchQuery }),
                        ...(urlCity && { city: urlCity }),
                        ...(urlCategoryId && { categoryId: urlCategoryId }),
                        page: currentPage,
                        size: pageSize,
                    });
                } else if (urlCity || urlCategory) {
                    response = await SearchAPI.searchProducts({
                        ...(urlCity && { city: urlCity }),
                        ...(urlCategory && { category: urlCategory }),
                        page: currentPage,
                        size: pageSize,
                    });
                } else {
                    response = await SearchAPI.searchProductsAdvanced({
                        page: currentPage,
                        size: pageSize,
                    });
                }

                if (response?.success && response?.data) {
                    const pageData = response.data;
                    const productList = pageData.content || [];

                    // fetch vendor data in parallel
                    const vendorsResponse = await SearchAPI.getVerifiedVendors();
                    const vendors = Array.isArray(vendorsResponse) ? vendorsResponse : [];

                    // build vendor lookup map
                    const vendorMap = vendors.reduce((map, vendor) => {
                        map[vendor.publicUserId] = vendor;
                        return map;
                    }, {});

                    const transformedResults = productList.map(product => {
                        const vendor = vendorMap[product.vendorPublicId] || {};

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

                    // open first, closed at the bottom
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

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 7;

        if (totalPages <= maxPagesToShow) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(0);

            const startPage = Math.max(1, currentPage - 1);
            const endPage = Math.min(totalPages - 2, currentPage + 1);

            if (startPage > 1) pages.push('ellipsis-start');

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

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

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="container px-4 mx-auto max-w-7xl">

                {/* Header Section */}
                <div className="mb-12">
                    {/* Back Button */}
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-semibold mb-6 transition-colors group"
                    >
                        <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Home</span>
                    </Link>

                    {/* Title */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
                            All Products
                            {!isLoading && totalElements > 0 && (
                                <span className="block text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">
                                    {totalElements} Amazing Dishes
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl">
                            Discover authentic African cuisine from the best kitchens and stores near you
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
                            className="flex items-center space-x-2 px-6 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-semibold"
                        >
                            <HiSearch className="w-5 h-5" />
                            <span>Search</span>
                        </button>
                    </div>

                    {/* Results Count */}
                    {!isLoading && totalElements > 0 && (
                        <div className="mt-4 text-gray-600">
                            Found <span className="font-bold text-orange-600">{totalElements}</span> products
                            {urlSearchQuery && ` matching "${decodeURIComponent(urlSearchQuery)}"`}
                            {urlCity && ` in ${decodeURIComponent(urlCity)}`}
                            {totalPages > 1 && (
                                <span> — Page {currentPage + 1} of {totalPages}</span>
                            )}
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
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-orange-50 hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all font-semibold text-gray-700"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {getPageNumbers().map((page, index) => (
                                            typeof page === 'number' ? (
                                                <button
                                                    key={index}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`min-w-[40px] px-3 py-2 rounded-lg font-semibold transition-all ${
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
                                        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-orange-50 hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all font-semibold text-gray-700"
                                    >
                                        Next
                                    </button>
                                </div>

                                <div className="text-center text-gray-500 text-sm">
                                    Showing {products.length} products on page {currentPage + 1} of {totalPages}
                                </div>
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
                                No products found
                            </h3>
                            <p className="text-gray-600 mb-6">
                                We couldn&#39;t find any products matching your search. Try a different search term or city.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setCityFilter('');
                                    setCurrentPage(0);
                                    router.push('/restaurants');
                                }}
                                className="inline-block px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors"
                            >
                                Clear Search
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplayRestaurant;