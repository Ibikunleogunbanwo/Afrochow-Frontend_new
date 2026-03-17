'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'afrochow_cart';

const loadCartFromStorage = () => {
    try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(loadCartFromStorage);

    const vendorId = cartItems.length > 0 ? cartItems[0].vendorPublicId : null;

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1, isStoreOpen = true) => {
        if (!isStoreOpen) {
            return { success: false, message: 'This store is currently closed.' };
        }

        if (vendorId && vendorId !== product.vendorPublicId) {
            return {
                success: false,
                message: 'Your cart has items from another store. Clear your cart to add this item.',
            };
        }

        setCartItems(prev => {
            const existing = prev.find(item => item.publicProductId === product.publicProductId);
            if (existing) {
                return prev.map(item =>
                    item.publicProductId === product.publicProductId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity }];
        });

        return { success: true };
    };

    const removeFromCart = (publicProductId) => {
        setCartItems(prev => prev.filter(item => item.publicProductId !== publicProductId));
    };

    const updateQuantity = (publicProductId, quantity) => {
        if (quantity < 1) {
            removeFromCart(publicProductId);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.publicProductId === publicProductId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setCartItems([]);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            vendorId,
            cartCount,
            cartTotal,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};