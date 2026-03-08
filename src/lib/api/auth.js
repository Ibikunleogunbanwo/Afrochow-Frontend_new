const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Extract meaningful error message from wrapped API response
 */
const extractErrorMessage = (errorData, defaultMessage) => {
  return (
      errorData?.message ||
      errorData?.error ||
      errorData?.details ||
      errorData?.data?.message ||
      (typeof errorData === 'string' ? errorData : null) ||
      defaultMessage
  );
};

/**
 * Wrapper for fetch with credentials and unwrapping
 */
const fetchWithCredentials = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    const errorMessage = extractErrorMessage(json, 'Request failed');
    console.error('API Error:', {
      url,
      status: response.status,
      statusText: response.statusText,
      errorMessage,
      response: json
    });
    throw new Error(errorMessage);
  }

  return json;
};



export const AuthAPI = {
  // ================= PUBLIC ENDPOINTS =================

  registerCustomer: async (data) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/register/customer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAdminData: async (data) => {
    return fetchWithCredentials(`${API_BASE_URL}/admin/profile`, {
      method: 'GET',
    })
  },


  registerVendor: async (data) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/register/vendor`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  registerAdmin: async (data) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/register/admin`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyEmail: async (code) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  resendVerificationEmail: async (email) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },


  getCustomerProfile: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/profile`, {
      method: 'GET',
    });
  },

  updateCustomerProfile: async (data) => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ================= ADDRESS MANAGEMENT =================

  savedAddress: async (data) => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/addresses`, {
      method: 'GET',
    })
  },


  addAddress: async (addressData) => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/addresses`, {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  updateAddress: async (publicAddressId, addressData) => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/addresses/${publicAddressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  deleteAddress: async (addressId) => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },


  setDefaultAddress: async (publicAddressId) => {
    return fetchWithCredentials(`${API_BASE_URL}/customer/addresses/${publicAddressId}/set-default`, {
      method: 'POST',
    });
  },

  forgotPassword: async (email) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ identifier: email }),
    });
  },

  resetPassword: async (token, newPassword) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  // ================= AUTHENTICATED ENDPOINTS =================

  changePassword: async (currentPassword, newPassword) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  login: async (identifier, password) => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  logout: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
  },

  logoutAllDevices: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/logout-all`, {
      method: 'POST',
    });
  },

  refreshToken: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
    });
  },



  getAllVendorProducts: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/products`, {
      method: 'GET',
    })
  },

  getVendorProductsByCategory: async (categoryId) => {
    return fetchWithCredentials(`${API_BASE_URL}/products/category/${categoryId}`, {
      method: 'GET',
    })
  },

  getVendorProduct: async (publicProductId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/products/${publicProductId}`, {
      method: 'GET',
    })
  },

  toggleProductAvailability: async (publicProductId, available) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/products/${publicProductId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    })
  },

  deleteVendorProduct: async (publicProductId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/products/${publicProductId}`, {
      method: 'DELETE',
    })
  },

  editVendorProduct: async (publicProductId, productData) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/products/${publicProductId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  },


  createProducts: async (productData) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  },

  uploadProductImage: async (publicProductId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/vendor/products/${publicProductId}/image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const json = await response.json();

    if (!response.ok || json.success === false) {
      const errorMessage = extractErrorMessage(json, 'Image upload failed');
      throw new Error(errorMessage);
    }

    return json;
  },


  // ================= SEARCH ENDPOINTS =================

  getPopularProductNames: async (limit = 10) => {
    return fetchWithCredentials(`${API_BASE_URL}/search/products/popular/names?limit=${limit}`, {
      method: 'GET',
    })
  },

  getPopularProducts: async (limit = 10) => {
    return fetchWithCredentials(`${API_BASE_URL}/search/products/popular?limit=${limit}`, {
      method: 'GET',
    })
  },

  getChefSpecials: async (limit = 10) => {
    return fetchWithCredentials(`${API_BASE_URL}/search/products/chef-specials?limit=${limit}`, {
      method: 'GET',
    })
  },

  getFeaturedProducts: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/search/products/featured`, {
      method: 'GET',
    })
  },

  getProductsNearMe: async (city) => {
    return fetchWithCredentials(`${API_BASE_URL}/search/products/near-me?city=${encodeURIComponent(city)}`, {
      method: 'GET',
    })
  },

  getMonthlyPopularProducts: async (city) => {
    return fetchWithCredentials(`${API_BASE_URL}/search/products/monthly-popular?city=${encodeURIComponent(city)}`, {
      method: 'GET',
    })
  },

  getTopRatedVendors: async (limit = 12) => {
    return fetchWithCredentials(`${API_BASE_URL}/search/vendors/top-rated?limit=${limit}`, {
      method: 'GET',
    })
  },

  // Vendor Details
  getVendorDetails: async (publicVendorId) => {
    return fetchWithCredentials(`${API_BASE_URL}/search/vendors/${publicVendorId}`, {
      method: 'GET',
    })
  },

  // Vendor Products
  getVendorProducts: async (publicVendorId, page = 0, size = 20) => {
    return fetchWithCredentials(`${API_BASE_URL}/products/vendor/${publicVendorId}?page=${page}&size=${size}`, {
      method: 'GET',
    })
  },

  // Vendor Reviews
  getVendorReviews: async (vendorPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendors/${vendorPublicId}/reviews`, {
      method: 'GET',
    })
  },

  getVendorRating: async (vendorPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendors/${vendorPublicId}/rating`, {
      method: 'GET',
    })
  },

  filterVendorReviews: async (vendorPublicId, minRating) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendors/${vendorPublicId}/reviews/filter?minRating=${minRating}`, {
      method: 'GET',
    })
  },

  // Product Reviews
  getProductReviews: async (productPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/products/${productPublicId}/reviews`, {
      method: 'GET',
    })
  },

  getProductRating: async (productPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/products/${productPublicId}/rating`, {
      method: 'GET',
    })
  },

  getStats: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/stats`, {
      method: 'GET',
    })
  },

  searchProductsAdvanced: async (filters = {}) => {
    const params = new URLSearchParams();

    // Add all available filters as request params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `${API_BASE_URL}/search/products/advanced${queryString ? `?${queryString}` : ''}`;

    return fetchWithCredentials(url, {
      method: 'GET',
    });
  },

  searchProducts: async (filters = {}) => {
    const params = new URLSearchParams();

    // Add all available filters as request params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `${API_BASE_URL}/products/search${queryString ? `?${queryString}` : ''}`;

    return fetchWithCredentials(url, {
      method: 'GET',
    });
  },

  getCategoryByName: async (name) => {
    return fetchWithCredentials(`${API_BASE_URL}/categories/name/${encodeURIComponent(name)}`, {
      method: 'GET',
    });
  },

  getAllCategories: async (name) => {
    return fetchWithCredentials(`${API_BASE_URL}/categories`, {
      method: 'GET',
    });
  },


  // ================= PRODUCT REVIEWS ENDPOINTS =================

  getProductReviews: async (productPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/products/${productPublicId}/reviews`, {
      method: 'GET',
    })
  },

  getProductAverageRating: async (productPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/products/${productPublicId}/rating`, {
      method: 'GET',
    })
  },

  // ================= VENDOR REVIEWS ENDPOINTS =================

  // Public endpoint - get reviews for any vendor
  getVendorReviews: async (vendorPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendors/${vendorPublicId}/reviews`, {
      method: 'GET',
    })
  },

  // Public endpoint - get average rating for any vendor
  getVendorAverageRating: async (vendorPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendors/${vendorPublicId}/rating`, {
      method: 'GET',
    })
  },

  // Authenticated endpoint - get my vendor reviews (includes hidden reviews)
  getMyVendorReviews: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/reviews`, {
      method: 'GET',
    })
  },

  // Authenticated endpoint - get my vendor review statistics
  getMyVendorReviewStats: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/reviews/stats`, {
      method: 'GET',
    })
  },

  getAllProductReviews: async (vendorPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendors/${vendorPublicId}/products/reviews`, {
      method: 'GET',
    })
  },

  getAllProductsAverageRating: async (vendorPublicId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendors/${vendorPublicId}/products/rating`, {
      method: 'GET',
    })
  },

  // ================= VENDOR ORDERS ENDPOINTS =================

  getVendorOrders: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders`, {
      method: 'GET',
    })
  },

  getVendorOrderById: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}`, {
      method: 'GET',
    })
  },

  getTodayOrders: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/today`, {
      method: 'GET',
    })
  },

  getOrdersByStatus: async (status) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/status/${status}`, {
      method: 'GET',
    })
  },

  getActiveOrders: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/active`, {
      method: 'GET',
    })
  },

  getOrdersRevenue: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/stats/revenue`, {
      method: 'GET',
    })
  },

  getOrderCountStats: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/stats/count`, {
      method: 'GET',
    })
  },

  acceptOrder: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/accept`, {
      method: 'PUT',
    })
  },

  rejectOrder: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/reject`, {
      method: 'PUT',
    })
  },

  startPreparingOrder: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/preparing`, {
      method: 'PUT',
    })
  },

  markOrderReady: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/ready`, {
      method: 'PUT',
    })
  },

  markOrderOutForDelivery: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/out-for-delivery`, {
      method: 'PUT',
    })
  },

  markOrderDelivered: async (publicOrderId) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/orders/${publicOrderId}/delivered`, {
      method: 'PUT',
    })
  },

  // ================= VENDOR ANALYTICS ENDPOINTS =================

  getVendorAnalytics: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/analytics/vendor`, {
      method: 'GET',
    })
  },

  getVendorSalesReport: async (startDate, endDate) => {
    return fetchWithCredentials(`${API_BASE_URL}/analytics/vendor/sales-report?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
    })
  },

  getVendorPopularProducts: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/analytics/vendor/popular-products`, {
      method: 'GET',
    })
  },

  // ================= VENDOR PROFILE ENDPOINTS =================

  getVendorProfile: async () => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/profile`, {
      method: 'GET',
    })
  },

  updateVendorProfile: async (profileData) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },

  updateVendorAddress: async (addressData) => {
    return fetchWithCredentials(`${API_BASE_URL}/vendor/profile/address`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    })
  },

  uploadVendorImage: async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/vendor/profile/image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const json = await response.json();

    if (!response.ok || json.success === false) {
      const errorMessage = extractErrorMessage(json, 'Image upload failed');
      throw new Error(errorMessage);
    }

    return json;
  },

  checkAuth: async () => {
    try {
      const result = await AuthAPI.getCurrentUser();
      return {
        isAuthenticated: result.success,
        user: result.data
      };
    } catch {
      return {
        isAuthenticated: false,
        user: null
      };
    }
  },
};