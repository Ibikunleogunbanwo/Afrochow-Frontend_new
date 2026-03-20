// State version for migration management
export const STATE_VERSION = 2;

const initialState = {
  // Version for state migration
  _version: STATE_VERSION,

  // Step 1: Account credentials (username is auto-generated from email)
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,

  // Step 2: Profile + Restaurant information
  firstName: "",
  lastName: "",
  phone: "",
  profileImageFile: null,
  restaurantName: "",
  description: "",
  cuisineType: "",

  // Step 3: Branding & Location
  taxId: "",
  businessLicense: null,
  logoFile: null,
  bannerFile: null,
  address: {
    addressLine: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Canada",
    defaultAddress: true,
  },

  // Step 4: Business operations
  operatingHours: {
    monday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
    tuesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
    wednesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
    thursday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
    friday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
    saturday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
    sunday: { isOpen: false, openTime: "09:00", closeTime: "22:00" },
  },
  offersDelivery: false,
  offersPickup: false,
  preparationTime: 30,
  deliveryFee: 0,
  minimumOrderAmount: 0,
  estimatedDeliveryMinutes: 30,
  maxDeliveryDistanceKm: 10,
};

export default initialState;
