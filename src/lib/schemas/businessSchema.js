import { z } from "zod";

// Accepted file types
const imageTypes = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
const documentTypes = [...imageTypes, "application/pdf"];

// File size limits (in bytes)
const MAX_LICENSE_SIZE = 10 * 1024 * 1024; 
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;    

// Helper function to format file size
const formatFileSize = (bytes) => {
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
};

export const businessSchema = z.object({
  // Tax ID / Business Number - OPTIONAL
  // Required before first payout
  taxId: z
    .string()
    .optional()
    .nullable()
    .refine(
      (value) => {
        // If empty, null, or undefined - it's valid (optional field)
        if (!value || value.trim() === "") return true;
        
        // If provided, must be at least 5 characters
        return value.length >= 5;
      },
      { message: "Tax ID must be at least 5 characters" }
    )
    .refine(
      (value) => {
        // If empty, null, or undefined - it's valid (optional field)
        if (!value || value.trim() === "") return true;

        // If provided, must be less than 50 characters
        return value.length <= 50;
      },
      { message: "Tax ID must be less than 50 characters" }
    )
    .refine(
      (value) => {
        // If empty, null, or undefined - it's valid (optional field)
        if (!value || value.trim() === "") return true;
        
        // If provided, must match the pattern
        return /^[a-zA-Z0-9-]+$/.test(value);
      },
      { message: "Tax ID can only contain letters, numbers, and hyphens" }
    ),

  // Business License - OPTIONAL
  // Strongly recommended for verification and credibility
  businessLicense: z
    .any()
    .optional()
    .nullable()
    .refine((file) => {
      // If no file provided, that's valid (optional)
      if (!file) return true;

      // If file provided, validate it
      return file instanceof File && documentTypes.includes(file.type);
    }, "Business license must be an image (PNG, JPG, WEBP) or PDF")
    .refine((file) => {
      if (!file) return true;

      return file instanceof File && file.size <= MAX_LICENSE_SIZE;
    }, `Business license must be less than ${formatFileSize(MAX_LICENSE_SIZE)}`),

  // Logo - REQUIRED
  logoFile: z
    .any()
    .refine((file) => {
      return file instanceof File;
    }, "Restaurant logo is required")
    .refine((file) => {
      if (!(file instanceof File)) return false;
      return imageTypes.includes(file.type);
    }, "Logo must be an image (PNG, JPG, or WEBP)")
    .refine((file) => {
      if (!(file instanceof File)) return false;
      return file.size <= MAX_IMAGE_SIZE;
    }, `Logo must be less than ${formatFileSize(MAX_IMAGE_SIZE)}`),

  // Banner - REQUIRED
  bannerFile: z
    .any()
    .refine((file) => {
      return file instanceof File;
    }, "Restaurant banner is required")
    .refine((file) => {
      if (!(file instanceof File)) return false;
      return imageTypes.includes(file.type);
    }, "Banner must be an image (PNG, JPG, or WEBP)")
    .refine((file) => {
      if (!(file instanceof File)) return false;
      return file.size <= MAX_IMAGE_SIZE;
    }, `Banner must be less than ${formatFileSize(MAX_IMAGE_SIZE)}`),
});

// Export constants for use in components
export const FILE_VALIDATION = {
  LICENSE: {
    maxSize: MAX_LICENSE_SIZE,
    acceptedTypes: documentTypes,
    acceptString: "image/*,.pdf",
  },
  LOGO: {
    maxSize: MAX_IMAGE_SIZE,
    acceptedTypes: imageTypes,
    acceptString: "image/*",
  },
  BANNER: {
    maxSize: MAX_IMAGE_SIZE,
    acceptedTypes: imageTypes,
    acceptString: "image/*",
  },
};

// Vendor verification statuses for backend
export const VENDOR_STATUS = {
  // No documents provided
  UNVERIFIED: "unverified",
  
  // License submitted, pending review
  PENDING_REVIEW: "pending_review",
  
  // License reviewed and approved
  VERIFIED: "verified",
  
  // License rejected
  REJECTED: "rejected",
  
  // Account suspended
  SUSPENDED: "suspended",
};

// Payout statuses for backend
export const PAYOUT_STATUS = {
  // Can receive payouts (has tax ID and is verified)
  ENABLED: "enabled",
  
  // Blocked due to missing tax ID
  BLOCKED_NO_TAX_ID: "blocked_no_tax_id",
  
  // Blocked due to unverified status
  BLOCKED_UNVERIFIED: "blocked_unverified",
  
  // Blocked for other reasons
  BLOCKED_OTHER: "blocked_other",
};

// Account capabilities for backend
export const VENDOR_CAPABILITIES = {
  // Can list restaurant and menu
  CAN_LIST: "can_list",
  
  // Can receive orders from customers
  CAN_RECEIVE_ORDERS: "can_receive_orders",
  
  // Can receive payouts
  CAN_RECEIVE_PAYOUTS: "can_receive_payouts",
};