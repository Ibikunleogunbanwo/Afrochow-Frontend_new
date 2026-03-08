import React from "react";
import Link from "next/link";

const Logo = ({ showTagline = false, lightMode = false }) => {
    return (
        <Link
            href="/"
            className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105"
        >
            {/* Logo with African Pattern */}
            <div className="relative w-10 h-10 flex items-center justify-center bg-linear-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* African Pattern Background */}
                <div className="absolute inset-0 opacity-20">
                    <svg viewBox="0 0 40 40" className="w-full h-full">
                        <pattern id="african-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="5" cy="5" r="2" fill="white" />
                            <circle cx="15" cy="15" r="2" fill="white" />
                            <path d="M 0 10 L 10 0 M 10 20 L 20 10" stroke="white" strokeWidth="1" />
                        </pattern>
                        <rect width="40" height="40" fill="url(#african-pattern)" />
                    </svg>
                </div>

                {/* Bowl Icon */}
                <svg
                    className="w-6 h-6 text-white relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                >
                    <path d="M3 11C3 11 4 8 6 7C8 6 10 6 12 6C14 6 16 6 18 7C20 8 21 11 21 11M4 11H20C20 11 21 13 20 15C19 17 17 19 12 19C7 19 5 17 4 15C3 13 4 11 4 11Z" />
                    <path d="M8 4C8 4 8 2 9 2C10 2 10 4 10 4M12 3C12 3 12 1 13 1C14 1 14 3 14 3M16 4C16 4 16 2 17 2C18 2 18 4 18 4" strokeLinecap="round" />
                </svg>
            </div>

            {/* Text */}
            <div className="flex flex-col">
                <div className="flex items-center">
                    <span className="text-2xl font-black text-orange-600">AFRO</span>
                    <span className={`text-2xl font-black ${lightMode ? 'text-white' : 'text-gray-900'}`}>CHOW</span>
                </div>
                {showTagline && (
                    <span className="text-xs text-orange-600 font-semibold tracking-widest -mt-1">
                        🌍 TASTE OF AFRICA
                    </span>
                )}
            </div>
        </Link>
    );
};

export default Logo;