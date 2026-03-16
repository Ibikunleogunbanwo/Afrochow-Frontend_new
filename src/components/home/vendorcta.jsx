"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChefHat, TrendingUp, Users, DollarSign, ArrowRight, Check, Star, ShoppingBag, Clock, Shield } from 'lucide-react';

const VendorCTA = () => {
    const benefits = [
        {
            icon: Users,
            title: "Reach More Customers",
            description: "Connect with thousands of African customers in your area and across Canada"
        },
        {
            icon: TrendingUp,
            title: "Grow Your Revenue",
            description: "Increase your sales with our powerful online ordering platform"
        },
        {
            icon: DollarSign,
            title: "Zero Commission",
            description: "Keep 100% of your earnings — no hidden fees, ever"
        },
        {
            icon: ShoppingBag,
            title: "Easy Order Management",
            description: "Manage all your orders in one place, from any device"
        },
        {
            icon: Clock,
            title: "Go Live in Minutes",
            description: "Set up your store quickly and start accepting orders same day"
        },
        {
            icon: Shield,
            title: "Secure Payments",
            description: "Fast, reliable payouts directly to your bank account"
        },
    ];

    const features = [
        "Easy menu management",
        "Real-time order tracking",
        "Detailed analytics dashboard",
        "Marketing & promotions tools",
        "24/7 customer support",
        "Flexible payment options",
        "Mobile-friendly dashboard",
        "Custom store branding",
    ];

    return (
        <section className="relative py-24 overflow-hidden bg-white">

            <div className="container relative z-10 px-4 mx-auto max-w-7xl">


                {/* Main Content Grid */}
                <div className="grid gap-16 lg:grid-cols-2 items-center mb-20">

                    {/* Left Column */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 leading-tight">
                                Sell Your African Food
                                <span className="block text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">
                                    Online With Afrochow
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                Whether you run a home kitchen, a restaurant, or an African grocery store
                                Afrochow gives you the tools to reach more customers, manage orders effortlessly,
                                and grow your business.
                                Join hundreds of vendors already thriving on our platform.
                            </p>
                        </div>

                        {/* Benefits Grid */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-50"
                                    >
                                        <div className="shrink-0 p-2 bg-orange-100 rounded-lg">
                                            <Icon className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-0.5">{benefit.title}</h3>
                                            <p className="text-xs text-gray-500 leading-relaxed">{benefit.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <Link
                                href="/register/vendor/step-1"
                                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
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

                    {/* Right Column — Image */}
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl h-130 lg:h-155">
                            <Image
                                src="/image/img.png"
                                alt="African store owner managing orders on Afrochow"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                                quality={80}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -top-4 -right-4 bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg transform rotate-12">
                            <div className="text-center">
                                <div className="text-2xl font-black">Free</div>
                                <div className="text-xs">To Join</div>
                            </div>
                        </div>

                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-200 rounded-full filter blur-3xl opacity-50" />
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-red-200 rounded-full filter blur-3xl opacity-50" />
                    </div>
                </div>

                {/* Features Checklist */}
                <div className="bg-white rounded-2xl shadow-md p-8 mb-16 border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-6 text-center">
                        Everything you need to run your store online
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-green-600" />
                                </div>
                                <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Testimonial */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-orange-500">
                        <div className="flex items-start space-x-4">
                            <div className="shrink-0">
                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                                    AO
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-3 italic leading-relaxed">
                                    &#34;Afrochow helped me reach customers I never thought possible. My online orders
                                    have tripled in just 3 months. Setting up my store took less than an hour
                                    and the support team was incredible throughout.&#34;
                                </p>
                                <div>
                                    <div className="font-semibold text-gray-900">Amara Okafor</div>
                                    <div className="text-sm text-gray-500">Owner, Mama&#39;s Kitchen — Calgary, AB</div>
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