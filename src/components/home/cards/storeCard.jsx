"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { Heart, Star, Clock, Truck, MapPin } from 'lucide-react';
import Image from 'next/image';
import StoreCardSkeleton from '@/components/home/cards/StoreCardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { SignInModal } from "@/components/signin/SignInModal";

const useStoreOpenStatus = (openingHour, closingHour) => {
    return useMemo(() => {
        const now = new Date();
        const currentHour = now.getHours();

        return openingHour >= closingHour
            ? currentHour >= openingHour || currentHour < closingHour
            : currentHour >= openingHour && currentHour < closingHour;
    }, [openingHour, closingHour]);
};

const StoreCard = ({ store, isLoading = false, priority = false }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    const openingHour = store?.openingHour ?? 0;
    const closingHour = store?.closingHour ?? 0;

    const isOpen = useStoreOpenStatus(openingHour, closingHour);

    if (isLoading) {
        return <StoreCardSkeleton />;
    }

    if (!store) {
        return null;
    }

    const {
        storeId,
        name,
        rating,
        categories,
        deliveryTime,
        popularItems,
        location,
        deliveryFee,
        restaurantName,
        vendorPublicId,
    } = store;

    const imageUrl = popularItems?.length > 0
        ? popularItems[0].imageUrl
        : '/image/amala.jpg';

    const categoryDisplay = Array.isArray(categories) && categories.length > 0
        ? categories.slice(0, 2).join(' • ')
        : 'African Cuisine';

    const formatTime = (hour) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${formattedHour}${period}`;
    };

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFavorite((prev) => !prev);
    };

    const handleCardClick = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setShowSignIn(true);
        } else {
            const restaurantId = vendorPublicId || storeId;
            router.push(`/restaurant/${restaurantId}`);
        }
    };

    return (
        <>
            <div
                onClick={handleCardClick}
                className="group block cursor-pointer"
            >
                <div className="relative overflow-hidden transition-all duration-300 bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1">

                    {/* Image Container */}
                    <div className="relative w-full h-56 overflow-hidden bg-gray-200">
                        {!imageError ? (
                            <>
                                <Image
                                    src={imageUrl}
                                    alt={name}
                                    fill
                                    className={`object-cover transition-all duration-500 group-hover:scale-110 ${
                                        imageLoaded ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => setImageError(true)}
                                    quality={75}
                                    priority={priority}
                                    loading={priority ? 'eager' : 'lazy'}
                                />
                                {!imageLoaded && (
                                    <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300 animate-pulse" />
                                )}
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-orange-100 to-red-100">
                                <span className="text-4xl">🍲</span>
                            </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Favorite Button */}
                        <button
                            onClick={handleFavoriteClick}
                            className="absolute z-10 p-2.5 transition-all duration-300 rounded-full top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
                            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <Heart
                                className={`w-5 h-5 transition-colors ${
                                    isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                }`}
                            />
                        </button>

                        {/* Rating Badge */}
                        <div className="absolute flex items-center px-3 py-1.5 space-x-1 rounded-full top-3 left-3 bg-white/95 backdrop-blur-sm shadow-lg">
                            <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
                            <span className="text-sm font-bold text-gray-900">{rating.toFixed(1)}</span>
                        </div>

                        {/* Status Badge */}
                        <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg ${
                            isOpen
                                ? 'bg-green-500/90 text-white'
                                : 'bg-red-500/90 text-white'
                        }`}>
                            {isOpen ? '🟢 Open Now' : '🔴 Closed'}
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="p-5 space-y-3">

                        {/* Restaurant Name */}
                        {restaurantName && (
                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                {restaurantName}
                            </h3>
                        )}

                        {/* Product Name */}
                        <p className="text-sm font-medium text-gray-700 line-clamp-1">
                            {name}
                        </p>

                        {/* Categories */}
                        <div className="flex items-center space-x-2">
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 line-clamp-1">
                                    {categoryDisplay}
                                </p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">

                            {/* Delivery Time */}
                            <div className="flex items-center space-x-2 text-gray-600">
                                <div className="p-1.5 bg-orange-100 rounded-lg">
                                    <Truck className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Delivery</p>
                                    <p className="text-sm font-semibold text-gray-900">{deliveryTime} min</p>
                                </div>
                            </div>

                            {/* Opening Hours */}
                            <div className="flex items-center space-x-2 text-gray-600">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Hours</p>
                                    <p className="text-xs font-normal text-gray-900">
                                        {formatTime(openingHour)}-{formatTime(closingHour)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Fee & Location */}
                        {(deliveryFee !== undefined || location) && (
                            <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                                {deliveryFee !== undefined && (
                                    <span className="font-semibold text-orange-600">
                                        {deliveryFee === 0 || deliveryFee === '0'
                                            ? '🎉 Free Delivery'
                                            : `$${deliveryFee} delivery`}
                                    </span>
                                )}
                                {location && (
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="line-clamp-1">{location}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Hover Arrow Indicator */}
                    <div className="absolute bottom-5 right-5 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>

            <SignInModal
                isOpen={showSignIn}
                onClose={() => setShowSignIn(false)}
            />
        </>
    );
};

StoreCard.propTypes = {
    store: PropTypes.shape({
        storeId: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        rating: PropTypes.number.isRequired,
        openingHour: PropTypes.number.isRequired,
        closingHour: PropTypes.number.isRequired,
        categories: PropTypes.arrayOf(PropTypes.string),
        deliveryTime: PropTypes.string.isRequired,
        popularItems: PropTypes.arrayOf(PropTypes.shape({
            imageUrl: PropTypes.string.isRequired,
        })),
        location: PropTypes.string,
        deliveryFee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        vendorPublicId: PropTypes.string,
    }),
    isLoading: PropTypes.bool,
    priority: PropTypes.bool,
};

export default StoreCard;