"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ArrowRight, Tag } from "lucide-react";

export default function CartPage() {
    // Sample cart items - replace with actual cart state later
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "Jollof Rice with Chicken",
            restaurant: "Mama's Kitchen",
            price: 15.99,
            quantity: 2,
            image: "/image/Jollof.jpg"
        },
        {
            id: 2,
            name: "Egusi Soup with Fufu",
            restaurant: "African Delights",
            price: 18.50,
            quantity: 1,
            image: "/image/Egusi 2.jpg"
        }
    ]);

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(items =>
            items.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeItem = (id) => {
        setCartItems(items => items.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 3.99;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors group font-semibold"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Continue Shopping
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900">
                        Shopping Cart
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    // Empty Cart State
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-32 h-32 bg-linear-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="w-16 h-16 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-4">
                            Your cart is empty
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Looks like you haven't added any delicious African cuisine to your cart yet.
                        </p>
                        <Link
                            href="/restaurants"
                            className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <span>Browse Restaurants</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    // Cart with Items
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex gap-4">
                                        {/* Item Image */}
                                        <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Item Details */}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 mb-1">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {item.restaurant}
                                            </p>
                                            <p className="text-lg font-black text-orange-600">
                                                ${item.price.toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 hover:text-red-700 transition-colors p-2"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-orange-600 transition-colors"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-bold text-gray-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-orange-600 transition-colors"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                                <h2 className="text-2xl font-black text-gray-900 mb-6">
                                    Order Summary
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Fee</span>
                                        <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (8%)</span>
                                        <span className="font-semibold">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between text-xl font-black text-gray-900">
                                            <span>Total</span>
                                            <span className="text-orange-600">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Promo Code */}
                                <div className="mb-6">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Promo code"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
                                            />
                                        </div>
                                        <button className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors">
                                            Apply
                                        </button>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <button className="w-full px-6 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2">
                                    <span>Proceed to Checkout</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Secure checkout powered by Afrochow
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
