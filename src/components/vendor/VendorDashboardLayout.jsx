"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {usePathname, useRouter} from 'next/navigation';
import { Menu, Search, Bell } from 'lucide-react';
import { toast } from "@/components/ui/toast";
import { VendorProfileAPI } from '@/lib/api/vendor/profile.api';
import { AuthAPI } from '@/lib/api/auth.api';
import { getAvatarUrl } from "@/components/avatar";
import Sidebar from '@/components/VendorDashboardLayout/Sidebar';
import MobileSidebar from '@/components/VendorDashboardLayout/MobileSidebar';
import NotificationDropdown from '@/components/VendorDashboardLayout/NotificationDropdown';
import AvatarDisplay from '@/components/VendorDashboardLayout/AvatarDisplay';
import {useAuth} from "@/hooks/useAuth";

const VendorDashboardLayout = ({ children }) => {
    const pathname = usePathname();

    const { user, isAuthenticated, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);


    const notificationRef = useRef(null);
    const profileRef = useRef(null);


    const notifications = [
        { id: 1, text: "New order #12345 received", time: "2 min ago", unread: true },
        { id: 2, text: "Payment processed successfully", time: "1 hour ago", unread: true },
        { id: 3, text: "New review from John Doe", time: "3 hours ago", unread: false },
    ];

    const router = useRouter();

    useEffect(() => {
        fetchProfile()
            .then(() => {
            })
            .catch(() => {
            });
    }, []);



    const fetchProfile = async () => {
        setLoading(true);
        try {
            const [profileResponse, userResponse] = await Promise.all([
                VendorProfileAPI.getVendorProfile(),
                AuthAPI.getCurrentUser().catch((err) => {
                    return null;
                }),
            ]);

            if (profileResponse?.success) {
                setProfile({
                    ...profileResponse.data,
                    user: userResponse?.success ? userResponse.data : null,
                });
            } else {
                throw new Error("Failed to fetch profile");
            }
        } catch (err) {
            toast.error("Session expired. Please log in again.");
            setProfile(null);
            router.push("/login");
        } finally {
            setLoading(false);
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
                profileOpen={profileOpen}
                onProfileToggle={toggleProfile}
                onLogout={handleLogout}
                profileRef={profileRef}
            />

            {/* Mobile Sidebar */}
            <MobileSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                pathname={pathname}
            />

            {/* Main Content */}
            <div className="lg:pl-72">
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
                                        {notifications.filter(n => n.unread).length > 0 && (
                                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                    </button>

                                    <NotificationDropdown
                                        isOpen={notificationsOpen}
                                        notifications={notifications}
                                        onClose={() => setNotificationsOpen(false)}
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

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default VendorDashboardLayout;