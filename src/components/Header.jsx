"use client";

import React, { useState } from "react";
import { ShoppingCart, Search, Menu, X, User, LogOut, Settings, Package, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { SignInModal } from "@/components/signin/SignInModal";
import { SignUpModal } from "@/components/register/SignUpModal";
import {ForgotPasswordModal} from "@/components/signin/ForgotPasswordModal";

const Header = ({ cartItemCount = 0 }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
      <nav className="sticky top-0 z-50 w-full border-b border-gray-200/60 shadow-sm bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Logo */}
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">

              {/* Search Button */}
              <button
                  className="p-2.5 text-gray-600 transition-all duration-300 rounded-xl hover:bg-linear-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-600 focus:outline-none focus:ring-3 focus:ring-orange-200 focus:ring-offset-2 active:scale-95 group"
                  aria-label="Search"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="w-5 h-5 text-black transition-transform group-hover:scale-110" />
              </button>

              {isAuthenticated && user ? (
                  // LOGGED IN STATE
                  <>
                    {/* Shopping Cart */}
                    <Link
                        href="/cart"
                        className="relative p-2.5 text-gray-600 transition-all duration-300 rounded-xl hover:bg-linear-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-600 focus:outline-none focus:ring-3 focus:ring-orange-200 focus:ring-offset-2 active:scale-95 group"
                        aria-label={`Shopping cart with ${cartItemCount} items`}
                    >
                      <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                      {cartItemCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-6 h-6 px-1.5 text-xs font-bold text-white bg-linear-to-br from-orange-500 to-orange-600 rounded-full shadow-lg animate-pulse-subtle">
                                            {cartItemCount > 99 ? '99+' : cartItemCount}
                                        </span>
                      )}
                    </Link>

                    {/* User Menu Dropdown */}
                    <div className="relative">
                      <button
                          onClick={() => setIsMenuOpen(!isMenuOpen)}
                          className="group flex items-center gap-3 p-2.5 pr-4 rounded-xl transition-all duration-300 hover:bg-linear-to-r hover:from-orange-50 hover:to-amber-50 focus:outline-none focus:ring-3 focus:ring-orange-200 focus:ring-offset-2"
                      >
                        {/* Avatar */}
                        <div className="relative">
                          <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-orange-500 via-amber-500 to-orange-600 rounded-full shadow-lg shadow-orange-200/50 group-hover:shadow-xl group-hover:shadow-orange-300/60 transition-all duration-300">
                                                <span className="text-base font-bold text-white">
                                                    {user.lastName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                          </div>
                          {/* Online indicator */}
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                        </div>

                        {/* User Info */}
                        <div className="hidden lg:block text-left">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                            {user.firstName || 'Welcome Back'}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>View Profile</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </p>
                        </div>

                        <ChevronDown className={`w-4 h-4 ml-1 text-gray-500 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                          <>
                            <div
                                className="fixed inset-0 z-10 bg-black/5 backdrop-blur-sm"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute right-0 z-20 w-64 mt-2 bg-white border border-gray-200/50 rounded-xl shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">

                              {/* User Info Header */}
                              <div className="p-4 bg-linear-to-r from-orange-50 to-amber-50 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {user.username || 'User'}
                                </p>
                                <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                {user.role && (
                                    <div className="mt-2 px-3 py-1 bg-white/80 rounded-full inline-block">
                                                            <span className="text-xs font-medium text-orange-600">
                                                                {user.role === 'CUSTOMER' ? 'Customer'
                                                                    : user.role === 'VENDOR' ? 'Vendor'
                                                                        : user.role === 'ADMIN' ? 'Administrator'
                                                                            : user.role}
                                                            </span>
                                    </div>
                                )}
                              </div>

                              {/* Menu Items */}
                              <div className="py-2">
                                <Link
                                    href="/profile"
                                    className="flex items-center px-4 py-3 text-sm text-gray-700 transition-all duration-200 hover:bg-linear-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-600 group"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                  <div className="flex items-center justify-center w-8 h-8 mr-3 bg-linear-to-br from-orange-100 to-amber-100 rounded-lg group-hover:from-orange-200 group-hover:to-amber-200">
                                    <User className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <span>Profile</span>
                                </Link>

                                <Link
                                    href="/orders"
                                    className="flex items-center px-4 py-3 text-sm text-gray-700 transition-all duration-200 hover:bg-linear-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-600 group"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                  <div className="flex items-center justify-center w-8 h-8 mr-3 bg-linear-to-br from-orange-100 to-amber-100 rounded-lg group-hover:from-orange-200 group-hover:to-amber-200">
                                    <Package className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <span>My Orders</span>
                                  {user.orderCount > 0 && (
                                      <span className="ml-auto px-2 py-1 text-xs font-bold text-orange-600 bg-orange-100 rounded-full">
                                                                {user.orderCount}
                                                            </span>
                                  )}
                                </Link>

                                <Link
                                    href="/settings"
                                    className="flex items-center px-4 py-3 text-sm text-gray-700 transition-all duration-200 hover:bg-linear-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-600 group"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                  <div className="flex items-center justify-center w-8 h-8 mr-3 bg-linear-to-br from-orange-100 to-amber-100 rounded-lg group-hover:from-orange-200 group-hover:to-amber-200">
                                    <Settings className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <span>Settings</span>
                                </Link>
                              </div>

                              {/* Logout */}
                              <div className="border-t border-gray-100 p-2 bg-gray-50/50">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 transition-all duration-200 rounded-lg hover:bg-linear-to-r hover:from-red-50 hover:to-red-100 group"
                                >
                                  <div className="flex items-center justify-center w-8 h-8 mr-3 bg-linear-to-br from-red-100 to-red-50 rounded-lg group-hover:from-red-200 group-hover:to-red-100">
                                    <LogOut className="w-4 h-4 text-red-500" />
                                  </div>
                                  <span>Log Out</span>
                                </button>
                              </div>
                            </div>
                          </>
                      )}
                    </div>
                  </>
              ) : (
                  // LOGGED OUT STATE
                  <>
                    <button
                        onClick={() => setShowSignIn(true)}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 transition-all duration-300 rounded-xl hover:bg-linear-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:shadow-sm active:scale-95"
                    >
                      Log In
                    </button>
                    <button
                        onClick={() => setShowSignUp(true)}
                        className="px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 bg-linear-to-r from-orange-600 via-orange-500 to-amber-500 rounded-xl shadow-md hover:shadow-lg hover:shadow-orange-200 hover:scale-[1.02] focus:outline-none focus:ring-3 focus:ring-orange-300 focus:ring-offset-2 active:scale-95"
                    >
                      Sign Up
                    </button>
                  </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2.5 text-gray-600 transition-all duration-300 rounded-xl hover:bg-linear-to-r hover:from-orange-50 hover:to-amber-50 focus:outline-none focus:ring-3 focus:ring-orange-200 focus:ring-offset-2 active:scale-95"
                  aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                    <X className="w-6 h-6 transition-transform rotate-90" />
                ) : (
                    <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Search Bar */}
          {isSearchOpen && (
              <div className="hidden md:block pb-4 animate-in slide-in-from-top-2 duration-300">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                      type="search"
                      placeholder="Search for delicious African cuisine, spices, or recipes..."
                      className="w-full pl-12 text-black pr-4 py-3.5 bg-linear-to-r from-gray-50 to-white border border-gray-300/50 rounded-xl focus:outline-none focus:ring-3 focus:ring-orange-300/50 focus:border-transparent shadow-sm transition-all duration-300"
                      autoFocus
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <kbd className="px-2 py-1 text-xs font-sans font-medium text-gray-500 bg-gray-100 rounded-lg border border-gray-300">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200/60 bg-white animate-in slide-in-from-top-2 duration-300">
              <div className="px-4 py-3 space-y-1">

                {isAuthenticated && user ? (
                    // Mobile - Logged In
                    <>
                      {/* Mobile Search */}
                      <div className="relative mb-4 p-2 bg-linear-to-r from-gray-50 to-white rounded-xl border border-gray-200/50">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Search..."
                            className="w-full text-black pl-10 pr-4 py-2.5 bg-transparent focus:outline-none"
                        />
                      </div>

                      {/* User Info Card */}
                      <div className="p-4 mb-3 bg-linear-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-12 h-12 bg-linear-to-br from-orange-500 to-orange-600 rounded-full shadow-md">
                                            <span className="text-lg font-bold text-white">
                                                {user.username?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <Link
                          href="/cart"
                          className="flex items-center justify-between px-4 py-3.5 text-gray-700 rounded-xl hover:bg-linear-to-r hover:from-orange-50 hover:to-amber-50 group transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                      >
                                    <span className="flex items-center">
                                        <div className="flex items-center justify-center w-9 h-9 mr-3 bg-linear-to-br from-orange-100 to-amber-100 rounded-lg group-hover:from-orange-200 group-hover:to-amber-200">
                                            <ShoppingCart className="w-4 h-4 text-orange-600" />
                                        </div>
                                        Cart
                                    </span>
                        {cartItemCount > 0 && (
                            <span className="px-2.5 py-1 text-xs font-bold text-white bg-linear-to-br from-orange-500 to-orange-600 rounded-full shadow-sm">
                                            {cartItemCount}
                                        </span>
                        )}
                      </Link>

                      {['/profile', '/orders', '/settings'].map((href, idx) => {
                        const icons = [User, Package, Settings];
                        const labels = ['Profile', 'My Orders', 'Settings'];
                        const Icon = icons[idx];
                        return (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center px-4 py-3.5 text-gray-700 rounded-xl hover:bg-linear-to-r hover:from-orange-50 hover:to-amber-50 group transition-all duration-200"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <div className="flex items-center justify-center w-9 h-9 mr-3 bg-linear-to-br from-orange-100 to-amber-100 rounded-lg group-hover:from-orange-200 group-hover:to-amber-200">
                                <Icon className="w-4 h-4 text-orange-600" />
                              </div>
                              {labels[idx]}
                            </Link>
                        );
                      })}

                      <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3.5 text-red-600 rounded-xl hover:bg-linear-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200 mt-2"
                      >
                        <div className="flex items-center justify-center w-9 h-9 mr-3 bg-linear-to-br from-red-100 to-red-50 rounded-lg">
                          <LogOut className="w-4 h-4 text-red-500" />
                        </div>
                        Log Out
                      </button>
                    </>
                ) : (
                    // Mobile - Logged Out
                    <>
                      <button
                          onClick={() => {
                            setShowSignIn(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="block w-full px-4 py-3.5 text-center text-gray-700 rounded-xl hover:bg-linear-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 mb-2"
                      >
                        Log In
                      </button>
                      <button
                          onClick={() => {
                            setShowSignUp(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="block w-full px-4 py-3.5 text-center text-white bg-linear-to-r from-orange-600 to-orange-500 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 active:scale-95"
                      >
                        Sign Up Free
                      </button>
                    </>
                )}
              </div>
            </div>
        )}

        <SignInModal
            isOpen={showSignIn}
            onClose={() => setShowSignIn(false)}
            onSignUpClick={() => { setShowSignIn(false); setShowSignUp(true) }}
            onForgotPasswordClick={() => { setShowSignIn(false); setShowForgotPassword(true) }}
        />

        <SignUpModal
            isOpen={showSignUp}
            onClose={() => setShowSignUp(false)}
            onSignInClick={() => {
              setShowSignUp(false);
              setShowSignIn(true);
            }}
        />

        <ForgotPasswordModal
            isOpen={showForgotPassword}
            onClose={() => setShowForgotPassword(false)}
            onSignInClick={() => { setShowForgotPassword(false); setShowSignIn(true) }}
        />
      </nav>
  );
};

export default Header;