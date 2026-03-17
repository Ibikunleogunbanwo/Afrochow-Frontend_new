'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {

    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('afrochow_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [vendorId, setVendorId] = useState(() => {
        try {
            const saved = localStorage.getItem('afrochow_cart_vendor');
            return saved ?? null;
        } catch {
            return null;
        }
    });

    // persist to localStorage on every change
    useEffect(() => {
        localStorage.setItem('afrochow_cart', JSON.stringify(cartItems));
        localStorage.setItem('afrochow_cart_vendor', vendorId ?? '');
    }, [cartItems, vendorId]);

    const addToCart = (product, quantity = 1) => {
        if (vendorId && vendorId !== product.vendorPublicId) {
            return {
                success: false,
                message: 'Your cart has items from another store. Clear your cart to add this item.',
            };
        }

        setVendorId(product.vendorPublicId);

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
        setCartItems(prev => {
            const updated = prev.filter(item => item.publicProductId !== publicProductId);
            if (updated.length === 0) setVendorId(null);
            return updated;
        });
    };

    const updateQuantity = (publicProductId, quantity) => {
        if (quantity < 1) {
            removeFromCart(publicProductId);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.publicProductId === publicProductId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        setVendorId(null);
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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