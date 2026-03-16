"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { Heart, Star, Clock, Truck, MapPin } from 'lucide-react';
import Image from 'next/image';
import StoreCardSkeleton from '@/components/home/cards/StoreCardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { SignInModal } from "@/components/signin/SignInModal";
import { SignUpModal } from "@/components/register/SignUpModal";

const StoreCard = ({ store, isLoading = false, priority = false }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const { isAuthenticated } = useAuth();
    const router = useRouter();

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
        isOpenNow,
        todayHoursFormatted,
    } = store;

    const imageUrl = popularItems?.length > 0
        ? popularItems[0].imageUrl
        : '/image/amala.jpg';

    const categoryDisplay = Array.isArray(categories) && categories.length > 0
        ? categories.slice(0, 2).join(' • ')
        : 'African Cuisine';

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
                            isOpenNow
                                ? 'bg-green-500/90 text-white'
                                : 'bg-red-500/90 text-white'
                        }`}>
                            {isOpenNow ? '🟢 Open Now' : '🔴 Closed'}
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="p-5 space-y-3">

                        {/* Product Name — bold, primary */}
                        <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                            {name}
                        </h3>

                        {/* Restaurant Name — orange, not bold */}
                        {restaurantName && (
                            <p className="text-sm font-medium text-orange-500 line-clamp-1 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                {restaurantName}
                            </p>
                        )}

                        {/* Categories — pill badges */}
                        {categoryDisplay && (
                            <div className="flex flex-wrap gap-1.5">
                                {categoryDisplay.split(' • ').map((cat, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2.5 py-0.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-100 rounded-full"
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        )}

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

                            {/* Today's Hours */}
                            <div className="flex items-center space-x-2 text-gray-600">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Hours</p>
                                    <p className="text-xs font-normal text-gray-900">
                                        {todayHoursFormatted || 'Hours not set'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Fee & Location */}
                        {(deliveryFee !== undefined || location) && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
                                {deliveryFee !== undefined && (
                                    <span className="font-semibold text-orange-600">
                                        {deliveryFee === 0 || deliveryFee === '0'
                                            ? '🎉 Free Delivery'
                                            : `$${deliveryFee} delivery fee`}
                                    </span>
                                )}
                                {location && (
                                    <span className="text-gray-400 line-clamp-1 max-w-[120px]">
                                        {location}
                                    </span>
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
                onSignUpClick={() => {
                    setShowSignIn(false);
                    setShowSignUp(true);
                }}
            />

            <SignUpModal
                isOpen={showSignUp}
                onClose={() => setShowSignUp(false)}
                onSignInClick={() => {
                    setShowSignUp(false);
                    setShowSignIn(true);
                }}
            />
        </>
    );
};

StoreCard.propTypes = {
    store: PropTypes.shape({
        storeId: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        rating: PropTypes.number.isRequired,
        isOpenNow: PropTypes.bool,
        todayHoursFormatted: PropTypes.string,
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