"use client";

import { Provider } from "react-redux";
import { store } from "@/redux-store/store";
import AuthInitializer from "@/lib/api/AuthInitializer";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";

export default function ClientProviders({ children }) {
    return (
        <Provider store={store}>
            <ThemeProvider>
                <AuthInitializer>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </AuthInitializer>
            </ThemeProvider>
        </Provider>
    );
}