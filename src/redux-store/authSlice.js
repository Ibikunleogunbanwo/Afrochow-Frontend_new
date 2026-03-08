import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    role: null,
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
        },

        clearAuth(state) {
            state.user = null;
            state.role = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
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
    },
});

export const { setAuth, clearAuth, setLoading, setError, updateUser } = authSlice.actions;


export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.role;
export const selectPublicUserId = (state) => state.auth.user?.publicUserId;
export const selectUsername = (state) => state.auth.user?.username;
export const selectEmail = (state) => state.auth.user?.email;

export default authSlice.reducer;