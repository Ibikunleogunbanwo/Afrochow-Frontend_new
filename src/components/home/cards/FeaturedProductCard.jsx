"use client";

import Image from "next/image";
import { Star, Flame, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

const FeaturedProductCard = ({ product, priority = false, isAuthenticated, onUnauthenticated }) => {
    const {
        vendorPublicId,
        name,
        restaurantName,
        imageUrl,
        price,
        averageRating,
        reviewCount,
        totalOrders,
        categoryName,
        preparationTimeMinutes,
    } = product;

    const router = useRouter();

    const handleClick = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            onUnauthenticated();
        } else {
            router.push(`/restaurant/${vendorPublicId}`);
        }
    };

    return (
        <div onClick={handleClick} className="group block h-full cursor-pointer">
            <div className="h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

                {/* Image */}
                <div className="relative w-full aspect-4/3 overflow-hidden bg-gray-100">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            priority={priority}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-orange-50">
                            <Flame className="w-10 h-10 text-orange-300" />
                        </div>
                    )}

                    {/* Category pill */}
                    {categoryName && (
                        <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 text-[11px] font-bold bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-sm">
                                {categoryName}
                            </span>
                        </div>
                    )}

                    {/* Order count badge */}
                    {totalOrders > 0 && (
                        <div className="absolute top-3 right-3">
                            <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-orange-500 text-white rounded-full shadow-sm">
                                <Flame className="w-3 h-3" />
                                {totalOrders >= 1000
                                    ? `${(totalOrders / 1000).toFixed(1)}k`
                                    : totalOrders} orders
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">

                    {/* Product name */}
                    <h3 className="text-sm font-bold text-gray-900 truncate mb-0.5">
                        {name}
                    </h3>

                    {/* Restaurant name */}
                    {restaurantName && (
                        <p className="text-xs text-gray-400 truncate mb-3">
                            {restaurantName}
                        </p>
                    )}

                    {/* Rating + prep time + price */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">

                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                                <span className="text-xs font-bold text-gray-800">
                                    {averageRating > 0 ? averageRating.toFixed(1) : "0"}
                                </span>
                                {reviewCount > 0 && (
                                    <span className="text-xs text-gray-400">
                                        ({reviewCount >= 1000
                                        ? `${(reviewCount / 1000).toFixed(1)}k`
                                        : reviewCount})
                                    </span>
                                )}
                            </div>

                            {/* Prep time */}
                            {preparationTimeMinutes > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {preparationTimeMinutes} min
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        {price != null && (
                            <span className="text-sm font-bold text-gray-900">
                                ${Number(price).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedProductCard;