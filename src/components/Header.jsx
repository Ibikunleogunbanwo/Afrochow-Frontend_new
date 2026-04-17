"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import {
    ShoppingCart, User, LogOut, Settings,
    Package, ChevronDown, ChevronRight, Store, HelpCircle, Bell,
} from "lucide-react";
import { MenuCloseIcon, NotificationIcon } from "@/components/ui/animated-state-icons";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { SignInModal } from "@/components/signin/SignInModal";
import { SignUpModal } from "@/components/register/SignUpModal";
import { ForgotPasswordModal } from "@/components/signin/ForgotPasswordModal";
import { useCart } from "@/contexts/CartContext";
import { SearchAPI } from "@/lib/api/search.api";
import { useSearchParams, useRouter as useNextRouter, usePathname } from "next/navigation";
import { useCustomerNotifications } from "@/hooks/useCustomerNotifications";
import CustomerNotificationDropdown from "@/components/customer/CustomerNotificationDropdown";

// ─── Sign-in param watcher ───────────────────────────────────────────────────
// Strips any stale ?signin=true from the URL without triggering the modal.
// The modal only opens via explicit user action (clicking Sign In).

const SignInParamWatcher = () => {
    const searchParams = useSearchParams();
    const router = useNextRouter();
    const pathname = usePathname();
    useEffect(() => {
        if (searchParams.get('signin') === 'true') {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('signin');
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);
    return null;
};

// ─── Nav category cache (module-level — survives re-renders and remounts) ─────

let _navCategoryCache = null;

// ─── Header ──────────────────────────────────────────────────────────────────

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    // Initialise from module-level cache to avoid a setState call in the effect.
    const [navCategories, setNavCategories] = useState(() => _navCategoryCache || []);
    const [notifOpen, setNotifOpen] = useState(false);

    const { cartCount, cartTotal } = useCart();
    const { user, isAuthenticated, logout } = useAuth();
    const { notifications, unreadCount, loading: notifLoading, markRead, markAllRead, deleteOne } =
        useCustomerNotifications();

    useEffect(() => {
        // Cache already populated (either this session or a previous mount).
        if (_navCategoryCache) return;
        SearchAPI.getAllCategories()
            .then(response => {
                if (response?.success && response?.data) {
                    _navCategoryCache = response.data.slice(0, 4).map(cat => ({
                        href: `/restaurants?categoryId=${cat.categoryId}`,
                        label: cat.name,
                    }));
                    setNavCategories(_navCategoryCache);
                }
            })
            .catch(error => console.error("Error loading nav categories:", error));
    }, []);

    // Close the mobile menu when the user scrolls more than 10px
    useEffect(() => {
        if (!isMobileMenuOpen) return;

        let startY = window.scrollY;

        const handleScroll = () => {
            if (Math.abs(window.scrollY - startY) > 10) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isMobileMenuOpen]);

    // Close the desktop profile dropdown when the user scrolls more than 10px
    useEffect(() => {
        if (!isMenuOpen) return;

        let startY = window.scrollY;

        const handleScroll = () => {
            if (Math.abs(window.scrollY - startY) > 10) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isMenuOpen]);

    // Close the notification dropdown when the user scrolls more than 10px
    useEffect(() => {
        if (!notifOpen) return;

        let startY = window.scrollY;

        const handleScroll = () => {
            if (Math.abs(window.scrollY - startY) > 10) {
                setNotifOpen(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [notifOpen]);

    const handleLogout = async () => {
        await logout();
        setIsMenuOpen(false);
        setIsMobileMenuOpen(false);
    };

    const handleSellClick = () => {
        setShowSignUp(true);
        setIsMobileMenuOpen(false);
    };

    const handleOpenSignIn = useCallback(() => setShowSignIn(true), []);

    // Global auth-modal bus: any page can dispatch `afrochow:open-auth-modal`
    // with detail.mode = 'signin' | 'signup' and the Header will pop the right
    // modal. Used by the anonymous-visitor banner on the restaurant page, and
    // any future "requireAuth(intent)" helper.
    useEffect(() => {
        const handler = (e) => {
            const mode = e?.detail?.mode;
            if (mode === 'signup') {
                setShowSignIn(false);
                setShowSignUp(true);
            } else {
                setShowSignUp(false);
                setShowSignIn(true);
            }
        };
        window.addEventListener('afrochow:open-auth-modal', handler);
        return () => window.removeEventListener('afrochow:open-auth-modal', handler);
    }, []);

    return (
        <>
            <Suspense fallback={null}>
                <SignInParamWatcher />
            </Suspense>

            <div className="sticky top-0 z-50 w-full flex justify-center px-3 sm:px-4 py-3 bg-transparent pointer-events-none">
                <nav className="pointer-events-auto w-full max-w-5xl bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-full shadow-lg shadow-black/8 px-3 py-2 flex items-center justify-between gap-2">

                    {/* Logo */}
                    <div className="flex items-center shrink-0 pl-1">
                        <Logo />
                    </div>

                    {/* Desktop Nav — lg and above */}
                    <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                        {navCategories.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className="px-3 py-2 text-sm font-medium text-gray-600 rounded-full hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 whitespace-nowrap"
                            >
                                {label}
                            </Link>
                        ))}
                        {!isAuthenticated && (
                            <button
                                onClick={handleSellClick}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 rounded-full hover:bg-gray-100 transition-all duration-200 whitespace-nowrap"
                            >
                                <Store className="w-3.5 h-3.5" />
                                Join Afrochow
                            </button>
                        )}
                    </div>

                    {/* Tablet Nav — md only */}
                    <div className="hidden md:flex lg:hidden items-center gap-1 flex-1 justify-center">
                        {navCategories.slice(0, 2).map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className="px-3 py-2 text-sm font-medium text-gray-600 rounded-full hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 whitespace-nowrap"
                            >
                                {label}
                            </Link>
                        ))}
                        {!isAuthenticated && (
                            <button
                                onClick={handleSellClick}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-full hover:bg-gray-100 transition-all duration-200 whitespace-nowrap"
                            >
                                <Store className="w-3.5 h-3.5" />
                                Sell
                            </button>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {isAuthenticated && user ? (
                            <>
                                {/* Cart */}
                                <Link
                                    href="/cart"
                                    className="relative flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-semibold text-sm transition-all duration-200"
                                    aria-label={`Cart - ${cartCount} items`}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span className="hidden sm:inline text-sm">CA${cartTotal.toFixed(2)}</span>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-900 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                            {cartCount > 9 ? "9+" : cartCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Notification bell — visible on all breakpoints */}
                                <div className="relative">
                                    <button
                                        onClick={() => { setNotifOpen(o => !o); setIsMenuOpen(false); setIsMobileMenuOpen(false); }}
                                        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        aria-label="Notifications"
                                    >
                                        <NotificationIcon
                                            state={unreadCount > 0}
                                            size={20}
                                            color="#4b5563"
                                        />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gray-900 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {notifOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                                            <div className="absolute right-0 top-full z-20">
                                                <CustomerNotificationDropdown
                                                    isOpen={notifOpen}
                                                    notifications={notifications}
                                                    unreadCount={unreadCount}
                                                    loading={notifLoading}
                                                    onClose={() => setNotifOpen(false)}
                                                    onMarkAllRead={markAllRead}
                                                    onMarkRead={markRead}
                                                    onDelete={deleteOne}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Desktop user dropdown */}
                                <div className="relative hidden md:block">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                                    >
                                        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shadow-sm shrink-0">
                                            <span className="text-sm font-bold text-white">
                                                {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                        </div>
                                        <span className="hidden xl:block text-sm font-semibold text-gray-800 max-w-20 truncate">
                                            {user.firstName || "Account"}
                                        </span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {isMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                            <div className="absolute right-0 top-full mt-2 z-20 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">

                                                {/* User info */}
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                                        {user.username || user.firstName || "User"}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                                </div>

                                                {/* Nav links */}
                                                <div className="p-1.5">
                                                    {[
                                                        { href: "/profile",        icon: User,        label: "Profile" },
                                                        { href: "/orders",         icon: Package,     label: "My Orders" },
                                                        { href: "/notifications",  icon: Bell,        label: "Notifications" },
                                                        { href: "/settings",       icon: Settings,    label: "Settings" },
                                                        { href: "/help",           icon: HelpCircle,  label: "Help & Support" },
                                                    ].map(({ href, icon: Icon, label }) => (
                                                        <Link
                                                            key={href}
                                                            href={href}
                                                            onClick={() => setIsMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                                        >
                                                            <Icon className="w-4 h-4 text-gray-400" />
                                                            {label}
                                                        </Link>
                                                    ))}
                                                </div>

                                                {/* Logout */}
                                                <div className="p-1.5 border-t border-gray-100">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4 text-gray-400" />
                                                        Log out
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowSignIn(true)}
                                className="hidden sm:flex items-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                            >
                                Sign In
                            </button>
                        )}

                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors ml-0.5"
                            aria-label="Toggle menu"
                        >
                            <MenuCloseIcon
                                state={isMobileMenuOpen}
                                size={20}
                                color="#4b5563"
                            />
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop — closes menu on outside tap */}
                        <div
                            className="pointer-events-auto fixed inset-0 z-10 bg-black/20 backdrop-blur-[1px]"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    <div className="pointer-events-auto absolute top-18 left-3 right-3 sm:left-4 sm:right-4 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-20">
                        <div className="divide-y divide-gray-100">

                            {isAuthenticated && user ? (
                                <>
                                    {/* User card */}
                                    <div className="flex items-center gap-3 px-4 py-4">
                                        <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-white">
                                                {user.firstName?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{user.username || user.firstName}</p>
                                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    {/* Cart */}
                                    <div className="px-3 py-2">
                                        <Link
                                            href="/cart"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <ShoppingCart className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700 font-medium flex-1">Cart</span>
                                            <span className="text-sm text-gray-500">CA${cartTotal.toFixed(2)}</span>
                                            {cartCount > 0 && (
                                                <span className="w-5 h-5 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                    {cartCount > 9 ? "9+" : cartCount}
                                                </span>
                                            )}
                                        </Link>
                                    </div>

                                    {/* Browse */}
                                    <div className="px-3 py-2">
                                        <p className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Browse</p>
                                        {navCategories.map(({ href, label }) => (
                                            <Link
                                                key={href}
                                                href={href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                {label}
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Account */}
                                    <div className="px-3 py-2">
                                        <p className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                                        {[
                                            { href: "/profile",  icon: User,       label: "Profile" },
                                            { href: "/orders",   icon: Package,    label: "My Orders" },
                                            { href: "/settings", icon: Settings,   label: "Settings" },
                                            { href: "/help",     icon: HelpCircle, label: "Help & Support" },
                                        ].map(({ href, icon: Icon, label }) => (
                                            <Link
                                                key={href}
                                                href={href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                <Icon className="w-4 h-4 text-gray-400" />
                                                <span className="flex-1">{label}</span>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                                            </Link>
                                        ))}
                                        {/* Notifications — shows unread badge */}
                                        <Link
                                            href="/notifications"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <NotificationIcon state={unreadCount > 0} size={16} color="#9ca3af" />
                                            <span className="flex-1">Notifications</span>
                                            {unreadCount > 0 && (
                                                <span className="w-5 h-5 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                    {unreadCount > 9 ? "9+" : unreadCount}
                                                </span>
                                            )}
                                            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="px-3 py-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 text-gray-400" />
                                            Log out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Browse */}
                                    <div className="px-3 py-2">
                                        {navCategories.map(({ href, label }) => (
                                            <Link
                                                key={href}
                                                href={href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                {label}
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                                            </Link>
                                        ))}
                                        <button
                                            onClick={handleSellClick}
                                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <Store className="w-4 h-4 text-gray-400" />
                                            <span className="flex-1 text-left">Join Afrochow</span>
                                            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                                        </button>
                                    </div>

                                    {/* Sign in */}
                                    <div className="px-4 py-3">
                                        <button
                                            onClick={() => { setShowSignIn(true); setIsMobileMenuOpen(false); }}
                                            className="w-full py-2.5 text-sm font-semibold text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            Sign In
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    </>
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