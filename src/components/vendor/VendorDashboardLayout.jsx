"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {usePathname, useRouter} from 'next/navigation';
import Link from 'next/link';
import { Menu, Search, Bell, Clock, ShieldOff, XCircle, RefreshCw, Pencil, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/toast";
import { VendorProfileAPI } from '@/lib/api/vendor/profile.api';
import { AuthAPI } from '@/lib/api/auth.api';
import { getAvatarUrl } from "@/components/avatar";
import Sidebar from '@/components/VendorDashboardLayout/Sidebar';
import MobileSidebar from '@/components/VendorDashboardLayout/MobileSidebar';
import NotificationDropdown from '@/components/VendorDashboardLayout/NotificationDropdown';
import AvatarDisplay from '@/components/VendorDashboardLayout/AvatarDisplay';
import {useAuth} from "@/hooks/useAuth";
import { useDispatch } from 'react-redux';
import { updateVendorStatus } from '@/redux-store/authSlice';
import { useVendorNotifications } from "@/hooks/useVendorNotifications";

const VendorDashboardLayout = ({ children }) => {
    const pathname = usePathname();
    const dispatch = useDispatch();

    const { user, isAuthenticated, logout, vendorIsActive, vendorIsVerified } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);


    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    const { notifications, unreadCount, loading: notifsLoading, markRead, markAllRead, deleteOne } = useVendorNotifications();

    // Derive per-tab badge counts from unread notifications
    const badgeCounts = {
        '/vendor/orders':        notifications.filter(n => n.unread && n.href === '/vendor/orders').length        || null,
        '/vendor/reviews':       notifications.filter(n => n.unread && n.href === '/vendor/reviews').length       || null,
        '/vendor/notifications': unreadCount || null,
    };

    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) return; // Don't fetch until session is confirmed — prevents
        // the "Session expired" toast that fires when the layout briefly renders before
        // the route-protection redirect completes for unauthenticated users.
        fetchProfile().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);



    const fetchProfile = async () => {
        setLoading(true);
        try {
            const [profileResponse, userResponse] = await Promise.all([
                VendorProfileAPI.getVendorProfile(),
                AuthAPI.getCurrentUser().catch(() => null),
            ]);

            if (profileResponse?.success) {
                const profileData = profileResponse.data;
                setProfile({
                    ...profileData,
                    user: userResponse?.success ? userResponse.data : null,
                });
                // Sync the live isActive/isVerified into Redux so the sidebar badge
                // and status banners always reflect the current DB state, not the
                // stale snapshot from login time.
                dispatch(updateVendorStatus({
                    isActive:   profileData.isActive,
                    isVerified: profileData.isVerified,
                }));
            } else {
                throw new Error("Failed to fetch profile");
            }
        } catch (err) {
            // Only redirect to sign-in for genuine session failures (401/403).
            // Inactive or pending vendors have a valid session — they should
            // stay on the dashboard and see their status banner instead.
            const status = err?.status ?? err?.response?.status;
            if (status === 401 || status === 403) {
                toast.error("Session expired. Please log in again.");
                setProfile(null);
                router.push("/?signin=true");
            } else {
                // Leave profile null; the layout will render a status banner
                // or a generic error state rather than bouncing the vendor out.
                setProfile(null);
            }
        } finally {
            setLoading(false);
        }
    };


    const [resubmitting, setResubmitting] = useState(false);
    const [resubmitDone, setResubmitDone] = useState(false);

    const handleResubmit = async () => {
        setResubmitting(true);
        try {
            await VendorProfileAPI.resubmitForReview();
            setResubmitDone(true);
            toast.success("Application resubmitted! Our team will review it shortly.");
        } catch (e) {
            toast.error(e.message || "Could not resubmit. Please try again.");
        } finally {
            setResubmitting(false);
        }
    };

    const handleLogout = async () => {
        await logout();
    };


    const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
    const toggleNotifications = useCallback(() => setNotificationsOpen(prev => !prev), []);
    const toggleProfile = useCallback(() => setProfileOpen(prev => !prev), []);


    const userData = profile
        ? {
            name: profile.restaurantName || 'Vendor',
            email: profile.user?.email || 'vendor@afrochow.com',
            avatar: getAvatarUrl({          // ← pass restaurantName first
                restaurantName: profile.restaurantName,
                email: profile.user?.email
            }),
            initials: (profile.restaurantName || 'Vendor')
                .split(' ')
                .map(w => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }


    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <Sidebar
                pathname={pathname}
                user={userData}
                onLogout={handleLogout}
                badgeCounts={badgeCounts}
                collapsed={sidebarCollapsed}
                onCollapsedChange={setSidebarCollapsed}
                vendorIsActive={vendorIsActive}
                vendorIsVerified={vendorIsVerified}
                vendorVerifiedAt={profile?.verifiedAt ?? null}
            />

            {/* Mobile Sidebar */}
            <MobileSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                pathname={pathname}
                onLogout={handleLogout}
                badgeCounts={badgeCounts}
                vendorIsActive={vendorIsActive}
                vendorIsVerified={vendorIsVerified}
                vendorVerifiedAt={profile?.verifiedAt ?? null}
            />

            {/* Main Content */}
            <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-72'}`}>
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Left - Mobile Menu & Search */}
                            <div className="flex items-center space-x-4 flex-1">
                                <button
                                    onClick={toggleSidebar}
                                    className="lg:hidden p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100"
                                    aria-label="Open menu"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>

                                {/* Search Bar */}
                                <div className="hidden md:flex items-center flex-1 max-w-lg">
                                    <div className="relative w-full">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search orders, products..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right - Notifications & Profile */}
                            <div className="flex items-center space-x-4">
                                {/* Notifications */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={toggleNotifications}
                                        className="relative p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100"
                                        aria-label="Notifications"
                                        aria-expanded={notificationsOpen}
                                    >
                                        <Bell className="w-6 h-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-black bg-red-500 text-white rounded-full flex items-center justify-center leading-none">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    <NotificationDropdown
                                        isOpen={notificationsOpen}
                                        notifications={notifications}
                                        unreadCount={unreadCount}
                                        loading={notifsLoading}
                                        onClose={() => setNotificationsOpen(false)}
                                        onMarkRead={markRead}
                                        onMarkAllRead={markAllRead}
                                        onDelete={deleteOne}
                                    />
                                </div>

                                {/* Profile - Mobile */}
                                <div className="lg:hidden">
                                    <button className="flex items-center" aria-label="Profile">
                                        <AvatarDisplay user={userData} size="default" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Vendor status banners */}

                {/* ── Rejected: isActive=false AND isVerified=false ── */}
                {vendorIsActive === false && vendorIsVerified === false && !resubmitDone && (
                    <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-red-800 text-sm">Application not approved</p>
                                <p className="text-red-700 text-sm mt-0.5">
                                    Your store application was reviewed but could not be approved at this time.
                                    Please update your store details to address any issues, then resubmit for review.
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Link
                                        href="/vendor/profile"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        Edit Store Profile
                                    </Link>
                                    <button
                                        onClick={handleResubmit}
                                        disabled={resubmitting}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors disabled:opacity-60"
                                    >
                                        {resubmitting
                                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Resubmitting…</>
                                            : <><RefreshCw className="w-3.5 h-3.5" /> Resubmit for Review</>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Resubmit success ── */}
                {resubmitDone && (
                    <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                        <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-orange-800 text-sm">Application resubmitted</p>
                            <p className="text-orange-700 text-sm mt-0.5">
                                Your application is back under review — this typically takes 24–48 hours. We&apos;ll email you once a decision is made.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Suspended: isActive=false AND isVerified=true ── */}
                {vendorIsActive === false && vendorIsVerified === true && (
                    <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                        <ShieldOff className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-800 text-sm">Store suspended</p>
                            <p className="text-red-700 text-sm mt-0.5">
                                Your store has been suspended by an admin. You cannot receive orders at this time. Please contact support if you believe this is a mistake.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Pending: isActive=true AND isVerified=false ── */}
                {vendorIsActive !== false && vendorIsVerified === false && (
                    <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                        <Clock className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-orange-800 text-sm">Pending admin approval</p>
                            <p className="text-orange-700 text-sm mt-0.5">
                                Your store is under review — this typically takes 24–48 hours. You can set up your menu and profile while you wait, but you won&apos;t receive orders until approved.
                            </p>
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default VendorDashboardLayout;