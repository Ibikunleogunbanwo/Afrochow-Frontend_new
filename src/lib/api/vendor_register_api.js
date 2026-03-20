const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ─── Token refresh state ─────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error) => {
  refreshQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  refreshQueue = [];
};

// ─── Core fetch helper ───────────────────────────────────────────────────────

/**
 * Central fetch helper with credentials and automatic token refresh on 401.
 * On a 401 it hits /auth/refresh once, then retries the original request.
 * Concurrent 401s queue behind a single in-flight refresh.
 */
const apiCall = async (endpoint, options = {}, _retry = false) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 401 && !_retry) {
    if (isRefreshing) {
      await new Promise((resolve, reject) => refreshQueue.push({ resolve, reject }));
      return apiCall(endpoint, options, true);
    }

    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!refreshRes.ok) throw new Error('Session expired — please log in again');
      processQueue(null);
      return apiCall(endpoint, options, true);
    } catch (err) {
      processQueue(err);
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `API error: ${res.status}`);
  return data;
};

// ─── Image upload ────────────────────────────────────────────────────────────

export class ImageUploadAPI {
  /**
   * Upload a registration image.
   * @param {File} file - The file to upload
   * @param {string} category - e.g. 'CustomerProfileImage', 'VendorLogo', 'ProductImage'
   * @param {AbortSignal} [signal] - Optional cancellation signal
   * @returns {Promise<Object>} Response JSON with imageUrl
   */
  static async uploadRegistrationImage(file, category = 'CustomerProfileImage', signal) {
    if (!file) throw new Error('File is required');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await fetch(`${API_BASE_URL}/images/upload/registration`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Image upload failed');
    }

    return data;
  }
}

/**
 * Upload all vendor images in parallel.
 * logo and banner are required; profileImage and businessLicense are optional.
 */
export const uploadVendorImages = async (files) => {
  if (!files.logo) throw new Error('Logo is required');
  if (!files.banner) throw new Error('Banner is required');

  const [logoResponse, bannerResponse, profileResponse, licenseResponse] = await Promise.all([
    ImageUploadAPI.uploadRegistrationImage(files.logo, 'VendorLogo'),
    ImageUploadAPI.uploadRegistrationImage(files.banner, 'VendorBanner'),
    files.profileImage
        ? ImageUploadAPI.uploadRegistrationImage(files.profileImage, 'VendorProfileImage')
        : Promise.resolve(null),
    files.businessLicense
        ? ImageUploadAPI.uploadRegistrationImage(files.businessLicense, 'VendorBusinessLicense')
        : Promise.resolve(null),
  ]);

  return {
    logoUrl: logoResponse.imageUrl,
    bannerUrl: bannerResponse.imageUrl,
    profileImageUrl: profileResponse?.imageUrl ?? null,
    businessLicenseUrl: licenseResponse?.imageUrl ?? null,
  };
};

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Capitalize the first letter of each day key.
 * Frontend uses lowercase (monday), API expects capitalized (Monday).
 */
const normalizeOperatingHours = (hours = {}) =>
    Object.keys(hours).reduce((acc, day) => {
      acc[day.charAt(0).toUpperCase() + day.slice(1)] = hours[day];
      return acc;
    }, {});

// ─── Auth endpoints ──────────────────────────────────────────────────────────

/**
 * Register a new vendor.
 *
 * The three boolean flags (atLeastOneDayOpen, atLeastOneServiceEnabled,
 * deliverySettingsValid) are computed here and sent as part of the payload
 * because the backend DTO uses @AssertTrue fields that rely on these values.
 * Business rule enforcement happens server-side.
 */
export const registerVendor = async (vendorData) => {
  const payload = {
    email: vendorData.email,
    password: vendorData.password,
    confirmPassword: vendorData.confirmPassword,
    acceptTerms: vendorData.acceptTerms,
    firstName: vendorData.firstName,
    lastName: vendorData.lastName,
    phone: vendorData.phone,

    profileImageUrl: vendorData.profileImageUrl,
    restaurantName: vendorData.restaurantName,
    description: vendorData.description,
    cuisineType: vendorData.cuisineType,
    taxId: vendorData.taxId || null,        // treat empty string as absent
    businessLicenseUrl: vendorData.businessLicenseUrl,

    logoUrl: vendorData.logoUrl,
    bannerUrl: vendorData.bannerUrl,

    operatingHours: normalizeOperatingHours(vendorData.operatingHours),
    address: vendorData.address,

    offersDelivery: vendorData.offersDelivery,
    offersPickup: vendorData.offersPickup,
    preparationTime: vendorData.preparationTime,

    deliveryFee: vendorData.deliveryFee ?? null,
    minimumOrderAmount: vendorData.minimumOrderAmount ?? null,
    estimatedDeliveryMinutes: vendorData.estimatedDeliveryMinutes ?? null,
    maxDeliveryDistanceKm: vendorData.maxDeliveryDistanceKm ?? null,

    // Computed flags — evaluated here, validated as @AssertTrue fields server-side
    atLeastOneDayOpen: Object.values(vendorData.operatingHours || {}).some((d) => d.isOpen),
    atLeastOneServiceEnabled: vendorData.offersDelivery || vendorData.offersPickup,
    deliverySettingsValid:
        !vendorData.offersDelivery ||
        (vendorData.deliveryFee != null &&
            vendorData.minimumOrderAmount != null &&
            vendorData.estimatedDeliveryMinutes != null &&
            vendorData.maxDeliveryDistanceKm != null),
  };

  return apiCall('/auth/register/vendor', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Check vendor registration/approval status.
 */
export const getVendorStatus = async (vendorId) => {
  return apiCall(`/auth/vendors/${vendorId}/status`);
};

/**
 * Resend email verification link.
 */
export const resendVerificationEmail = async (email) => {
  return apiCall('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

/**
 * Update vendor operating hours.
 */
export const updateOperatingHours = async (vendorId, operatingHours) => {
  return apiCall(`/auth/vendors/${vendorId}/operating-hours`, {
    method: 'PUT',
    body: JSON.stringify(normalizeOperatingHours(operatingHours)),
  });
};