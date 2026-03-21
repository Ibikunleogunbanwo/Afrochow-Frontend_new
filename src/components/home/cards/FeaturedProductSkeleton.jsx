const FeaturedProductSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
        <div className="w-full aspect-4/3 bg-gray-100" />
        <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-full mt-3" />
        </div>
    </div>
);

export default FeaturedProductSkeleton;