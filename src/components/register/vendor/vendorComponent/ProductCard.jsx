'use client';
import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

const ProductCard = ({ product, onViewReviews, onCardClick }) => {
    return (
        <div
            onClick={onCardClick}
            className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        >
            <div className="relative w-full h-48 bg-gray-200">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-100 to-red-100">
                        <span className="text-6xl">🍲</span>
                    </div>
                )}
                {!product.available && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        Unavailable
                    </div>
                )}
            </div>

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

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewReviews();
                    }}
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

                <div className="flex items-center pt-3 border-t border-gray-100">
                    <span className="text-2xl font-black text-orange-600">
                        ${product.price?.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;