import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    role: null,
    // Vendor-only: null for non-vendor users, populated from LoginResponse
    vendorIsActive: null,
    vendorIsVerified: null,
    vendorStatus: null,     // primary source-of-truth; mirrors backend VendorStatus enum
    // Set to false for new Google sign-in users who haven't completed onboarding
    isProfileComplete: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth(state, action) {
            const userData = action.payload.data || action.payload.user || action.payload;

            state.user = userData;
            state.role = userData?.role || null;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;

            // Persist vendor status flags from the login response.
            // Fall back to existing state (not null) when the incoming payload doesn't
            // include these fields — e.g. TokenRefreshResponseDto and UserCustomerSummaryDto
            // don't carry vendor flags, so we must not overwrite a good value with null.
            state.vendorIsActive   = userData?.vendorIsActive   ?? state.vendorIsActive;
            state.vendorIsVerified = userData?.vendorIsVerified ?? state.vendorIsVerified;
            state.vendorStatus     = userData?.vendorStatus     ?? state.vendorStatus;

            // Default to true so existing login flows are unaffected.
            // Explicitly set to false only when the backend says so (new Google users).
            state.isProfileComplete = userData?.isProfileComplete ?? true;
        },

        clearAuth(state) {
            state.user = null;
            state.role = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
            state.vendorIsActive = null;
            state.vendorIsVerified = null;
            state.vendorStatus = null;
            state.isProfileComplete = true;
        },

        setLoading(state, action) {
            state.isLoading = action.payload;
        },

        setError(state, action) {
            state.error = action.payload;
            state.isLoading = false;
        },

        updateUser(state, action) {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },

        /** Called after successful onboarding completion. */
        markProfileComplete(state) {
            state.isProfileComplete = true;
            if (state.user) state.user.isProfileComplete = true;
        },

        /**
         * Refresh vendor status flags from the live API profile response.
         * Called after fetchProfile() so the sidebar badge and banners always
         * reflect the current DB state, not the stale login-time snapshot.
         */
        updateVendorStatus(state, action) {
            if (action.payload.isActive !== undefined) {
                state.vendorIsActive = action.payload.isActive;
            }
            if (action.payload.isVerified !== undefined) {
                state.vendorIsVerified = action.payload.isVerified;
            }
            if (action.payload.vendorStatus !== undefined) {
                state.vendorStatus = action.payload.vendorStatus;
            }
        },
    },
});

export const { setAuth, clearAuth, setLoading, setError, updateUser, updateVendorStatus, markProfileComplete } = authSlice.actions;


export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.role;
export const selectPublicUserId = (state) => state.auth.user?.publicUserId;
export const selectUsername = (state) => state.auth.user?.username;
export const selectEmail = (state) => state.auth.user?.email;
export const selectVendorIsActive = (state) => state.auth.vendorIsActive;
export const selectVendorIsVerified = (state) => state.auth.vendorIsVerified;
export const selectVendorStatus = (state) => state.auth.vendorStatus;
export const selectIsProfileComplete = (state) => state.auth.isProfileComplete;

export default authSlice.reducer;