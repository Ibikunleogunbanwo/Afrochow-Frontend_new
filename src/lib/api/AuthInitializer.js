"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { setAuth, clearAuth, setLoading, setError } from "@/redux-store/authSlice";
import { AuthAPI } from "@/lib/api/auth.api";
import { toast } from "sonner";

// How long a user can be inactive before being silently logged out.
const IDLE_TIMEOUT_MS   = 30 * 60 * 1000; // 30 minutes
const IDLE_WARNING_MS   = 28 * 60 * 1000; // warn 2 minutes before logout
const ACTIVITY_THROTTLE =       1_000;    // ignore bursts — only reset once per second

const IDLE_ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

const PUBLIC_ROUTES = [
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
    }, []);

    // Route protection logic - runs when pathname or auth state changes
    useEffect(() => {
        if (isLoading) return;

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
                router.push('/?signin=true');
            }
        }
    }, [pathname, isAuth, isLoading, router, userRole]);

    // ── Idle-timeout logout ───────────────────────────────────────────────────
    // When the user is inactive for IDLE_TIMEOUT_MS we clear auth state
    // client-side only — no backend round-trip — so an expired/gone session
    // never hits the API at all.
    useEffect(() => {
        if (!isAuth) return;

        const idleTimerRef   = { id: null };
        const warningTimerRef = { id: null };
        const lastActivityRef = { ts: Date.now() };

        const resetTimers = () => {
            clearTimeout(idleTimerRef.id);
            clearTimeout(warningTimerRef.id);
            toast.dismiss('idle-warning');

            warningTimerRef.id = setTimeout(() => {
                toast.warning('You will be logged out in 2 minutes due to inactivity.', {
                    id: 'idle-warning',
                    duration: 2 * 60 * 1000,
                    action: {
                        label: 'Stay logged in',
                        onClick: resetTimers,
                    },
                });
            }, IDLE_WARNING_MS);

            idleTimerRef.id = setTimeout(() => {
                toast.dismiss('idle-warning');
                toast.info('You were logged out due to inactivity.');
                dispatch(clearAuth());
                router.push('/?signin=true');
            }, IDLE_TIMEOUT_MS);
        };

        const onActivity = () => {
            const now = Date.now();
            if (now - lastActivityRef.ts < ACTIVITY_THROTTLE) return;
            lastActivityRef.ts = now;
            resetTimers();
        };

        IDLE_ACTIVITY_EVENTS.forEach(e =>
            window.addEventListener(e, onActivity, { passive: true })
        );
        resetTimers(); // arm timers immediately on auth

        return () => {
            clearTimeout(idleTimerRef.id);
            clearTimeout(warningTimerRef.id);
            toast.dismiss('idle-warning');
            IDLE_ACTIVITY_EVENTS.forEach(e =>
                window.removeEventListener(e, onActivity)
            );
        };
    }, [isAuth, dispatch, router]);

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
                        router.push('/?signin=true');
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