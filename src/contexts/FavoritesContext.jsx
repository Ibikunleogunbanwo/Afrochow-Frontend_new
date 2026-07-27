"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FavoritesAPI } from "@/lib/api/favorites.api";
import { toast } from "@/components/ui/toast";
import { customerWaitlistMessage, customerWaitlistPath, isCustomerWaitlistMode } from "@/lib/mvp";

const FavoritesContext = createContext(null);

/**
 * Single source of truth for "is this vendor/product favorited" across the
 * whole app. Previously every card rendered its own useFavorite() instance,
 * each firing its own GET .../is-favorited request on mount — on a page with
 * a dozen product cards that's a dozen redundant network calls, and toggling
 * a heart on one card (e.g. storeCard) never updated a duplicate card for the
 * same vendor elsewhere on the page (e.g. PopularStoreCard). Fetching the
 * full favorites list once here and deriving membership from two Sets fixes
 * both problems: one request per session, and every consumer re-renders from
 * the same shared state.
 */
export const FavoritesProvider = ({ children }) => {
    const { isAuthenticated, role } = useAuth();
    const isCustomer = isAuthenticated && role?.toUpperCase() === "CUSTOMER" && !isCustomerWaitlistMode;

    const [vendorIds, setVendorIds] = useState(() => new Set());
    const [productIds, setProductIds] = useState(() => new Set());
    const [loaded, setLoaded] = useState(false);
    const [syncingKeys, setSyncingKeys] = useState(() => new Set());

    // Hydrate once per authenticated-customer session. When the caller isn't
    // an authenticated customer, skip the fetch entirely — `isVendorFavorited`
    // / `isProductFavorited` below derive the guest/vendor/admin case as
    // always-false regardless of whatever the Sets last held, so this effect
    // never needs to reset state synchronously on the way out (that pattern
    // trips the react-hooks/set-state-in-effect rule; see useFavorite.js for
    // the same reasoning applied to the old per-card hook).
    useEffect(() => {
        if (!isCustomer) return;

        let cancelled = false;
        FavoritesAPI.getAllFavorites()
            .then((res) => {
                if (cancelled) return;
                const favorites = res?.data ?? [];
                const vIds = new Set();
                const pIds = new Set();
                favorites.forEach((f) => {
                    if (f.favoriteType === "VENDOR" && f.vendor?.publicVendorId) {
                        vIds.add(f.vendor.publicVendorId);
                    } else if (f.favoriteType === "PRODUCT" && f.product?.publicProductId) {
                        pIds.add(f.product.publicProductId);
                    }
                });
                setVendorIds(vIds);
                setProductIds(pIds);
            })
            .catch(() => {
                // Non-fatal — cards just render as unfavorited until the next
                // successful hydration (e.g. next page load).
            })
            .finally(() => {
                if (!cancelled) setLoaded(true);
            });

        return () => { cancelled = true; };
    }, [isCustomer]);

    // Guests/vendors/admins never have a favorited state, regardless of
    // whatever the Sets last held (e.g. from a previous logged-in session).
    const isVendorFavorited = useCallback(
        (id) => isCustomer && !!id && vendorIds.has(id),
        [isCustomer, vendorIds]
    );
    const isProductFavorited = useCallback(
        (id) => isCustomer && !!id && productIds.has(id),
        [isCustomer, productIds]
    );
    const isSyncing = useCallback(
        (favoriteType, id) => syncingKeys.has(`${favoriteType}:${id}`),
        [syncingKeys]
    );
    const effectiveLoaded = isCustomer && loaded;

    /**
     * Toggles favorite status for a vendor or product, shared by every card
     * on the page. Optimistically updates the shared Set (so every card for
     * the same entity flips in lockstep), rolls back on a real failure, and
     * treats 404/409 as benign no-ops (the entity already ended up in the
     * state the user wanted).
     */
    const toggleFavorite = useCallback((favoriteType, targetPublicId, { name, onRequireAuth } = {}) => {
        if (isCustomerWaitlistMode) {
            toast.success("Join the customer waitlist", {
                description: customerWaitlistMessage,
            });
            if (typeof window !== "undefined") {
                window.location.href = customerWaitlistPath;
            }
            return;
        }

        if (!isCustomer) {
            // Stash the intent so a guest who taps a heart, then signs in
            // from the resulting auth modal, lands back with the favorite
            // already applied instead of having to find and tap it again.
            // useAuth's login()/loginWithGoogle() picks this up on success.
            if (targetPublicId) {
                try {
                    sessionStorage.setItem(
                        "pendingFavorite",
                        JSON.stringify({ favoriteType, targetPublicId, name })
                    );
                } catch {
                    // sessionStorage unavailable (e.g. private browsing) — the
                    // heart just won't auto-complete after sign-in; non-fatal.
                }
            }
            onRequireAuth?.();
            return;
        }
        if (!targetPublicId) return;

        const key = `${favoriteType}:${targetPublicId}`;
        if (syncingKeys.has(key)) return;

        const setIds = favoriteType === "VENDOR" ? setVendorIds : setProductIds;
        const currentlyFavorited = favoriteType === "VENDOR"
            ? vendorIds.has(targetPublicId)
            : productIds.has(targetPublicId);
        const next = !currentlyFavorited;

        setSyncingKeys(prev => new Set(prev).add(key));
        setIds(prev => {
            const copy = new Set(prev);
            if (next) copy.add(targetPublicId); else copy.delete(targetPublicId);
            return copy;
        });

        const label = name || (favoriteType === "VENDOR" ? "Restaurant" : "Dish");
        const toastId = `favorite-${key}`;
        const request = next
            ? FavoritesAPI.addFavorite(favoriteType, targetPublicId)
            : FavoritesAPI.removeFavorite(favoriteType, targetPublicId);

        request
            .then(() => {
                toast.success(next ? "Added to favorites" : "Removed from favorites", {
                    id: toastId,
                    description: next ? `${label} saved to your favorites.` : `${label} removed from your favorites.`,
                });
            })
            .catch((err) => {
                const benignConflict = err?.status === 409 || err?.status === 404;
                if (!benignConflict) {
                    setIds(prev => {
                        const copy = new Set(prev);
                        if (next) copy.delete(targetPublicId); else copy.add(targetPublicId);
                        return copy;
                    });
                    toast.error("Could not update favorites", {
                        id: toastId,
                        description: err?.message || "Please try again.",
                    });
                }
            })
            .finally(() => {
                setSyncingKeys(prev => {
                    const copy = new Set(prev);
                    copy.delete(key);
                    return copy;
                });
            });
    }, [isCustomer, syncingKeys, vendorIds, productIds]);

    /**
     * For callers that manage their own add/remove API call directly (e.g. the
     * My Favorites page, which needs the full favorite object — not just the
     * ID — to render its list, so it can't just call toggleFavorite). Lets
     * them keep the shared Sets in sync after a successful call of their own,
     * so a removal there is reflected instantly on any other card on screen.
     */
    const removeFromLocalState = useCallback((favoriteType, targetPublicId) => {
        const setIds = favoriteType === "VENDOR" ? setVendorIds : setProductIds;
        setIds(prev => {
            if (!prev.has(targetPublicId)) return prev;
            const copy = new Set(prev);
            copy.delete(targetPublicId);
            return copy;
        });
    }, []);

    return (
        <FavoritesContext.Provider value={{
            isCustomer,
            loaded: effectiveLoaded,
            isVendorFavorited,
            isProductFavorited,
            isSyncing,
            toggleFavorite,
            removeFromLocalState,
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavoritesContext = () => {
    const context = useContext(FavoritesContext);
    if (!context) throw new Error("useFavoritesContext must be used within FavoritesProvider");
    return context;
};
