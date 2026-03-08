// State version for migration management
export const STATE_VERSION = 1;

const initialState = {
  // Version for state migration
  _version: STATE_VERSION,

  // Step 1: Account credentials
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,

  // Step 2: Profile information
  firstName: "",
  lastName: "",
  phone: "",
  profileImageFile: null,

  // Step 3: Restaurant information
  restaurantName: "",
  description: "",
  cuisineType: "",

  // Step 4: Business information & media
  taxId: "",
  businessLicense: null,
  logoFile: null,
  bannerFile: null,

  // Step 5: Business operations
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

  // Step 6: Business address
  address: {
    addressLine: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Canada",
    defaultAddress: true,
  },
};

export default initialState;