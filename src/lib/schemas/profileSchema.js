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
        .min(1, "Phone number is required")
        .refine(
            (val) => /^[\d\s\-\(\)\+.]+$/.test(val),
            { message: "Phone number contains invalid characters — only digits, spaces, dashes, dots, and parentheses are allowed" }
        )
        .refine(
            (val) => {
                // Mirror PhoneUtils.normalize(): strip non-digits, strip leading country code
                const digits = val.replace(/[^\d]/g, '');
                const normalized = digits.length === 11 && digits.startsWith('1')
                    ? digits.slice(1)
                    : digits;
                return normalized.length === 10;
            },
            { message: "Enter a valid 10-digit Canadian number (e.g. 416-234-5678 or +1 416 234 5678)" }
        ),

    profileImageUrl: z
        .string()
        .optional()
        .nullable(),
});