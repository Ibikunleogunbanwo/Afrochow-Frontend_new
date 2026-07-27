import { API_BASE_URL, fetchWithCredentials } from './httpClient';

/**
 * FavoritesAPI — wraps all /favorites endpoints (FavoriteController)
 *
 * Backend routes:
 *   POST   /favorites                                   — add a favorite (CUSTOMER)
 *   DELETE /favorites                                    — remove a favorite (CUSTOMER)
 *   GET    /favorites                                    — all favorites for the customer (CUSTOMER)
 *   GET    /favorites/type/{favoriteType}                — favorites filtered by VENDOR|PRODUCT (CUSTOMER)
 *   GET    /favorites/vendor/{vendorPublicId}/is-favorited    — has the customer favorited this vendor? (CUSTOMER)
 *   GET    /favorites/product/{productPublicId}/is-favorited  — has the customer favorited this product? (CUSTOMER)
 *   GET    /favorites/vendor/{vendorPublicId}/count       — total favorite count for a vendor (public)
 *   GET    /favorites/product/{productPublicId}/count     — total favorite count for a product (public)
 *   GET    /favorites/my-count                            — total favorites for the customer (CUSTOMER)
 */

const buildFavoriteBody = (favoriteType, targetPublicId) =>
  favoriteType === 'VENDOR'
    ? { favoriteType, vendorPublicId: targetPublicId }
    : { favoriteType, productPublicId: targetPublicId };

export const FavoritesAPI = {
  // ================= MUTATIONS (CUSTOMER only) =================

  /**
   * @param {'VENDOR'|'PRODUCT'} favoriteType
   * @param {string} targetPublicId  vendorPublicId or productPublicId
   */
  addFavorite: (favoriteType, targetPublicId) =>
    fetchWithCredentials(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      body: JSON.stringify(buildFavoriteBody(favoriteType, targetPublicId)),
    }),

  removeFavorite: (favoriteType, targetPublicId) =>
    fetchWithCredentials(`${API_BASE_URL}/favorites`, {
      method: 'DELETE',
      body: JSON.stringify(buildFavoriteBody(favoriteType, targetPublicId)),
    }),

  // ================= READS (CUSTOMER only) =================

  // size=100 is the backend's hard cap (see FavoriteController) — requested
  // explicitly because the Favorites page does its own client-side
  // filtering/pagination and expects the full list, not the backend's
  // default page size of 20.
  getAllFavorites: () =>
    fetchWithCredentials(`${API_BASE_URL}/favorites?size=100`),

  getFavoritesByType: (favoriteType) =>
    fetchWithCredentials(`${API_BASE_URL}/favorites/type/${favoriteType}`),

  /**
   * silent: true — suppresses console noise. Called on mount for every
   * vendor card, and a 401 (guest/not-a-customer) is an expected outcome,
   * not a real error.
   */
  isVendorFavorited: (vendorPublicId) =>
    fetchWithCredentials(`${API_BASE_URL}/favorites/vendor/${vendorPublicId}/is-favorited`, {
      silent: true,
    }),

  isProductFavorited: (productPublicId) =>
    fetchWithCredentials(`${API_BASE_URL}/favorites/product/${productPublicId}/is-favorited`, {
      silent: true,
    }),

  getMyFavoriteCount: () =>
    fetchWithCredentials(`${API_BASE_URL}/favorites/my-count`),

  // ================= PUBLIC COUNTS =================

  getVendorFavoriteCount: (vendorPublicId) =>
    fetchWithCredentials(`${API_BASE_URL}/favorites/vendor/${vendorPublicId}/count`),

  getProductFavoriteCount: (productPublicId) =>
    fetchWithCredentials(`${API_BASE_URL}/favorites/product/${productPublicId}/count`),
};
