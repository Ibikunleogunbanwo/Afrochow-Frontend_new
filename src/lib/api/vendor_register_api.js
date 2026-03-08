const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Image Upload API for registration
 */
export class ImageUploadAPI {
  /**
   * Upload a registration image
   * @param {File} file - The file to upload
   * @param {string} category - Image category (e.g., 'CustomerProfileImage', 'VendorLogo', 'ProductImage')
   * @param {string} signal - Optional abort signal for cancellation
   * @returns {Promise<Object>} - Response JSON with imageUrl
   */
  static async uploadRegistrationImage(file, category = 'CustomerProfileImage', signal) {
    if (!file) {
      throw new Error('File is required');
    }

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
 * Central fetch helper with credentials included
 */
const apiCall = async (endpoint, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `API error: ${res.status}`);
  }

  return data;
};

/**
 * Upload vendor images using the ImageUploadAPI
 * logo + banner required, profileImage & businessLicense optional
 */
export const uploadVendorImages = async (files) => {
  if (!files.logo) throw new Error('Logo is required');
  if (!files.banner) throw new Error('Banner is required');

  try {
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
      profileImageUrl: profileResponse?.imageUrl || null,
      businessLicenseUrl: licenseResponse?.imageUrl || null,
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};


/**
 * Normalize operating hours - capitalize first letter of day names
 * Frontend uses lowercase (monday), API expects capitalized (Monday)
 */
const normalizeOperatingHours = (hours = {}) =>
    Object.keys(hours).reduce((acc, day) => {
      // Capitalize first letter: monday → Monday
      const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
      acc[capitalizedDay] = hours[day];
      return acc;
    }, {});

/**
 * Register a new vendor
 */
export const registerVendor = async (vendorData) => {
  const uploadedFiles = await uploadVendorImages({
    logo: vendorData.logoFile,
    banner: vendorData.bannerFile,
    profileImage: vendorData.profileImageFile,
    businessLicense: vendorData.businessLicense,
  });

  const normalizedHours = normalizeOperatingHours(vendorData.operatingHours);
  const atLeastOneDayOpen = Object.values(vendorData.operatingHours || {}).some(day => day.isOpen);
  const atLeastOneServiceEnabled = vendorData.offersDelivery || vendorData.offersPickup;
  const deliverySettingsValid = !vendorData.offersDelivery || (
    vendorData.deliveryFee != null &&
    vendorData.minimumOrderAmount != null &&
    vendorData.estimatedDeliveryMinutes != null &&
    vendorData.maxDeliveryDistanceKm != null
  );

  const payload = {
    username: vendorData.username,
    email: vendorData.email,
    password: vendorData.password,
    confirmPassword: vendorData.confirmPassword,
    acceptTerms: vendorData.acceptTerms,
    firstName: vendorData.firstName,
    lastName: vendorData.lastName,
    phone: vendorData.phone,

    profileImageUrl: uploadedFiles.profileImageUrl,
    restaurantName: vendorData.restaurantName,
    description: vendorData.description,
    cuisineType: vendorData.cuisineType,
    taxId: vendorData.taxId ?? null,
    businessLicenseUrl: uploadedFiles.businessLicenseUrl,

    logoUrl: uploadedFiles.logoUrl,
    bannerUrl: uploadedFiles.bannerUrl,

    operatingHours: normalizedHours,
    address: vendorData.address,

    offersDelivery: vendorData.offersDelivery,
    offersPickup: vendorData.offersPickup,
    preparationTime: vendorData.preparationTime,

    deliveryFee: vendorData.deliveryFee ?? null,
    minimumOrderAmount: vendorData.minimumOrderAmount ?? null,
    estimatedDeliveryMinutes: vendorData.estimatedDeliveryMinutes ?? null,
    maxDeliveryDistanceKm: vendorData.maxDeliveryDistanceKm ?? null,

    atLeastOneDayOpen,
    atLeastOneServiceEnabled,
    deliverySettingsValid,
  };

  return apiCall('/auth/register/vendor', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Check vendor registration status
 */
export const getVendorStatus = async (vendorId) => {
  return apiCall(`/register/vendor/${vendorId}/status`);
};

/**
 * Update vendor operating hours
 */
export const updateOperatingHours = async (vendorId, operatingHours) => {
  return apiCall(`/register/vendor/${vendorId}/operating-hours`, {
    method: 'PUT',
    body: JSON.stringify(normalizeOperatingHours(operatingHours)),
  });
};
