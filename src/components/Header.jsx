"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import {
    ShoppingCart, User, LogOut, Settings,
    Package, ChevronDown, ChevronRight, Store, HelpCircle, Bell, Heart, MapPin,
} from "lucide-react";
import { MenuCloseIcon, NotificationIcon } from "@/components/ui/animated-state-icons";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { SignInModal } from "@/components/signin/SignInModal";
import { SignUpModal } from "@/components/register/SignUpModal";
import { ForgotPasswordModal } from "@/components/signin/ForgotPasswordModal";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "@/contexts/LocationContext";
import LocationSearchInput from "@/components/LocationSearchInput";
import { SearchAPI } from "@/lib/api/search.api";
import { useSearchParams, useRouter as useNextRouter, usePathname } from "next/navigation";
import { useCustomerNotifications } from "@/hooks/useCustomerNotifications";
import CustomerNotificationDropdown from "@/components/customer/CustomerNotificationDropdown";
import {
    customerWaitlistPath,
    isCustomerWaitlistMode,
    isOrderingEnabled,
    isVendorOnboardingEnabled,
} from "@/lib/mvp";

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
    const [locationOpen, setLocationOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);

    const locationDropdownRef = useRef(null);
    const notifDropdownRef = useRef(null);
    const accountDropdownRef = useRef(null);
    const categoriesDropdownRef = useRef(null);

    const { cartCount, cartTotal } = useCart();
    const { user, isAuthenticated, logout } = useAuth();
    const { city, isDetecting } = useLocation();
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

    // Close the location dropdown when the user scrolls more than 10px
    useEffect(() => {
        if (!locationOpen) return;

        let startY = window.scrollY;

        const handleScroll = () => {
            if (Math.abs(window.scrollY - startY) > 10) {
                setLocationOpen(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [locationOpen]);

    // Close the categories dropdown when the user scrolls more than 10px
    useEffect(() => {
        if (!categoriesOpen) return;

        let startY = window.scrollY;

        const handleScroll = () => {
            if (Math.abs(window.scrollY - startY) > 10) {
                setCategoriesOpen(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [categoriesOpen]);

    // Close-on-outside-click for the four nav dropdowns (location, categories,
    // notifications, account). Deliberately NOT using a `fixed inset-0` backdrop div here — the
    // <nav> has `backdrop-blur-xl` (backdrop-filter), which establishes a new
    // containing block for `position: fixed` descendants. That silently shrinks a
    // nested fixed-inset backdrop down to the nav's own thin strip instead of the
    // full viewport, so clicks anywhere on the actual page never reach it. A
    // document-level listener + ref containment check sidesteps that entirely.
    useEffect(() => {
        if (!locationOpen) return;
        const handler = (e) => {
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) {
                setLocationOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [locationOpen]);

    useEffect(() => {
        if (!categoriesOpen) return;
        const handler = (e) => {
            if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(e.target)) {
                setCategoriesOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [categoriesOpen]);

    useEffect(() => {
        if (!notifOpen) return;
        const handler = (e) => {
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [notifOpen]);

    useEffect(() => {
        if (!isMenuOpen) return;
        const handler = (e) => {
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isMenuOpen]);

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
    const accountLinks = [
        { href: "/profile", icon: User, label: "Profile", customerOnly: false },
        { href: "/orders", icon: Package, label: "My Orders", customerOnly: true },
        { href: "/favorites", icon: Heart, label: "Favorites", customerOnly: true },
        { href: "/notifications", icon: Bell, label: "Notifications", customerOnly: true },
        { href: "/settings", icon: Settings, label: "Settings", customerOnly: false },
        { href: "/help", icon: HelpCircle, label: "Help & Support", customerOnly: false },
    ].filter(link => isOrderingEnabled || !link.customerOnly);

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

                    {/* Left group — Logo + Location. Sized to its own content (no flex-1) so
                        the nav's `justify-between` splits the leftover space evenly between
                        this group, the category dropdown, and the right group — equal gaps on
                        both sides regardless of how wide the left/right content is. */}
                    <div className="flex items-center gap-1 min-w-0">
                        {/* Logo */}
                        <div className="flex items-center shrink-0 pl-1">
                            <Logo />
                        </div>

                        {/* Location picker — md and above */}
                        <div className="relative hidden md:block shrink-0" ref={locationDropdownRef}>
                            <button
                                onClick={() => { setLocationOpen(o => !o); setIsMenuOpen(false); setNotifOpen(false); setCategoriesOpen(false); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-1.5 px-2.5 py-2 rounded-full hover:bg-gray-100 transition-all duration-200 max-w-[8.5rem] lg:max-w-[10rem]"
                                aria-label="Change delivery location"
                            >
                                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span className="text-sm font-medium text-gray-700 truncate">
                                    {isDetecting ? "Locating…" : (city || "Set location")}
                                </span>
                                <ChevronDown className={`hidden lg:block w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${locationOpen ? "rotate-180" : ""}`} />
                            </button>

                            {locationOpen && (
                                <div className="absolute left-0 top-full mt-2 z-20 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg p-3">
                                    <LocationSearchInput
                                        compact
                                        placeholder="Search city or address…"
                                        onSelect={() => setLocationOpen(false)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category menu — md and above. A single fixed-width dropdown trigger
                        replaces the old three-variant horizontal link rows (which kept
                        overflowing/crowding the bar as content grew — e.g. the unauthenticated
                        view adding "Sell on Afrochow" + "Sign In"). Fixed width means this
                        block never fights the left/right flex-1 groups for space, so the bar
                        stays visually centered and never overlaps regardless of category count
                        or auth state. */}
                    <div className="relative hidden md:block shrink-0" ref={categoriesDropdownRef}>
                        <button
                            onClick={() => { setCategoriesOpen(o => !o); setIsMenuOpen(false); setNotifOpen(false); setLocationOpen(false); setIsMobileMenuOpen(false); }}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 rounded-full hover:bg-gray-100 transition-all duration-200 whitespace-nowrap"
                        >
                            Browse Categories
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`} />
                        </button>

                        {categoriesOpen && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg p-1.5">
                                {navCategories.map(({ href, label }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setCategoriesOpen(false)}
                                        className="block px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                                    >
                                        {label}
                                    </Link>
                                ))}
                                {!isAuthenticated && (isCustomerWaitlistMode || isVendorOnboardingEnabled) && (
                                    <div className="my-1 border-t border-gray-100" />
                                )}
                                {!isAuthenticated && isCustomerWaitlistMode && (
                                    <Link
                                        href={customerWaitlistPath}
                                        onClick={() => setCategoriesOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <Heart className="w-3.5 h-3.5 text-gray-400" />
                                        Join Waitlist
                                    </Link>
                                )}
                                {!isAuthenticated && isVendorOnboardingEnabled && (
                                    <button
                                        onClick={() => { setCategoriesOpen(false); handleSellClick(); }}
                                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <Store className="w-3.5 h-3.5 text-gray-400" />
                                        Sell on Afrochow
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right side — sized to its own content (no flex-1); see left group's
                        comment above for why. */}
                    <div className="flex items-center gap-1.5 min-w-0">
                        {isAuthenticated && user ? (
                            <>
                                {/* Cart */}
                                {isOrderingEnabled ? (
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
                                ) : (
                                    <Link
                                        href={customerWaitlistPath}
                                        className="hidden sm:flex items-center px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-all duration-200"
                                    >
                                        Waitlist
                                    </Link>
                                )}

                                {/* Notification bell — visible on all breakpoints */}
                                {isOrderingEnabled && (
                                <div className="relative" ref={notifDropdownRef}>
                                    <button
                                        onClick={() => { setNotifOpen(o => !o); setIsMenuOpen(false); setLocationOpen(false); setCategoriesOpen(false); setIsMobileMenuOpen(false); }}
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
                                    )}
                                </div>
                                )}

                                {/* Desktop user dropdown */}
                                <div className="relative hidden md:block" ref={accountDropdownRef}>
                                    <button
                                        onClick={() => { setIsMenuOpen(o => !o); setNotifOpen(false); setLocationOpen(false); setCategoriesOpen(false); }}
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
                                                    {accountLinks.map(({ href, icon: Icon, label }) => (
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
                            onClick={() => { setIsMobileMenuOpen(o => !o); setIsMenuOpen(false); setNotifOpen(false); setLocationOpen(false); setCategoriesOpen(false); }}
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

                            {/* Location — mobile only, shown regardless of auth state */}
                            <div className="px-3 py-3">
                                <p className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Delivering to</p>
                                <LocationSearchInput compact className="px-3" placeholder="Search city or address…" />
                            </div>

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

                                    {isOrderingEnabled ? (
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
                                    ) : (
                                        <div className="px-3 py-2">
                                            <Link
                                                href={customerWaitlistPath}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-emerald-700 transition-colors"
                                            >
                                                <Heart className="w-4 h-4 text-emerald-500" />
                                                <span className="text-sm font-medium flex-1">Join Customer Waitlist</span>
                                            </Link>
                                        </div>
                                    )}

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
                                        {accountLinks.filter(link => link.href !== "/notifications").map(({ href, icon: Icon, label }) => (
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
                                        {isOrderingEnabled && (
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
                                        )}
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
                                        {isCustomerWaitlistMode && (
                                            <Link
                                                href={customerWaitlistPath}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                <Heart className="w-4 h-4 text-gray-400" />
                                                <span className="flex-1 text-left">Join Customer Waitlist</span>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                                            </Link>
                                        )}
                                        {isVendorOnboardingEnabled && (
                                            <button
                                                onClick={handleSellClick}
                                                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                <Store className="w-4 h-4 text-gray-400" />
                                                <span className="flex-1 text-left">Sell on Afrochow</span>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                                            </button>
                                        )}
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
