'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

const CartPage = () => {
    const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</p>
                    <p className="text-gray-500 mb-6">Add some delicious African food to get started</p>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors"
                    >
                        Browse Stores
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto max-w-2xl px-4">
                <h1 className="text-3xl font-black text-gray-900 mb-8">Your Cart</h1>

                {/* Cart Items */}
                <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 mb-6">
                    {cartItems.map(item => (
                        <div
                            key={item.publicProductId}
                            className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0"
                        >
                            {/* Product Image */}
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-orange-50">
                                {item.imageUrl ? (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-2xl">🍲</span>
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                {item.restaurantName && (
                                    <p className="text-xs text-gray-500 truncate">{item.restaurantName}</p>
                                )}
                                <p className="text-sm text-orange-600 font-semibold mt-0.5">
                                    ${item.price.toFixed(2)} each
                                </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden shrink-0">
                                <button
                                    onClick={() => updateQuantity(item.publicProductId, item.quantity - 1)}
                                    className="px-3 py-2 hover:bg-gray-100 font-bold text-gray-600 transition-colors"
                                >
                                    −
                                </button>
                                <span className="px-3 py-2 font-bold text-gray-900 min-w-8 text-center">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => updateQuantity(item.publicProductId, item.quantity + 1)}
                                    className="px-3 py-2 hover:bg-gray-100 font-bold text-gray-600 transition-colors"
                                >
                                    +
                                </button>
                            </div>

                            {/* Item Total + Remove */}
                            <div className="text-right shrink-0">
                                <p className="font-black text-gray-900">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </p>
                                <button
                                    onClick={() => removeFromCart(item.publicProductId)}
                                    className="text-xs text-red-500 hover:text-red-700 font-semibold mt-1 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-lg font-black text-gray-900 mb-4">Order Summary</h2>

                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Delivery fee</span>
                            <span className="text-green-600 font-semibold">Calculated at checkout</span>
                        </div>
                    </div>

                    <div className="flex justify-between font-black text-gray-900 text-lg border-t border-gray-100 pt-4 mb-6">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>

                    <button className="w-full py-4 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg">
                        Proceed to Checkout
                    </button>

                    <button
                        onClick={clearCart}
                        className="w-full py-3 mt-3 text-gray-500 font-semibold text-sm hover:text-red-500 transition-colors"
                    >
                        Clear Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;