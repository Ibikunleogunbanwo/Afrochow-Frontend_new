import React from "react";

const StoreCardSkeleton = () => {
    return (
        <div className="overflow-hidden bg-white rounded-2xl shadow-md animate-pulse">
            {/* Image Skeleton */}
            <div className="w-full h-56 bg-linear-to-br from-gray-200 via-gray-300 to-gray-200 relative">
                <div className="absolute top-3 right-3 w-10 h-10 bg-gray-300 rounded-full" />
                <div className="absolute top-3 left-3 w-16 h-7 bg-gray-300 rounded-full" />
                <div className="absolute bottom-3 left-3 w-20 h-6 bg-gray-300 rounded-full" />
            </div>

            {/* Content Skeleton */}
            <div className="p-5 space-y-3">
                {/* Title */}
                <div className="h-6 bg-gray-200 rounded-lg w-3/4" />

                {/* Categories */}
                <div className="h-4 bg-gray-200 rounded w-1/2" />

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-16" />
                            <div className="h-4 bg-gray-200 rounded w-12" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-16" />
                            <div className="h-4 bg-gray-200 rounded w-12" />
                        </div>
                    </div>
                </div>

                {/* Bottom info */}
                <div className="flex items-center justify-between pt-2">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
            </div>
        </div>
    );
};

export default StoreCardSkeleton;