"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { setAuth, clearAuth, setLoading, setError } from "@/redux-store/authSlice";
import { AuthAPI } from "@/lib/api/auth.api";

const PUBLIC_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
];

const isPublicRoute = (pathname) => {
    if (pathname === '/' || pathname.startsWith('/restaurants')) {
        return true;
    }
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
};

export default function AuthInitializer({ children }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);

    // Ensure isAuthenticated is always a boolean to prevent dependency array size changes
    const isAuth = Boolean(isAuthenticated);
    const userRole = user?.role?.toUpperCase();

    // Initial auth check - only runs once on mount
    useEffect(() => {
        const initializeAuth = async () => {
            dispatch(setLoading(true));

            try {
                const { isAuthenticated, user } = await AuthAPI.checkAuth();

                if (isAuthenticated && user) {
                    dispatch(setAuth({ user }));
                } else {
                    dispatch(clearAuth());
                }
            } catch (error) {
                console.error("Auth initialization failed:", error);
                dispatch(setError(error.message));
                dispatch(clearAuth());
            } finally {
                dispatch(setLoading(false));
            }
        };

        initializeAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Route protection logic - runs when pathname or auth state changes
    useEffect(() => {
        if (isLoading) return; // Don't redirect while loading

        if (isAuth) {
            // Redirect authenticated users away from public auth routes
            if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
                const dashboardRoute = userRole === 'ADMIN'
                    ? '/admin/dashboard'
                    : userRole === 'VENDOR'
                        ? '/vendor/dashboard'
                        : '/';
                router.push(dashboardRoute);
                return;
            }

            // Role-based redirects
            if (userRole === 'ADMIN' && pathname.startsWith('/vendor')) {
                router.push('/admin/dashboard');
                return;
            }

            if (userRole === 'VENDOR' && pathname.startsWith('/admin')) {
                router.push('/vendor/dashboard');
                return;
            }
        } else {
            // Redirect unauthenticated users from protected routes
            const isProtectedRoute = !isPublicRoute(pathname) &&
                (pathname.startsWith('/admin') || pathname.startsWith('/vendor') || pathname.startsWith('/profile') || pathname.startsWith('/orders'));

            if (isProtectedRoute) {
                router.push('/login');
            }
        }
    }, [pathname, isAuth, isLoading, router, userRole]);

    // Token refresh interval - only when authenticated
    useEffect(() => {
        let refreshInterval;
        if (isAuth) {
            refreshInterval = setInterval(async () => {
                try {
                    const response = await AuthAPI.refreshToken();
                    if (response.success && response.data) {
                        dispatch(setAuth({ user: response.data }));
                    }
                } catch (error) {
                    console.error("Token refresh failed:", error);
                    if (error.message.includes('401') || error.message.includes('403')) {
                        dispatch(clearAuth());
                        router.push('/login');
                    }
                }
            }, 14 * 60 * 1000); // 14 minutes
        }

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [isAuth, dispatch, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
        );
    }

    return <>{children}</>;
}