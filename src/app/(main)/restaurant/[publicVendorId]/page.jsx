'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Star,
    MapPin,
    Clock,
    Truck,
    ChevronRight,
    Home,
    Store,
    BadgeCheck,
} from 'lucide-react';
import { SearchAPI } from '@/lib/api/search.api';
import { ReviewsAPI } from '@/lib/api/reviews.api';
import { PromotionsAPI } from '@/lib/api';
import StoreCard from '@/components/home/cards/storeCard';
import ProductDetailModal from '@/components/register/vendor/ProductDetailModal';
import ProductCard from '@/components/register/vendor/vendorComponent/ProductCard';
import ReviewsModal from '@/components/register/vendor/vendorComponent/ReviewsModal';
import WriteReviewModal from '@/components/register/vendor/vendorComponent/WriteReviewModal';

// ─── helpers ─────────────────────────────────────────────────────────────────

const unwrapResponse = (response) => {
    if (response?.success && response?.data) return response.data;
    if (Array.isArray(response)) return response;
    return [];
};

const SKELETON_COUNTS = {
    products: 6,
    relatedVendors: 4,
    relatedProducts: 6,
};

// ─── Module-level cache keyed by publicVendorId ───────────────────────────────
// Caches vendor details, products, related vendors and related products together.
// Reviews are excluded — they are fetched on demand when the modal opens.
// On back navigation the component remounts, finds the cache populated,
// skips all fetches and renders instantly so scroll position is restored.
const vendorCache = {};

// ─── component ────────────────────────────────────────────────────────────────

const VendorProfilePage = () => {
    const params = useParams();
    const publicVendorId = params.publicVendorId;

    const cached = vendorCache[publicVendorId];

    const [vendor, setVendor]               = useState(cached?.vendor || null);
    const [products, setProducts]           = useState(cached?.products || []);
    const [vendorPromos, setVendorPromos]   = useState(cached?.vendorPromos || []);
    const [relatedVendors, setRelatedVendors] = useState(cached?.relatedVendors || []);
    const [relatedProducts, setRelatedProducts] = useState(cached?.relatedProducts || []);

    const [loading, setLoading]               = useState(!cached?.vendor);
    const [productsLoading, setProductsLoading] = useState(!cached?.products);
    const [relatedLoading, setRelatedLoading]   = useState(!cached?.relatedVendors);

    const [selectedProductModal, setSelectedProductModal] = useState(null);
    const [productModalLoading, setProductModalLoading]   = useState(false);

    const [reviews, setReviews]               = useState([]);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [reviewType, setReviewType]         = useState('vendor');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [ratingFilter, setRatingFilter]     = useState(0);

    const [showWriteReview, setShowWriteReview]       = useState(false);
    const [writeReviewProduct, setWriteReviewProduct] = useState(null);

    // ── data fetching ─────────────────────────────────────────────────────────

    const fetchRelatedContent = useCallback(async (cuisineType, currentVendorId) => {
        if (!cuisineType) return;

        // Cache hit — already have related content for this vendor
        if (vendorCache[currentVendorId]?.relatedVendors) return;

        try {
            setRelatedLoading(true);

            const [vendorsRes, productsRes] = await Promise.all([
                SearchAPI.getVendorsByCuisine(cuisineType),
                SearchAPI.searchProductsAdvanced({ query: cuisineType, size: 10 }),
            ]);

            const vendors = Array.isArray(vendorsRes) ? vendorsRes : [];

            const filteredVendors = vendors
                .filter(v => v.publicUserId !== currentVendorId)
                .slice(0, SKELETON_COUNTS.relatedVendors)
                .map(v => ({
                    storeId: v.publicUserId,
                    vendorPublicId: v.publicUserId,
                    name: v.restaurantName,
                    restaurantName: v.restaurantName,
                    rating: v.averageRating || 0,
                    categories: v.cuisineType ? [v.cuisineType] : [],
                    deliveryTime: v.estimatedDeliveryMinutes || 30,
                    deliveryFee: v.deliveryFee || 0,
                    location: v.address?.city && v.address?.province
                        ? `${v.address.city}, ${v.address.province}`
                        : v.address?.city || '',
                    popularItems: v.bannerUrl
                        ? [{ name: v.restaurantName, imageUrl: v.bannerUrl }]
                        : v.logoUrl
                            ? [{ name: v.restaurantName, imageUrl: v.logoUrl }]
                            : [],
                    isOpenNow: v.isOpenNow,
                    todayHoursFormatted: v.todayHoursFormatted,
                    offersPickup: v.offersPickup ?? false,
                }));

            const productList = productsRes?.success && productsRes?.data
                ? productsRes.data.content || []
                : [];

            const filteredProducts = productList
                .filter(p => p.vendorPublicId !== currentVendorId)
                .slice(0, SKELETON_COUNTS.relatedProducts);

            // Write related content into cache
            vendorCache[currentVendorId] = {
                ...vendorCache[currentVendorId],
                relatedVendors: filteredVendors,
                relatedProducts: filteredProducts,
            };

            setRelatedVendors(filteredVendors);
            setRelatedProducts(filteredProducts);
        } catch (error) {
            console.error('Error fetching related content:', error);
            setRelatedVendors([]);
            setRelatedProducts([]);
        } finally {
            setRelatedLoading(false);
        }
    }, []);

    const fetchVendorDetails = useCallback(async () => {
        // Cache hit — skip fetch
        if (vendorCache[publicVendorId]?.vendor) return;

        try {
            setLoading(true);
            const response = await SearchAPI.getVendorDetails(publicVendorId);

            if (response?.success && response?.data) {
                const vendorData = response.data;

                // Write vendor into cache
                vendorCache[publicVendorId] = {
                    ...vendorCache[publicVendorId],
                    vendor: vendorData,
                    vendorPromos: [],
                };

                setVendor(vendorData);

                // Fetch vendor promos in the background — never blocks page render
                PromotionsAPI.getVendorPromotions(publicVendorId)
                    .then(res => {
                        const promos = res?.success && Array.isArray(res.data)
                            ? res.data
                            : Array.isArray(res) ? res : [];
                        vendorCache[publicVendorId] = {
                            ...vendorCache[publicVendorId],
                            vendorPromos: promos,
                        };
                        setVendorPromos(promos);
                    })
                    .catch(() => { /* promos are optional */ });

                await fetchRelatedContent(vendorData.cuisineType, publicVendorId);
            }
        } catch (error) {
            console.error('Error fetching vendor details:', error);
        } finally {
            setLoading(false);
        }
    }, [publicVendorId, fetchRelatedContent]);

    const fetchVendorProducts = useCallback(async (page = 0) => {
        // Cache hit — skip fetch
        if (vendorCache[publicVendorId]?.products) return;

        try {
            setProductsLoading(true);
            const response = await SearchAPI.getVendorProducts(publicVendorId, page, 20);
            const productData = response?.success && response?.data
                ? response.data
                : Array.isArray(response) ? response : [];

            // Render cards immediately with list data
            setProducts(productData);

            // Enrich each product with full details (dietary flags etc.) in the background.
            // The list endpoint returns a lighter DTO that omits isVegetarian/isVegan/isGlutenFree/isSpicy.
            // Promise.allSettled ensures one failed fetch never blocks the rest.
            if (productData.length > 0) {
                Promise.allSettled(
                    productData.map(p => SearchAPI.getProductById(p.publicProductId))
                ).then(results => {
                    const enriched = productData.map((product, i) => {
                        const result = results[i];
                        if (result.status === 'fulfilled' && result.value?.success && result.value?.data) {
                            const d = result.value.data;
                            return {
                                ...product,
                                isVegetarian: d.isVegetarian ?? product.isVegetarian ?? false,
                                isVegan:      d.isVegan      ?? product.isVegan      ?? false,
                                isGlutenFree: d.isGlutenFree ?? product.isGlutenFree ?? false,
                                isSpicy:      d.isSpicy      ?? product.isSpicy      ?? false,
                            };
                        }
                        return product;
                    });

                    vendorCache[publicVendorId] = {
                        ...vendorCache[publicVendorId],
                        products: enriched,
                    };
                    setProducts(enriched);
                });
            } else {
                vendorCache[publicVendorId] = {
                    ...vendorCache[publicVendorId],
                    products: productData,
                };
            }
        } catch (error) {
            console.error('Error fetching vendor products:', error);
            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    }, [publicVendorId]);

    // Reviews are never cached — always fresh on modal open
    const fetchVendorReviews = useCallback(async (minRating = 0) => {
        try {
            const response = minRating > 0
                ? await ReviewsAPI.filterVendorReviews(publicVendorId, minRating)
                : await ReviewsAPI.getVendorsReviews(publicVendorId);
            setReviews(unwrapResponse(response));
        } catch (error) {
            console.error('Error fetching vendor reviews:', error);
            setReviews([]);
        }
    }, [publicVendorId]);

    const fetchProductReviews = useCallback(async (productPublicId) => {
        try {
            const response = await ReviewsAPI.getProductReviews(productPublicId);
            setReviews(unwrapResponse(response));
        } catch (error) {
            console.error('Error fetching product reviews:', error);
            setReviews([]);
        }
    }, []);

    useEffect(() => {
        if (!publicVendorId) return;

        // If fully cached — restore state and skip all fetches
        if (vendorCache[publicVendorId]?.vendor) {
            const c = vendorCache[publicVendorId];
            setVendor(c.vendor);
            setProducts(c.products || []);
            setVendorPromos(c.vendorPromos || []);
            setRelatedVendors(c.relatedVendors || []);
            setRelatedProducts(c.relatedProducts || []);
            setLoading(false);
            setProductsLoading(false);
            setRelatedLoading(false);
            return;
        }

        // Cache miss — fetch everything
        fetchVendorDetails();
        fetchVendorProducts();
    }, [publicVendorId, fetchVendorDetails, fetchVendorProducts]);

    // ── event handlers ────────────────────────────────────────────────────────

    const handleProductCardClick = useCallback(async (product) => {
        try {
            setProductModalLoading(true);
            setSelectedProductModal(product);
            const response = await SearchAPI.getProductById(product.publicProductId);
            if (response?.success && response?.data) {
                setSelectedProductModal(response.data);
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
        } finally {
            setProductModalLoading(false);
        }
    }, []);

    const handleViewVendorReviews = useCallback(() => {
        setReviewType('vendor');
        setSelectedProduct(null);
        setShowReviewsModal(true);
        fetchVendorReviews(ratingFilter);
    }, [fetchVendorReviews, ratingFilter]);

    const handleViewProductReviews = useCallback((product) => {
        setReviewType('product');
        setSelectedProduct(product);
        setShowReviewsModal(true);
        fetchProductReviews(product.publicProductId);
    }, [fetchProductReviews]);

    const handleRatingFilterChange = useCallback((rating) => {
        setRatingFilter(rating);
        if (reviewType === 'vendor') {
            fetchVendorReviews(rating);
        }
    }, [reviewType, fetchVendorReviews]);

    const handleCloseProductModal = useCallback(() => setSelectedProductModal(null), []);
    const handleCloseReviewsModal = useCallback(() => setShowReviewsModal(false), []);

    const handleWriteVendorReview = useCallback(() => {
        setWriteReviewProduct(null);
        setShowWriteReview(true);
    }, []);

    const handleWriteProductReview = useCallback((product) => {
        setWriteReviewProduct(product);
        setShowWriteReview(true);
    }, []);

    const handleReviewSuccess = useCallback(() => {
        if (showReviewsModal && reviewType === 'vendor') fetchVendorReviews(ratingFilter);
        if (showReviewsModal && reviewType === 'product') fetchProductReviews(writeReviewProduct?.publicProductId);
    }, [showReviewsModal, reviewType, fetchVendorReviews, fetchProductReviews, ratingFilter, writeReviewProduct]);

    // ── render states ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="animate-pulse">
                    <div className="w-full h-80 bg-gray-300" />
                    <div className="container mx-auto px-4 py-8 max-w-7xl">
                        <div className="h-32 bg-gray-300 rounded-xl mb-6" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(SKELETON_COUNTS.products)].map((_, i) => (
                                <div key={i} className="h-64 bg-gray-300 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h2>
                    <p className="text-gray-600">The store you&#39;re looking for doesn&#39;t exist.</p>
                </div>
            </div>
        );
    }

    const {
        restaurantName,
        cuisineType,
        logoUrl,
        bannerUrl,
        isVerified,
        isOpenNow,
        description,
        averageRating,
        reviewCount,
        todayHoursFormatted,
        offersDelivery,
        offersPickup,
        deliveryFee,
        estimatedDeliveryMinutes,
        preparationTime,
        minimumOrderAmount,
        address,
    } = vendor;

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100 px-4 py-3">
                <div className="container mx-auto max-w-7xl">
                    <nav className="flex items-center gap-1.5 text-sm flex-wrap" aria-label="Breadcrumb">
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

                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />

                        <span className="text-gray-700 font-semibold truncate max-w-50">
                            {restaurantName}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Banner */}
            <div className="relative w-full h-80 bg-linear-to-r from-orange-500 to-red-500">
                {bannerUrl ? (
                    <Image
                        src={bannerUrl}
                        alt={restaurantName}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-9xl">🍽️</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-10 max-w-7xl">

                {/* Vendor Info */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-6">

                        {/* Logo */}
                        <div className="shrink-0">
                            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-white">
                                {logoUrl ? (
                                    <Image
                                        src={logoUrl}
                                        alt={restaurantName}
                                        fill
                                        sizes="128px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-100 to-red-100">
                                        <span className="text-5xl">🍴</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                                <div>
                                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-2">
                                        {restaurantName}
                                        {isVerified && (
                                            <BadgeCheck className="inline-block ml-2 w-6 h-6 text-blue-500 shrink-0" title="Verified vendor" />
                                        )}
                                    </h1>
                                    <p className="text-lg text-gray-600 mb-3">{cuisineType}</p>

                                    <div className="flex items-center gap-3 flex-wrap">
                                        <button
                                            onClick={handleViewVendorReviews}
                                            className="inline-flex items-center space-x-2 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-center space-x-1">
                                                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                                <span className="text-xl font-bold text-gray-900">
                                                    {averageRating?.toFixed(1) || '0.0'}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                ({reviewCount || 0} reviews)
                                            </span>
                                        </button>
                                        <button
                                            onClick={handleWriteVendorReview}
                                            className="px-3 py-1.5 text-sm font-semibold text-orange-600 border border-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
                                        >
                                            Write a Review
                                        </button>
                                    </div>
                                </div>

                                <div className={`self-start shrink-0 px-3 py-1.5 rounded-full font-bold text-xs md:text-sm whitespace-nowrap ${
                                    isOpenNow
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {isOpenNow ? '🟢 Open Now' : '🔴 Closed'}
                                </div>
                            </div>

                            {description && (
                                <p className="text-gray-700 mb-4 leading-relaxed">{description}</p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {address?.formattedAddress && (
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Location</p>
                                            <p className="text-sm text-gray-600">{address.formattedAddress}</p>
                                        </div>
                                    </div>
                                )}

                                {todayHoursFormatted && (
                                    <div className="flex items-start space-x-3">
                                        <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Hours of Operation</p>
                                            <p className="text-sm text-gray-600">{todayHoursFormatted}</p>
                                        </div>
                                    </div>
                                )}

                                {offersDelivery && (
                                    <div className="flex items-start space-x-3">
                                        <Truck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Delivery</p>
                                            <p className="text-sm text-gray-600">
                                                CA${deliveryFee?.toFixed(2)} • {estimatedDeliveryMinutes} min
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {offersPickup && (
                                    <div className="flex items-start space-x-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
                                        <Store className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-teal-900">Store pickup available</p>
                                            <p className="text-xs text-teal-600 mt-0.5">
                                                Skip delivery — pick up your order in {preparationTime ?? '—'} min
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {minimumOrderAmount && (
                                    <div className="flex items-start space-x-3">
                                        <span className="text-orange-600 shrink-0 mt-0.5">💰</span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Min Delivery Order</p>
                                            <p className="text-sm text-gray-600">
                                                CA${minimumOrderAmount?.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-black text-gray-900">Menu</h2>
                        <p className="text-gray-600">{products.length} items</p>
                    </div>

                    {productsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(SKELETON_COUNTS.products)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.publicProductId}
                                    product={product}
                                    promotions={vendorPromos}
                                    onViewReviews={() => handleViewProductReviews(product)}
                                    onCardClick={() => handleProductCardClick(product)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl">
                            <p className="text-gray-500">No menu items available</p>
                        </div>
                    )}
                </div>

                {/* Related Stores */}
                {(relatedLoading || relatedVendors.length > 0) && (
                    <div className="mb-12">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-gray-900">
                                More {cuisineType} Stores
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Other stores you might like</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedLoading
                                ? [...Array(SKELETON_COUNTS.relatedVendors)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
                                ))
                                : relatedVendors.map((store) => (
                                    <StoreCard key={store.storeId} store={store} />
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* Related Products */}
                {(relatedLoading || relatedProducts.length > 0) && (
                    <div className="mb-12">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-gray-900">
                                Popular {cuisineType} Dishes
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Loved by customers near you</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedLoading
                                ? [...Array(SKELETON_COUNTS.relatedProducts)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
                                ))
                                : relatedProducts.map((product) => (
                                    <ProductCard
                                        key={product.publicProductId}
                                        product={product}
                                        promotions={vendorPromos}
                                        onViewReviews={() => handleViewProductReviews(product)}
                                        onCardClick={() => handleProductCardClick(product)}
                                    />
                                ))
                            }
                        </div>
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            {selectedProductModal && (
                <ProductDetailModal
                    product={selectedProductModal}
                    vendorName={restaurantName}
                    isLoading={productModalLoading}
                    isStoreOpen={isOpenNow}
                    onClose={handleCloseProductModal}
                    onViewReviews={() => {
                        handleCloseProductModal();
                        handleViewProductReviews(selectedProductModal);
                    }}
                    onWriteReview={() => handleWriteProductReview(selectedProductModal)}
                />
            )}

            {/* Reviews Modal */}
            {showReviewsModal && (
                <ReviewsModal
                    isOpen={showReviewsModal}
                    onClose={handleCloseReviewsModal}
                    reviews={reviews}
                    reviewType={reviewType}
                    vendorName={restaurantName}
                    productName={selectedProduct?.name}
                    ratingFilter={ratingFilter}
                    onRatingFilterChange={handleRatingFilterChange}
                    onWriteReview={
                        reviewType === 'product'
                            ? () => handleWriteProductReview(selectedProduct)
                            : handleWriteVendorReview
                    }
                    onMarkHelpful={(reviewId) => ReviewsAPI.markHelpful(reviewId)}
                />
            )}

            {/* Write Review Modal */}
            <WriteReviewModal
                isOpen={showWriteReview}
                onClose={() => setShowWriteReview(false)}
                vendorPublicId={publicVendorId}
                vendorName={vendor?.restaurantName}
                product={writeReviewProduct}
                onSuccess={handleReviewSuccess}
            />
        </div>
    );
};

export default VendorProfilePage;