"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, User, LogOut, Settings, Package, ChevronDown, ChevronRight, ArrowRight, Store } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { SignInModal } from "@/components/signin/SignInModal";
import { SignUpModal } from "@/components/register/SignUpModal";
import { ForgotPasswordModal } from "@/components/signin/ForgotPasswordModal";
import { useCart } from "@/contexts/CartContext";
import { SearchAPI } from "@/lib/api/search.api";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [navCategories, setNavCategories] = useState([]);
    const { cartCount, cartTotal } = useCart();
    const { user, isAuthenticated, logout } = useAuth();

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await SearchAPI.getAllCategories();
                if (response?.success && response?.data) {
                    // take first 4 categories for nav
                    const mapped = response.data.slice(0, 4).map(cat => ({
                        href: `/restaurants?categoryId=${cat.categoryId}`,
                        label: cat.name,
                    }));
                    setNavCategories(mapped);
                }
            } catch (error) {
                console.error('Error loading nav categories:', error);
            }
        };
        void loadCategories();
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsMenuOpen(false);
    };

    const handleSellClick = () => {
        setShowSignUp(true);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Floating pill navbar */}
            <div className="sticky top-0 z-50 w-full flex justify-center px-4 py-3 bg-transparent pointer-events-none">
                <nav className="pointer-events-auto w-full max-w-5xl bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-full shadow-lg shadow-black/8 px-3 py-2 flex items-center justify-between gap-2">

                    {/* Logo */}
                    <div className="flex items-center shrink-0 pl-1">
                        <Logo />
                    </div>

                    {/* Desktop Nav Links — from API */}
                    <div className="hidden md:flex items-center gap-1">
                        {navCategories.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className="px-4 py-2 text-sm font-medium text-gray-600 rounded-full hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 whitespace-nowrap"
                            >
                                {label}
                            </Link>
                        ))}

                        {/* Sell on Afrochow */}
                        <button
                            onClick={handleSellClick}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-orange-600 rounded-full hover:bg-orange-50 transition-all duration-200 whitespace-nowrap"
                        >
                            <Store className="w-3.5 h-3.5" />
                            Sell on Afrochow
                        </button>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2 shrink-0">
                        {isAuthenticated && user ? (
                            <>
                                {/* Cart */}
                                <Link
                                    href="/cart"
                                    className="relative flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-semibold text-sm transition-all duration-200"
                                    aria-label={`Cart - ${cartCount} items`}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span className="hidden sm:inline">${cartTotal.toFixed(2)}</span>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                            {cartCount > 9 ? '9+' : cartCount}
                                        </span>
                                    )}
                                </Link>

                                {/* User Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-sm font-bold text-white">
                                                {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <span className="hidden lg:block text-sm font-semibold text-gray-800">
                                            {user.firstName || 'Account'}
                                        </span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                            <div className="absolute right-0 top-full mt-2 z-20 w-60 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
                                                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                                                    <p className="text-sm font-bold text-gray-900 truncate">
                                                        {user.username || user.firstName || 'User'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    {user.role && (
                                                        <span className="mt-1.5 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                                            {user.role === 'CUSTOMER' ? 'Customer'
                                                                : user.role === 'VENDOR' ? 'Vendor'
                                                                    : user.role === 'ADMIN' ? 'Admin'
                                                                        : user.role}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="p-2">
                                                    {[
                                                        { href: '/profile', icon: User, label: 'Profile' },
                                                        { href: '/orders', icon: Package, label: 'My Orders' },
                                                        { href: '/settings', icon: Settings, label: 'Settings' },
                                                    ].map(({ href, icon: Icon, label }) => (
                                                        <Link
                                                            key={href}
                                                            href={href}
                                                            onClick={() => setIsMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 hover:text-orange-600 transition-all duration-150 group"
                                                        >
                                                            <div className="w-7 h-7 bg-orange-50 group-hover:bg-orange-100 rounded-lg flex items-center justify-center">
                                                                <Icon className="w-3.5 h-3.5 text-orange-600" />
                                                            </div>
                                                            {label}
                                                        </Link>
                                                    ))}
                                                </div>

                                                <div className="p-2 border-t border-gray-100">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-all duration-150 group"
                                                    >
                                                        <div className="w-7 h-7 bg-red-50 group-hover:bg-red-100 rounded-lg flex items-center justify-center">
                                                            <LogOut className="w-3.5 h-3.5 text-red-500" />
                                                        </div>
                                                        Log Out
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Sign In */}
                                <button
                                    onClick={() => setShowSignIn(true)}
                                    className="hidden sm:flex items-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                >
                                    Sign In
                                </button>
                            </>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen
                                ? <X className="w-5 h-5 text-gray-600" />
                                : <Menu className="w-5 h-5 text-gray-600" />
                            }
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="pointer-events-auto absolute top-18 left-4 right-4 bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl shadow-black/10 overflow-hidden">
                        <div className="p-4 space-y-1">

                            {isAuthenticated && user ? (
                                <>
                                    {/* User card */}
                                    <div className="flex items-center gap-3 p-3 mb-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shrink-0">
                                            <span className="text-base font-bold text-white">
                                                {user.firstName?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{user.username || user.firstName}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    {/* Cart */}
                                    <Link
                                        href="/cart"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="relative flex items-center gap-3 px-4 py-3 bg-orange-600 text-white rounded-2xl font-bold mb-2"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        <span>Cart</span>
                                        <span className="ml-auto font-black">${cartTotal.toFixed(2)}</span>
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>

                                    <div className="h-px bg-gray-100 my-1" />

                                    {/* Category nav links */}
                                    {navCategories.map(({ href, label }) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-orange-600 transition-colors"
                                        >
                                            {label}
                                        </Link>
                                    ))}

                                    {/* Sell on Afrochow */}
                                    <button
                                        onClick={handleSellClick}
                                        className="flex items-center gap-2 w-full px-4 py-3 text-sm font-semibold text-orange-600 rounded-xl hover:bg-orange-50 transition-colors"
                                    >
                                        <Store className="w-4 h-4" />
                                        Sell on Afrochow
                                    </button>

                                    <div className="h-px bg-gray-100 my-1" />

                                    {[
                                        { href: '/profile', icon: User, label: 'Profile' },
                                        { href: '/orders', icon: Package, label: 'My Orders' },
                                        { href: '/settings', icon: Settings, label: 'Settings' },
                                    ].map(({ href, icon: Icon, label }) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                                                <Icon className="w-4 h-4 text-orange-600" />
                                            </div>
                                            {label}
                                            <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                                        </Link>
                                    ))}

                                    <div className="h-px bg-gray-100 my-1" />

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                                            <LogOut className="w-4 h-4 text-red-500" />
                                        </div>
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Category nav links */}
                                    {navCategories.map(({ href, label }) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-orange-600 transition-colors"
                                        >
                                            {label}
                                        </Link>
                                    ))}

                                    {/* Sell on Afrochow */}
                                    <button
                                        onClick={handleSellClick}
                                        className="flex items-center gap-2 w-full px-4 py-3 text-sm font-semibold text-orange-600 rounded-xl hover:bg-orange-50 transition-colors"
                                    >
                                        <Store className="w-4 h-4" />
                                        Sell on Afrochow
                                    </button>

                                    <div className="h-px bg-gray-100 my-2" />

                                    <button
                                        onClick={() => { setShowSignIn(true); setIsMobileMenuOpen(false); }}
                                        className="block w-full px-4 py-3 text-center text-sm font-semibold text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                                    >
                                        Sign In
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <SignInModal
                isOpen={showSignIn}
                onClose={() => setShowSignIn(false)}
                onSignUpClick={() => { setShowSignIn(false); setShowSignUp(true); }}
                onForgotPasswordClick={() => { setShowSignIn(false); setShowForgotPassword(true); }}
            />
            <SignUpModal
                isOpen={showSignUp}
                onClose={() => setShowSignUp(false)}
                onSignInClick={() => { setShowSignUp(false); setShowSignIn(true); }}
            />
            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
                onSignInClick={() => { setShowForgotPassword(false); setShowSignIn(true); }}
            />
        </>
    );
};

export default Header;