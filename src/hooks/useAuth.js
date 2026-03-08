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
    setAuth,
    clearAuth,
    setError,
    setLoading,
} from "@/redux-store/authSlice";
import { AuthAPI } from "@/lib/api/auth";

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

    const login = async (identifier, password) => {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const result = await AuthAPI.login(identifier, password);

            if (!result?.data) {
                dispatch(setError('Invalid response from server'));
                return;
            }

            const userData = result.data;

            if (!userData.role || !userData.publicUserId) {
                dispatch(setError('Invalid user data received'));
                return;
            }

            dispatch(setAuth({ user: userData }));

            if (userData.role === 'VENDOR') {
                router.push('/vendor/dashboard');
            } else if (userData.role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else {
                router.push('/');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };




    const logout = async () => {
        try {
            await AuthAPI.logout();
        } catch (err) {
            console.error('Logout API failed:', err);
        } finally {
            dispatch(clearAuth());
            router.push('/login');
        }
    };



    const registerCustomer = async (data) => {
        try {
            return await AuthAPI.registerCustomer(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed';
            dispatch(setError(errorMessage));
            throw err;
        }
    };



    const registerVendor = async (data) => {
        try {
            return await AuthAPI.registerVendor(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed';
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const getCustomerProfile = async () => {
        try {
            return await AuthAPI.getCustomerProfile();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const updateCustomerProfile = async (data) => {
        try {
            return await AuthAPI.updateCustomerProfile(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const addAddress = async (addressData) => {
        try {
            return await AuthAPI.addAddress(addressData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add address';
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const updateAddress = async (publicAddressId, addressData) => {
        try {
            return await AuthAPI.updateAddress(publicAddressId, addressData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update address';
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const deleteAddress = async (publicAddressId) => {
        try {
            return await AuthAPI.deleteAddress(publicAddressId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete address';
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const setDefaultAddress = async (publicAddressId) => {
        try {
            return await AuthAPI.setDefaultAddress(publicAddressId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to set default address';
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            return await AuthAPI.changePassword(currentPassword, newPassword);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const getSavedAddresses = async () => {
        try {
            return await AuthAPI.savedAddress();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load addresses';
            dispatch(setError(errorMessage));
            throw err;
        }
    };

    const requireAuth = (requiredRole) => {
        if (!isAuthenticated) {
            router.push('/login');
            return false;
        }

        if (requiredRole && role !== requiredRole) {
            router.push('/unauthorized');
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

        // Profile management
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