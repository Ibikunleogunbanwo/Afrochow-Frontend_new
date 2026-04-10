"use client";

import { Provider } from "react-redux";
import { store } from "@/redux-store/store";
import AuthInitializer from "@/lib/api/AuthInitializer";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function ClientProviders({ children }) {
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
            <Provider store={store}>
                <ThemeProvider>
                    <AuthInitializer>
                        <CartProvider>
                            {children}
                        </CartProvider>
                    </AuthInitializer>
                </ThemeProvider>
            </Provider>
        </GoogleOAuthProvider>
    );
}