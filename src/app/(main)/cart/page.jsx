'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Store } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CartPage = () => {
    const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</p>
                    <p className="text-sm text-gray-500 mb-6">Add some delicious African food to get started</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Browse Stores
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm('Clear your entire cart?')) clearCart();
                        }}
                        className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                    >
                        Clear all
                    </button>
                </div>

                {/* Cart Items */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
                    {cartItems.map((item, idx) => (
                        <div
                            key={item.publicProductId}
                            className={`p-4 ${idx < cartItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                            <div className="flex gap-3">

                                {/* Image */}
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
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

                                {/* Info + Controls */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {item.name}
                                            </p>
                                            {item.restaurantName && (
                                                <Link
                                                    href={`restaurant/${item.vendorPublicId}`}
                                                    className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-orange-50 border border-orange-100 rounded-full text-xs font-medium text-orange-600 hover:bg-orange-100 hover:border-orange-300 transition-colors"
                                                >
                                                    <Store className="w-3 h-3 shrink-0" />
                                                    {item.restaurantName}
                                                </Link>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 shrink-0">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">

                                        {/* Quantity */}
                                        <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => updateQuantity(item.publicProductId, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-semibold text-gray-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.publicProductId, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-gray-400">${item.price.toFixed(2)} each</p>
                                            <button
                                                onClick={() => removeFromCart(item.publicProductId)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900">Order summary</h2>
                    </div>

                    <div className="px-5 py-4 space-y-2.5">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Delivery fee</span>
                            <span className="text-gray-400">Calculated at checkout</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tax</span>
                            <span className="text-gray-400">Calculated at checkout</span>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex justify-between">
                            <span className="text-sm font-semibold text-gray-900">Estimated total</span>
                            <span className="text-sm font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="px-5 pb-5">
                        <Link
                            href="/checkout"
                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            Proceed to Checkout
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CartPage;