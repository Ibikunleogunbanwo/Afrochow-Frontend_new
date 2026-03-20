import { API_BASE_URL, fetchWithCredentials } from './httpClient';

export const SearchAPI = {
  // ================= PRODUCTS =================

  searchProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    const url = `${API_BASE_URL}/products/search${queryString ? `?${queryString}` : ''}`;
    return fetchWithCredentials(url, { method: 'GET' });
  },

  getProductById: async (publicProductId) => {
    return fetchWithCredentials(`${API_BASE_URL}/products/${publicProductId}`, {
      method: 'GET',
    });
  },

  searchProductsAdvanced: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    const url = `${API_BASE_URL}/search/products/advanced${queryString ? `?${queryString}` : ''}`;
    return fetchWithCredentials(url, { method: 'GET' });
  },

  getPopularProductNames: async (limit = 10) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/products/popular/names?limit=${limit}`,
        { method: 'GET' }
    );
  },

  getPopularProducts: async (limit = 10) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/products/popular?limit=${limit}`,
        { method: 'GET' }
    );
  },

  getChefSpecials: async (limit = 10) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/products/chef-specials?limit=${limit}`,
        { method: 'GET' }
    );
  },

  getFeaturedProducts: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/search/products/featured`, {
      method: 'GET',
    });
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
    return fetchWithCredentials(`${API_BASE_URL}/products/category/${categoryId}`, {
      method: 'GET',
    });
  },

  getVendorProducts: async (publicVendorId, page = 0, size = 20) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/products/vendor/${publicVendorId}?page=${page}&size=${size}`,
        { method: 'GET' }
    );
  },

  // ================= VENDORS =================

  // Backend controller takes no params — limit is ignored server-side.
  getTopRatedVendors: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/search/vendors/top-rated`, {
      method: 'GET',
    });
  },

  // Uses advanced search endpoint with city filter.
  getVendorsByCity: async (city) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/vendors/advanced?city=${encodeURIComponent(city)}`,
        { method: 'GET' }
    );
  },

  getVendorsByCuisine: async (cuisineType) => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/vendors/advanced?cuisineType=${encodeURIComponent(cuisineType)}`,
        { method: 'GET' }
    );
  },

  getVendorDetails: async (publicVendorId) => {
    return fetchWithCredentials(`${API_BASE_URL}/search/vendors/${publicVendorId}`, {
      method: 'GET',
    });
  },

  getVerifiedVendors: async () => {
    return fetchWithCredentials(
        `${API_BASE_URL}/search/vendors/advanced?isVerified=true`,
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
    return fetchWithCredentials(`${API_BASE_URL}/categories`, {
      method: 'GET',
    });
  },

  // ================= STATS =================

  getStats: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/stats`, {
      method: 'GET',
    });
  },
};