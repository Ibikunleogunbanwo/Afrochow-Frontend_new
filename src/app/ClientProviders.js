"use client";

import { Provider } from "react-redux";
import { store } from "@/redux-store/store";
import AuthInitializer from "@/lib/api/AuthInitializer";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function ClientProviders({ children }) {
    return (
        <Provider store={store}>
            <ThemeProvider>
                <AuthInitializer>
                    {children}
                </AuthInitializer>
            </ThemeProvider>
        </Provider>
    );
}