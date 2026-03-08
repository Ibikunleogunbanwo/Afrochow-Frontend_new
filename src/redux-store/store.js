import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux-store/authSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['auth/setAuth'],
                ignoredPaths: ['auth.user.timestamp'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});