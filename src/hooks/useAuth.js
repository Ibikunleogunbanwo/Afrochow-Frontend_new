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
    setAuth,
    clearAuth,
    setError,
    setLoading,
} from "@/redux-store/authSlice";
import { AuthAPI } from "@/lib/api/auth.api";
import { RegistrationAPI } from "@/lib/api/registration.api";
import { CustomerAPI } from "@/lib/api/customer.api";
import { useCart } from "@/contexts/CartContext";

const ROLE_ROUTES = {
    VENDOR: "/vendor/dashboard",
    ADMIN: "/admin/dashboard",
    SUPERADMIN: "/admin/dashboard",
};

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
                destination = returnTo || "/";
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

    const logout = async () => {
        try {
            await AuthAPI.logout();
        } catch (err) {
            // Swallow API errors — we still want to clear local state
            console.error("Logout API call failed:", err);
        } finally {
            dispatch(clearAuth());
            clearCart();
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

    const changePassword = async (currentPassword, newPassword) => {
        try {
            return await AuthAPI.changePassword(currentPassword, newPassword);
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

        // State
        isAuthenticated,
        isLoading,
        error,

        // Actions
        login,
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