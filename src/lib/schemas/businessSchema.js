import { z } from "zod";

export const businessSchema = z.object({
  // Tax ID — optional, required before first payout
  taxId: z
      .string()
      .optional()
      .nullable()
      .refine(
          (value) => !value || value.trim() === "" || value.length >= 5,
          { message: "Tax ID must be at least 5 characters" }
      )
      .refine(
          (value) => !value || value.trim() === "" || value.length <= 50,
          { message: "Tax ID must be less than 50 characters" }
      )
      .refine(
          (value) => !value || value.trim() === "" || /^[a-zA-Z0-9-]+$/.test(value),
          { message: "Tax ID can only contain letters, numbers, and hyphens" }
      ),

  // Logo — required, stored as URL after immediate upload
  logoUrl: z
      .string()
      .min(1, "Restaurant logo is required"),

  // Banner — required, stored as URL after immediate upload
  bannerUrl: z
      .string()
      .min(1, "Restaurant banner is required"),

  // Business License — optional, stored as URL after immediate upload
  businessLicenseUrl: z
      .string()
      .optional()
      .nullable(),
});

// Export constants for use in components
export const FILE_VALIDATION = {
  LICENSE: {
    maxSize: 10 * 1024 * 1024,
    acceptedTypes: ["image/png", "image/jpeg", "image/webp", "image/jpg", "application/pdf"],
    acceptString: "image/*,.pdf",
  },
  LOGO: {
    maxSize: 5 * 1024 * 1024,
    acceptedTypes: ["image/png", "image/jpeg", "image/webp", "image/jpg"],
    acceptString: "image/*",
  },
  BANNER: {
    maxSize: 5 * 1024 * 1024,
    acceptedTypes: ["image/png", "image/jpeg", "image/webp", "image/jpg"],
    acceptString: "image/*",
  },
};

export const VENDOR_STATUS = {
  UNVERIFIED:     "unverified",
  PENDING_REVIEW: "pending_review",
  VERIFIED:       "verified",
  REJECTED:       "rejected",
  SUSPENDED:      "suspended",
};

export const PAYOUT_STATUS = {
  ENABLED:               "enabled",
  BLOCKED_NO_TAX_ID:     "blocked_no_tax_id",
  BLOCKED_UNVERIFIED:    "blocked_unverified",
  BLOCKED_OTHER:         "blocked_other",
};

export const VENDOR_CAPABILITIES = {
  CAN_LIST:             "can_list",
  CAN_RECEIVE_ORDERS:   "can_receive_orders",
  CAN_RECEIVE_PAYOUTS:  "can_receive_payouts",
};