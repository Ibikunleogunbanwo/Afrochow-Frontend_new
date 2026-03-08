"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChefHat, TrendingUp, Users, DollarSign, ArrowRight, Check, Star } from 'lucide-react';

const VendorCTA = () => {
    const benefits = [
        {
            icon: Users,
            title: "Reach More Customers",
            description: "Connect with thousands of african customers in your area"
        },
        {
            icon: TrendingUp,
            title: "Grow Your Business",
            description: "Increase your revenue with our easy-to-use platform"
        },
        {
            icon: DollarSign,
            title: "No Commission",
            description: "Keep All your earnings"
        }
    ];

    const features = [
        "Easy menu management",
        "Real-time order tracking",
        "Detailed analytics",
        "Marketing support",
        "24/7 customer support",
        "Flexible payment options"
    ];

    return (
        <section className="relative py-20 overflow-hidden bg-linear-to-br from-orange-50 via-white to-orange-50">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="container relative z-10 px-4 mx-auto max-w-7xl">

                {/* Main Content Grid */}
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">

                    {/* Left Column - Text Content */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-100 rounded-full">
                            <ChefHat className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-semibold text-orange-800">For Restaurant/Home Kitchen Owners</span>
                        </div>

                        {/* Heading */}
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                                Grow Your Home Restaurant
                                <span className="block text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">
                  With Afrochow
                </span>
                            </h2>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                Join hundreds of African Home Kitchens reaching more customers every day.
                                Start selling online in minutes with zero upfront costs.
                            </p>
                        </div>

                        {/* Benefits Grid */}
                        <div className="grid gap-6 sm:grid-cols-3">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex flex-col items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="p-2 bg-orange-100 rounded-lg mb-3">
                                            <Icon className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-1">{benefit.title}</h3>
                                        <p className="text-xs text-gray-600">{benefit.description}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Features Checklist */}
                        <div className="grid grid-cols-2 gap-3">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <div className="shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </div>
                                    <span className="text-sm text-gray-700">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link
                                href="/register/vendor/step-1"
                                className="group inline-flex items-center justify-center space-x-2 px-8 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <span>Start Selling Today</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/vendor-info"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>

                    {/* Right Column - Visual Content */}
                    <div className="relative">
                        {/* Main Image Card */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="/image/rest_owner.jpg"
                                alt="Restaurant owner with tablet"
                                width={600}
                                height={700}
                                className="object-cover"
                                quality={75}
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>

                            {/* Floating Stats Card */}
                            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Monthly Revenue</div>
                                        <div className="text-3xl font-black text-gray-900">$12,450</div>
                                    </div>
                                    <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>+28%</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Orders: </span>
                                        <span className="font-bold text-gray-900">156</span>
                                    </div>
                                    <div className="w-px h-4 bg-gray-300"></div>
                                    <div>
                                        <span className="text-gray-600">Rating: </span>
                                        <span className="font-bold text-gray-900 inline-flex items-center">
                      4.9 <Star className="w-2 h-2 ml-1 text-yellow-500 fill-yellow-500" />
                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -top-4 -right-4 bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg transform rotate-12">
                            <div className="text-center">
                                <div className="text-2xl font-black">0%</div>
                                <div className="text-xs">Commission</div>
                            </div>
                        </div>

                        {/* Decorative Dots */}
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-200 rounded-full filter blur-3xl opacity-50"></div>
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-red-200 rounded-full filter blur-3xl opacity-50"></div>
                    </div>
                </div>

                {/* Bottom Testimonial */}
                <div className="mt-16 max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-orange-500">
                        <div className="flex items-start space-x-4">
                            <div className="shrink-0">
                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                                    AO
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-3 italic">
                                    &#34;Afrochow helped me reach customers I never thought possible. My online orders
                                    have tripled in just 3 months. The platform is so easy to use!&#34;
                                </p>
                                <div>
                                    <div className="font-semibold text-gray-900">Amara Okafor</div>
                                    <div className="text-sm text-gray-600">Owner, Mama&#39;s Kitchen</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VendorCTA;