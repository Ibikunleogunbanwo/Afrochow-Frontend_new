import { z } from "zod";

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

    profileImageUrl: z
        .string()
        .optional()
        .nullable(),
});