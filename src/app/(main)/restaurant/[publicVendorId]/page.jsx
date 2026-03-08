'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
    Star,
    MapPin,
    Clock,
    Phone,
    Truck,
    ShoppingBag,
    ChevronDown,
    MessageSquare,
    Filter,
    X
} from 'lucide-react';
import { AuthAPI } from '@/lib/api/auth';

const VendorProfilePage = () => {
    const params = useParams();
    const publicVendorId = params.publicVendorId;

    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [reviewType, setReviewType] = useState('vendor'); // 'vendor' or 'product'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [ratingFilter, setRatingFilter] = useState(0);

    useEffect(() => {
        if (publicVendorId) {
            void fetchVendorDetails();
            void fetchVendorProducts();
        }
    }, [publicVendorId]);

    const fetchVendorDetails = async () => {
        try {
            setLoading(true);
            const response = await AuthAPI.getVendorDetails(publicVendorId);

            console.log('Vendor data:', response);
            if (response?.success && response?.data) {
                setVendor(response.data);
            }
        } catch (error) {
            console.error('Error fetching vendor details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVendorProducts = async (page = 0) => {
        try {
            setProductsLoading(true);
            const response = await AuthAPI.getVendorProducts(publicVendorId, page, 20);

            if (response?.success && response?.data) {
                setProducts(response.data);
            } else if (Array.isArray(response)) {
                setProducts(response);
            }
        } catch (error) {
            console.error('Error fetching vendor products:', error);
            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchVendorReviews = async (minRating = 0) => {
        try {
            const response = minRating > 0
                ? await AuthAPI.filterVendorReviews(publicVendorId, minRating)
                : await AuthAPI.getVendorReviews(publicVendorId);

            if (response?.success && response?.data) {
                setReviews(response.data);
            } else if (Array.isArray(response)) {
                setReviews(response);
            }
        } catch (error) {
            console.error('Error fetching vendor reviews:', error);
            setReviews([]);
        }
    };

    const fetchProductReviews = async (productPublicId) => {
        try {
            const response = await AuthAPI.getProductReviews(productPublicId);

            if (response?.success && response?.data) {
                setReviews(response.data);
            } else if (Array.isArray(response)) {
                setReviews(response);
            }
        } catch (error) {
            console.error('Error fetching product reviews:', error);
            setReviews([]);
        }
    };

    const handleViewVendorReviews = () => {
        setReviewType('vendor');
        setSelectedProduct(null);
        void fetchVendorReviews(ratingFilter);
        setShowReviewsModal(true);
    };

    const handleViewProductReviews = (product) => {
        setReviewType('product');
        setSelectedProduct(product);
        void fetchProductReviews(product.publicProductId);
        setShowReviewsModal(true);
    };

    const handleRatingFilterChange = (rating) => {
        setRatingFilter(rating);
        if (reviewType === 'vendor') {
            void fetchVendorReviews(rating);
        }
    };

    const formatOperatingHours = (operatingHours) => {
        if (!operatingHours) return null;

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

        return operatingHours[today];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="animate-pulse">
                    <div className="w-full h-80 bg-gray-300" />
                    <div className="container mx-auto px-4 py-8 max-w-7xl">
                        <div className="h-32 bg-gray-300 rounded-xl mb-6" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h2>
                    <p className="text-gray-600">The restaurant you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    const todayHours = formatOperatingHours(vendor.operatingHours);
    const isOpenNow = todayHours?.isOpen || false;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Banner Section */}
            <div className="relative w-full h-80 bg-gradient-to-r from-orange-500 to-red-500">
                {vendor.bannerUrl ? (
                    <Image
                        src={vendor.bannerUrl}
                        alt={vendor.restaurantName}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-9xl">🍽️</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>

            {/* Vendor Info Section */}
            <div className="container mx-auto px-4 -mt-20 relative z-10 max-w-7xl">
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-white">
                                {vendor.logoUrl ? (
                                    <Image
                                        src={vendor.logoUrl}
                                        alt={vendor.restaurantName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                                        <span className="text-5xl">🍴</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-4xl font-black text-gray-900 mb-2">
                                        {vendor.restaurantName}
                                        {vendor.isVerified && (
                                            <span className="ml-2 text-blue-600" title="Verified">✓</span>
                                        )}
                                    </h1>
                                    <p className="text-lg text-gray-600 mb-3">{vendor.cuisineType}</p>

                                    {/* Rating */}
                                    <button
                                        onClick={handleViewVendorReviews}
                                        className="inline-flex items-center space-x-2 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                            <span className="text-xl font-bold text-gray-900">
                                                {vendor.averageRating?.toFixed(1) || '0.0'}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            ({vendor.reviewCount || 0} reviews)
                                        </span>
                                    </button>
                                </div>

                                {/* Status Badge */}
                                <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                                    isOpenNow
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {isOpenNow ? '🟢 Open Now' : '🔴 Closed'}
                                </div>
                            </div>

                            {/* Description */}
                            {vendor.description && (
                                <p className="text-gray-700 mb-4 leading-relaxed">
                                    {vendor.description}
                                </p>
                            )}

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Location */}
                                <div className="flex items-start space-x-3">
                                    <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Location</p>
                                        <p className="text-sm text-gray-600">{vendor.formattedAddress}</p>
                                    </div>
                                </div>

                                {/* Hours */}
                                {todayHours && (
                                    <div className="flex items-start space-x-3">
                                        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Today's Hours</p>
                                            <p className="text-sm text-gray-600">
                                                {todayHours.openTime} - {todayHours.closeTime}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Delivery */}
                                {vendor.offersDelivery && (
                                    <div className="flex items-start space-x-3">
                                        <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Delivery</p>
                                            <p className="text-sm text-gray-600">
                                                ${vendor.deliveryFee?.toFixed(2)} • {vendor.estimatedDeliveryMinutes} min
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Pickup */}
                                {vendor.offersPickup && (
                                    <div className="flex items-start space-x-3">
                                        <ShoppingBag className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Pickup</p>
                                            <p className="text-sm text-gray-600">
                                                Available • {vendor.preparationTime} min prep
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Minimum Order */}
                                {vendor.minimumOrderAmount && (
                                    <div className="flex items-start space-x-3">
                                        <span className="text-orange-600 flex-shrink-0 mt-0.5">💰</span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Minimum Order</p>
                                            <p className="text-sm text-gray-600">
                                                ${vendor.minimumOrderAmount?.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-black text-gray-900">Menu</h2>
                        <p className="text-gray-600">{products.length} items</p>
                    </div>

                    {productsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.publicProductId}
                                    product={product}
                                    onViewReviews={() => handleViewProductReviews(product)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl">
                            <p className="text-gray-500">No menu items available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Modal */}
            {showReviewsModal && (
                <ReviewsModal
                    isOpen={showReviewsModal}
                    onClose={() => setShowReviewsModal(false)}
                    reviews={reviews}
                    reviewType={reviewType}
                    vendorName={vendor.restaurantName}
                    productName={selectedProduct?.name}
                    ratingFilter={ratingFilter}
                    onRatingFilterChange={handleRatingFilterChange}
                />
            )}
        </div>
    );
};

// Product Card Component
const ProductCard = ({ product, onViewReviews }) => {
    return (
        <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Image */}
            <div className="relative w-full h-48 bg-gray-200">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                        <span className="text-6xl">🍲</span>
                    </div>
                )}

                {/* Availability Badge */}
                {!product.available && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        Unavailable
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {product.description}
                    </p>
                    {product.categoryName && (
                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                            {product.categoryName}
                        </span>
                    )}
                </div>

                {/* Rating */}
                <button
                    onClick={onViewReviews}
                    className="flex items-center space-x-1 mb-3 hover:bg-gray-50 px-2 py-1 rounded transition-colors -ml-2"
                >
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-gray-900">
                        {product.averageRating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-xs text-gray-500">
                        ({product.reviewCount || 0})
                    </span>
                </button>

                {/* Price */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-2xl font-black text-orange-600">
                        ${product.price?.toFixed(2)}
                    </span>
                    <button
                        disabled={!product.available}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                            product.available
                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

// Reviews Modal Component
const ReviewsModal = ({
    isOpen,
    onClose,
    reviews,
    reviewType,
    vendorName,
    productName,
    ratingFilter,
    onRatingFilterChange
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">
                                {reviewType === 'vendor' ? vendorName : productName} Reviews
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Filter */}
                    {reviewType === 'vendor' && (
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <Filter className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-700">Minimum Rating:</span>
                                <select
                                    value={ratingFilter}
                                    onChange={(e) => onRatingFilterChange(Number(e.target.value))}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value={0}>All Ratings</option>
                                    <option value={4}>4+ Stars</option>
                                    <option value={3}>3+ Stars</option>
                                    <option value={2}>2+ Stars</option>
                                    <option value={1}>1+ Stars</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <ReviewCard key={review.reviewId} review={review} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No reviews yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Review Card Component
const ReviewCard = ({ review }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="font-bold text-gray-900">{review.userName}</h4>
                    <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${
                                i < review.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-300'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {review.comment && (
                <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
            )}

            {review.helpfulCount > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>👍</span>
                    <span>{review.helpfulCount} found this helpful</span>
                </div>
            )}
        </div>
    );
};

export default VendorProfilePage;
