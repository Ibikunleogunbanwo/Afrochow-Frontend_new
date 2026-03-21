import { API_BASE_URL, fetchWithCredentials } from './httpClient';

export const SearchAPI = {
  // ================= PRODUCTS =================

  /**
   * All product browsing goes through /search/products/advanced.
   * Every param is optional on the backend — query, city, categoryId,
   * minPrice, maxPrice, isVegetarian, isVegan, isGlutenFree, page, size.
   */
  searchProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    const url = `${API_BASE_URL}/search/products/advanced${queryString ? `?${queryString}` : ''}`;
    return fetchWithCredentials(url, { method: 'GET' });
  },

  searchProductsAdvanced: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    const url = `${API_BASE_URL}/search/products/advanced${queryString ? `?${queryString}` : ''}`;
    return fetchWithCredentials(url, { method: 'GET' });
  },

  getProductById: async (publicProductId) => {
    return fetchWithCredentials(`${API_BASE_URL}/products/${publicProductId}`, {
      method: 'GET',
    });
  },

  getPopularProductNames: async (limit = 5) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/products/popular/names?limit=${limit}`,
        { method: 'GET' }
    );
  },

  getPopularProducts: async () => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/products/popular`,
        { method: 'GET' }
    );
  },

  getChefSpecials: async () => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/products/chef-specials`,
        { method: 'GET' }
    );
  },

  getFeaturedProducts: async () => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/products/featured`,
        { method: 'GET' }
    );
  },

  getProductsNearMe: async (city) => {
    const url = city
        ? `${API_BASE_URL}/search/products/near-me?city=${encodeURIComponent(city)}`
        : `${API_BASE_URL}/search/products/near-me`;
    return fetchWithCredentials(url, { method: 'GET' });
  },

  getMonthlyPopularProducts: async (city) => {
    const url = city
        ? `${API_BASE_URL}/search/products/monthly-popular?city=${encodeURIComponent(city)}`
        : `${API_BASE_URL}/search/products/monthly-popular`;
    return fetchWithCredentials(url, { method: 'GET' });
  },

  getVendorProductsByCategory: async (categoryId) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/products/category/${categoryId}`,
        { method: 'GET' }
    );
  },

  getVendorProducts: async (publicVendorId, page = 0, size = 20) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/products/vendor/${publicVendorId}?page=${page}&size=${size}`,
        { method: 'GET' }
    );
  },

  // ================= VENDORS =================

  getTopRatedVendors: async () => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/vendors/top-rated`,
        { method: 'GET' }
    );
  },

  getVendorsByCity: async (city) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/vendors/advanced?city=${encodeURIComponent(city)}&isVerified=true`,
        { method: 'GET' }
    );
  },

  getVendorsByCuisine: async (cuisineType) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/vendors/advanced?cuisineType=${encodeURIComponent(cuisineType)}&isVerified=true`,
        { method: 'GET' }
    );
  },

  getVendorDetails: async (publicVendorId) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/vendors/${publicVendorId}`,
        { method: 'GET' }
    );
  },

  // isVerified=true AND isActive handled by the backend /vendors/verified endpoint
  getVerifiedVendors: async () => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/vendors/verified`,
        { method: 'GET' }
    );
  },

  searchVendorsAdvanced: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    const url = `${API_BASE_URL}/search/vendors/advanced${queryString ? `?${queryString}` : ''}`;
    return fetchWithCredentials(url, { method: 'GET' });
  },

  getVendorsByProductName: async (query) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/vendors/by-product?query=${encodeURIComponent(query)}`,
        { method: 'GET' }
    );
  },

  // ================= CATEGORIES =================

  getCategoryByName: async (name) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/categories/name/${encodeURIComponent(name)}`,
        { method: 'GET' }
    );
  },

  getAllCategories: async () => {
    return fetchWithCredentials(
        `${API_BASE_URL}/categories`,
        { method: 'GET' }
    );
  },

  // ================= STATS =================

  getStats: async () => {
    return fetchWithCredentials(
        `${API_BASE_URL}/stats`,
        { method: 'GET' }
    );
  },
};