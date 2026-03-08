"use client";
import React from 'react';
import Link from 'next/link';
import { User, ChefHat, ArrowRight, Check, Sparkles, TrendingUp, Users, ChevronLeft } from 'lucide-react';

const RegisterPage = () => {
    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-6xl w-full relative z-10">
                {/* Back to Home */}
                <Link
                    href="/"
                    className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-8 transition-colors group font-semibold"
                >
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                {/* Header */}
                <div className="text-center mb-16 animate-fade-up">
                    <div className="inline-flex items-center justify-center space-x-2 mb-4">
                        <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
                        <h1 className="text-5xl md:text-6xl font-black bg-linear-to-r from-orange-600 via-red-600 to-orange-500 bg-clip-text text-transparent">
                            Join Afrochow
                        </h1>
                        <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
                    </div>
                    <p className="text-xl md:text-2xl text-gray-600 font-medium mb-6">
                        Choose how you'd like to get started with Africa's flavors
                    </p>
                    <div className="mt-6 inline-flex items-center space-x-8 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-orange-500" />
                            <span className="font-medium">10,000+ Users</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            <span className="font-medium">Fast Growing</span>
                        </div>
                    </div>
                </div>

                {/* Two Options */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Customer Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-orange-300 transition-all duration-500 hover:shadow-2xl group relative overflow-hidden animate-fade-up">
                        {/* Decorative gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-br from-orange-50/0 via-orange-50/0 to-orange-100/0 group-hover:to-orange-100/30 transition-all duration-500 pointer-events-none"></div>

                        <div className="relative z-10">
                            {/* Popular Badge */}
                            <div className="absolute -top-2 -right-2 bg-linear-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                Popular
                            </div>

                            <div className="w-20 h-20 bg-linear-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                                <User className="w-10 h-10 text-orange-600 group-hover:text-orange-700 transition-colors" />
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                                I'm a Customer
                            </h2>
                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                Order delicious African cuisine from the best restaurants near you
                            </p>

                            {/* Benefits */}
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center space-x-3 group/item">
                                    <div className="shrink-0 w-6 h-6 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                        <Check className="w-4 h-4 text-green-600 font-bold" />
                                    </div>
                                    <span className="text-gray-700 font-medium">Browse hundreds of restaurants</span>
                                </li>
                                <li className="flex items-center space-x-3 group/item">
                                    <div className="shrink-0 w-6 h-6 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                        <Check className="w-4 h-4 text-green-600 font-bold" />
                                    </div>
                                    <span className="text-gray-700 font-medium">Fast & reliable delivery</span>
                                </li>
                                <li className="flex items-center space-x-3 group/item">
                                    <div className="shrink-0 w-6 h-6 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                        <Check className="w-4 h-4 text-green-600 font-bold" />
                                    </div>
                                    <span className="text-gray-700 font-medium">Exclusive deals & offers</span>
                                </li>
                            </ul>

                            <Link
                                href="/register/customer"
                                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 group/btn"
                            >
                                <span>Sign Up as Customer</span>
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Vendor Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-orange-300 transition-all duration-500 hover:shadow-2xl group relative overflow-hidden animate-fade-up animation-delay-200">
                        {/* Decorative gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-br from-red-50/0 via-orange-50/0 to-red-100/0 group-hover:to-red-100/30 transition-all duration-500 pointer-events-none"></div>

                        <div className="relative z-10">
                            {/* Recommended Badge */}
                            <div className="absolute -top-2 -right-2 bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                Grow Business
                            </div>

                            <div className="w-20 h-20 bg-linear-to-br from-red-100 to-orange-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                                <ChefHat className="w-10 h-10 text-red-600 group-hover:text-red-700 transition-colors" />
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                                I'm a Vendor
                            </h2>
                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                Grow your restaurant business and reach more customers online
                            </p>

                            {/* Benefits */}
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center space-x-3 group/item">
                                    <div className="shrink-0 w-6 h-6 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                        <Check className="w-4 h-4 text-green-600 font-bold" />
                                    </div>
                                    <span className="text-gray-700 font-medium">Reach 5000+ customers daily</span>
                                </li>
                                <li className="flex items-center space-x-3 group/item">
                                    <div className="shrink-0 w-6 h-6 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                        <Check className="w-4 h-4 text-green-600 font-bold" />
                                    </div>
                                    <span className="text-gray-700 font-medium">Easy menu & order management</span>
                                </li>
                                <li className="flex items-center space-x-3 group/item">
                                    <div className="shrink-0 w-6 h-6 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                        <Check className="w-4 h-4 text-green-600 font-bold" />
                                    </div>
                                    <span className="text-gray-700 font-medium">Low commission rates</span>
                                </li>
                            </ul>

                            <Link
                                href="/register/vendor/step-1"
                                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 group/btn"
                            >
                                <span>Sign Up as Vendor</span>
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Already have account */}
                <div className="text-center mt-12 animate-fade-up animation-delay-400">
                    <div className="inline-block bg-white rounded-2xl shadow-lg px-8 py-5 border border-gray-100">
                        <p className="text-gray-600 text-lg">
                            Already have an account?{' '}
                            <Link href="/login" className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-16 pt-12 border-t border-gray-200 animate-fade-up animation-delay-600">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="space-y-2">
                            <div className="text-3xl md:text-4xl font-black bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                10K+
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Active Users</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl md:text-4xl font-black bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                500+
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Partner Restaurants</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl md:text-4xl font-black bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                50K+
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Orders Delivered</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl md:text-4xl font-black bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                4.8★
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Average Rating</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RegisterPage;