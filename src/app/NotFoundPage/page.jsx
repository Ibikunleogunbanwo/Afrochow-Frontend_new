"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Home, Search, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <MessageDisplay />
        </div>
    );
}

/* ==============================
   Message Display
============================== */
function MessageDisplay() {
    const router = useRouter();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 300);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="max-w-2xl w-full relative z-10">
            <div
                className={`text-center transition-opacity duration-700 ${
                    visible ? "opacity-100 animate-fade-up" : "opacity-0"
                }`}
            >
                {/* 404 Icon */}
                <div className="mb-8 inline-flex items-center justify-center">
                    <div className="relative">
                        <div className="w-32 h-32 bg-linear-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center animate-pulse-subtle">
                            <UtensilsCrossed className="w-16 h-16 text-orange-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-black text-xl">
                            !
                        </div>
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-8xl md:text-9xl font-black bg-linear-to-r from-orange-600 via-red-600 to-orange-500 bg-clip-text text-transparent mb-4">
                    404
                </h1>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                    Page Not Found
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                    Oops! The page you're looking for seems to have wandered off.
                    Maybe it went looking for some delicious African cuisine?
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <button
                        onClick={() => router.push("/")}
                        className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-linear-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <Home className="w-5 h-5" />
                        <span>Back to Home</span>
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white border-2 border-orange-300 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-md hover:shadow-lg hover:scale-105"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Go Back</span>
                    </button>
                </div>

                {/* Helpful Links */}
                <div className="pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4 font-medium">
                        You might be looking for:
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            href="/register/signup"
                            className="text-orange-600 hover:text-orange-700 font-semibold text-sm hover:underline transition-colors"
                        >
                            Sign Up
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link
                            href="/login"
                            className="text-orange-600 hover:text-orange-700 font-semibold text-sm hover:underline transition-colors"
                        >
                            Login
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link
                            href="/restaurants"
                            className="text-orange-600 hover:text-orange-700 font-semibold text-sm hover:underline transition-colors"
                        >
                            Restaurants
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link
                            href="/register/vendor/step-1"
                            className="text-orange-600 hover:text-orange-700 font-semibold text-sm hover:underline transition-colors"
                        >
                            Become a Vendor
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

