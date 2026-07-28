"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
    selectUser,
    selectIsAuthenticated,
    selectIsLoading,
    selectError,
    selectUserRole,
    selectPublicUserId,
    selectUsername,
    selectEmail,
    selectVendorIsActive,
    selectVendorIsVerified,
    selectVendorStatus,
    selectIsProfileComplete,
    setAuth,
    clearAuth,
    setError,
    setLoading,
    markProfileComplete,
} from "@/redux-store/authSlice";
import { AuthAPI } from "@/lib/api/auth.api";
import { RegistrationAPI } from "@/lib/api/registration.api";
import { CustomerAPI } from "@/lib/api/customer.api";
import { FavoritesAPI } from "@/lib/api/favorites.api";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/components/ui/toast";

// Applies a favorite a guest tried to add before signing in (stashed by
// FavoritesContext.toggleFavorite in sessionStorage as "pendingFavorite").
// Best-effort: any failure (already favorited, network hiccup, etc.) is
// swallowed — worst case the user just taps the heart again themselves.
const completePendingFavoriteIntent = async (userData) => {
    let raw;
    try {
        raw = sessionStorage.getItem("pendingFavorite");
        sessionStorage.removeItem("pendingFavorite");
    } catch {
        return;
    }
    if (!raw || userData?.role !== "CUSTOMER") return;

    try {
        const { favoriteType, targetPublicId, name } = JSON.parse(raw);
        if (!favoriteType || !targetPublicId) return;

        await FavoritesAPI.addFavorite(favoriteType, targetPublicId);
        const label = name || (favoriteType === "VENDOR" ? "Restaurant" : "Dish");
        toast.success("Added to favorites", {
            description: `${label} saved to your favorites.`,
        });
    } catch {
        // Already favorited (409) or any other failure — silently skip.
    }
};

const ROLE_ROUTES = {
    VENDOR: "/vendor/dashboard",
    ADMIN: "/admin/dashboard",
    SUPERADMIN: "/admin/dashboard",
};

// Prefixes that are restricted to specific roles.
// Used to sanitise a stale `returnTo` value stored before the user logged in —
// e.g. an expired admin session stores returnTo=/admin/dashboard, a customer
// then logs in and must NOT be sent there.
const ROLE_RESTRICTED_PREFIXES = {
    "/admin":  ["ADMIN", "SUPERADMIN"],
    "/vendor": ["VENDOR"],
};

function isValidReturnTo(path, role) {
    if (!path) return false;
    for (const [prefix, allowed] of Object.entries(ROLE_RESTRICTED_PREFIXES)) {
        if (path.startsWith(prefix)) return allowed.includes(role);
    }
    return true; // no restriction — any authenticated role may return here
}

export const useAuth = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const role = useSelector(selectUserRole);
    const publicUserId = useSelector(selectPublicUserId);
    const username = useSelector(selectUsername);
    const email = useSelector(selectEmail);
    const vendorIsActive = useSelector(selectVendorIsActive);
    const vendorIsVerified = useSelector(selectVendorIsVerified);
    const vendorStatus = useSelector(selectVendorStatus);
    const isProfileComplete = useSelector(selectIsProfileComplete);

    const { clearCart } = useCart();

    const login = async (identifier, password) => {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const result = await AuthAPI.login(identifier, password);

            if (!result?.data) {
                throw new Error("Invalid response from server");
            }

            const userData = result.data;

            if (!userData.role || !userData.publicUserId) {
                throw new Error("Invalid user data received");
            }

            // Runs before dispatch(setAuth(...)) — the login cookie is already
            // set by AuthAPI.login() above, so the API call itself succeeds
            // either way, but completing it first means FavoritesContext's
            // hydration fetch (triggered by the isAuthenticated change below)
            // picks up the newly-added favorite on its very first load.
            await completePendingFavoriteIntent(userData);

            dispatch(setAuth({ user: userData }));

            // Vendors and admins always go to their own dashboards.
            // Customers return to wherever they were trying to go (set by
            // AuthInitializer when it bounced them to the sign-in modal),
            // falling back to home if there's nothing stored.
            const roleRoute = ROLE_ROUTES[userData.role];
            let destination;
            if (roleRoute) {
                destination = roleRoute;
            } else {
                const returnTo = sessionStorage.getItem('returnTo');
                sessionStorage.removeItem('returnTo');
                // Sanitise returnTo: if it points to a role-restricted prefix that
                // doesn't match the current user's role (e.g. a stale /admin path
                // stored from a previous admin session) fall back to home rather
                // than landing a CUSTOMER on the admin dashboard.
                const safeReturnTo = isValidReturnTo(returnTo, userData.role) ? returnTo : null;
                destination = safeReturnTo || "/";
            }
            router.push(destination);
            return destination;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Login failed";
            dispatch(setError(errorMessage));
            throw err; // Re-throw so the modal can show the appropriate toast
        } finally {
            dispatch(setLoading(false));
        }
    };

    const loginWithGoogle = async (code, context) => {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const result = await AuthAPI.googleAuth(code, context);

            if (!result?.data) throw new Error("Invalid response from server");

            const userData = result.data;

            if (!userData.role || !userData.publicUserId) {
                throw new Error("Invalid user data received");
            }

            // See the equivalent call in login() above for why this runs
            // before dispatch(setAuth(...)).
            await completePendingFavoriteIntent(userData);

            dispatch(setAuth({ user: userData }));

            // New Google users who haven't completed their profile go to onboarding
            if (userData.isProfileComplete === false) {
                router.push("/onboarding");
                return "/onboarding";
            }

            const roleRoute = ROLE_ROUTES[userData.role];
            let destination;
            if (roleRoute) {
                destination = roleRoute;
            } else {
                const returnTo = sessionStorage.getItem('returnTo');
                sessionStorage.removeItem('returnTo');
                const safeReturnTo = isValidReturnTo(returnTo, userData.role) ? returnTo : null;
                destination = safeReturnTo || "/";
            }
            router.push(destination);
            return destination;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Google sign-in failed";
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const completeOnboarding = async (data) => {
        try {
            const result = await CustomerAPI.completeProfile(data);
            // Re-fetch the full user from the server so Redux reflects the
            // updated name, phone, address etc. saved during onboarding —
            // rather than keeping the stale Google-provided snapshot.
            const { isAuthenticated: stillAuth, user: freshUser } = await AuthAPI.checkAuth();
            if (stillAuth && freshUser) {
                dispatch(setAuth({ user: freshUser }));
            } else {
                dispatch(markProfileComplete());
            }
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to complete profile";
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    // `silent: true` lets callers (e.g. the "sign out of all devices" flow)
    // show their own more-specific toast without the generic one duplicating it.
    const logout = async ({ silent = false } = {}) => {
        try {
            await AuthAPI.logout();
        } catch (err) {
            // Swallow API errors — we still want to clear local state
            console.error("Logout API call failed:", err);
        } finally {
            dispatch(clearAuth());
            clearCart();
            if (!silent) {
                toast.success("Signed out", { description: "You have been successfully signed out." });
            }
            // replace() removes the current entry from history so pressing
            // Back after logout cannot navigate back into authenticated pages.
            router.replace("/");
        }
    };

    const registerCustomer = async (data) => {
        try {
            return await RegistrationAPI.registerCustomer(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Registration failed";
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const registerVendor = async (data) => {
        try {
            return await RegistrationAPI.registerVendor(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Registration failed";
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const getCustomerProfile = async () => {
        try {
            return await CustomerAPI.getCustomerProfile();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const updateCustomerProfile = async (data) => {
        try {
            return await CustomerAPI.updateCustomerProfile(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const addAddress = async (addressData) => {
        try {
            return await CustomerAPI.addAddress(addressData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to add address";
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const updateAddress = async (publicAddressId, addressData) => {
        try {
            return await CustomerAPI.updateAddress(publicAddressId, addressData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update address";
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const deleteAddress = async (publicAddressId) => {
        try {
            return await CustomerAPI.deleteAddress(publicAddressId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete address";
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const setDefaultAddress = async (publicAddressId) => {
        try {
            return await CustomerAPI.setDefaultAddress(publicAddressId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to set default address";
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const changePassword = async (currentPassword, newPassword, confirmPassword) => {
        try {
            return await AuthAPI.changePassword(currentPassword, newPassword, confirmPassword);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to change password";
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const getSavedAddresses = async () => {
        try {
            return await CustomerAPI.savedAddress();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load addresses";
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    /**
     * Guard for protected pages. Call at the top of a page component.
     * Redirects unauthenticated users to the sign-in modal trigger,
     * and users without the required role to /unauthorized.
     */
    const requireAuth = (requiredRole) => {
        if (isLoading) return false;

        if (!isAuthenticated) {
            // replace() so the protected page isn't left in history.
            // No ?signin=true — the modal only opens when the user clicks Sign In.
            router.replace("/");
            return false;
        }

        // SUPERADMIN satisfies any ADMIN-level requirement
        const effectiveRole = role === 'SUPERADMIN' ? 'ADMIN' : role;
        if (requiredRole && effectiveRole !== requiredRole) {
            router.push("/unauthorized");
            return false;
        }

        return true;
    };

    return {
        // User data
        user,
        publicUserId,
        username,
        email,
        role,
        vendorIsActive,
        vendorIsVerified,
        vendorStatus,
        isProfileComplete,

        // State
        isAuthenticated,
        isLoading,
        error,

        // Actions
        login,
        loginWithGoogle,
        completeOnboarding,
        logout,
        registerCustomer,
        registerVendor,
        requireAuth,

        // Profile & address management
        getCustomerProfile,
        updateCustomerProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        changePassword,
        getSavedAddresses,
    };
};