import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-\(\)\+]+$/, "Invalid phone number format"),

  profileImageFile: z
    .any()
    .optional()
    .nullable()
    .refine(
      (value) => {
        // If no value, it's optional so pass
        if (!value) return true;
        
        // Handle FileList (from input)
        if (value instanceof FileList) {
          if (value.length === 0) return true;
          const file = value[0];
          if (!file || !file.type) return false;
          return ACCEPTED_IMAGE_TYPES.includes(file.type);
        }
        
        // Handle single File object
        if (value instanceof File) {
          if (!value.type) return false;
          return ACCEPTED_IMAGE_TYPES.includes(value.type);
        }
        
        // Handle array of files
        if (Array.isArray(value)) {
          if (value.length === 0) return true;
          const file = value[0];
          if (!file || !file.type) return false;
          return ACCEPTED_IMAGE_TYPES.includes(file.type);
        }
        
        // If it's some other type, assume it's valid (might be from state)
        return true;
      },
      {
        message: "Invalid file type. Only PNG, JPEG, JPG, and WEBP are allowed",
      }
    )
    .refine(
      (value) => {
        // If no value, it's optional so pass
        if (!value) return true;
        
        // Handle FileList (from input)
        if (value instanceof FileList) {
          if (value.length === 0) return true;
          const file = value[0];
          if (!file || !file.size) return false;
          return file.size <= MAX_FILE_SIZE;
        }
        
        // Handle single File object
        if (value instanceof File) {
          if (!value.size) return false;
          return value.size <= MAX_FILE_SIZE;
        }
        
        // Handle array of files
        if (Array.isArray(value)) {
          if (value.length === 0) return true;
          const file = value[0];
          if (!file || !file.size) return false;
          return file.size <= MAX_FILE_SIZE;
        }
        
        // If it's some other type, assume it's valid (might be from state)
        return true;
      },
      {
        message: "File size must be less than 5MB",
      }
    ),
});