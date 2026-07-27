"use client";

import { useCallback } from "react";
import { useFavoritesContext } from "@/contexts/FavoritesContext";

/**
 * Per-card favorite hook. Thin wrapper around the shared FavoritesContext —
 * all fetching, optimistic updates, rollback, and toast logic live there so
 * every card reads the same state instead of firing its own
 * GET .../is-favorited request on mount (previously an N+1 request pattern:
 * a page with a dozen cards fired a dozen redundant checks) and so toggling
 * a heart on one card instantly updates every other card for the same
 * vendor/product on screen (previously each card's state was independent
 * and could drift out of sync with the others).
 *
 * Signature is unchanged from the original per-card implementation so no
 * call sites (storeCard, ProductCard, FeaturedProductCard, PopularStoreCard,
 * ProductDetailModal, restaurant detail page) need to change.
 *
 * @param {'VENDOR'|'PRODUCT'} favoriteType
 * @param {string|undefined|null} targetPublicId  vendorPublicId or productPublicId
 * @param {{ onRequireAuth?: () => void, name?: string }} [options]
 *        `name` is the restaurant/dish name shown in the toast — falls back
 *        to a generic "Restaurant"/"Dish" label when not provided.
 */
export const useFavorite = (favoriteType, targetPublicId, { onRequireAuth, name } = {}) => {
    const { isCustomer, isVendorFavorited, isProductFavorited, isSyncing, toggleFavorite } = useFavoritesContext();

    const isFavorited = isCustomer && targetPublicId
        ? (favoriteType === "VENDOR" ? isVendorFavorited(targetPublicId) : isProductFavorited(targetPublicId))
        : false;

    const syncing = isSyncing(favoriteType, targetPublicId);

    const handleToggle = useCallback((e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        toggleFavorite(favoriteType, targetPublicId, { name, onRequireAuth });
    }, [favoriteType, targetPublicId, name, onRequireAuth, toggleFavorite]);

    return { isFavorited, isSyncing: syncing, toggleFavorite: handleToggle, isCustomer };
};
