import { z } from "zod";
import { passwordSchema } from "@/lib/schemas/accountSchema";
import { CANADIAN_PROVINCES } from "@/lib/schemas/addressSchema";

/* ---------- Address sub-schema ---------- */
const addressSchema = z.object({
    addressLine: z.string()
        .min(1,   { message: "Street address is required" })
        .max(200, { message: "Address must be less than 200 characters" }),
    city: z.string()
        .min(1,   { message: "City is required" })
        .max(100, { message: "City must be less than 100 characters" }),
    province: z.string()
        .toUpperCase()
        .refine((v) => CANADIAN_PROVINCES.includes(v), {
            message: "Please select a valid Canadian province",
        }),
    postalCode: z.string()
        .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, {
            message: "Valid postal code format: A1A 1A1",
        }),
    country: z.string().min(1, { message: "Country is required" }),
    defaultAddress: z.boolean(),
});

/* ---------- Main schema ---------- */
export const registrationSchema = z
    .object({
        email:           z.string().email("Please enter a valid email address"),
        password:        passwordSchema,
        confirmPassword: z.string().min(1, "Please confirm your password"),
        firstName: z.string()
            .min(1,  { message: "First name is required" })
            .max(50, { message: "First name must be less than 50 characters" }),
        lastName: z.string()
            .min(1,  { message: "Last name is required" })
            .max(50, { message: "Last name must be less than 50 characters" }),
        phone: z.string()
            .min(10, { message: "Phone number must be at least 10 digits" })
            .regex(/^[\d\s\-\(\)\+]+$/, { message: "Invalid phone number format" }),
        profileImageUrl: z.any().optional(),
        acceptTerms: z.boolean().refine((v) => v, {
            message: "You must accept the terms and conditions",
        }),
        defaultDeliveryInstructions: z.string()
            .max(500, { message: "Delivery instructions must be less than 500 characters" })
            .optional(),
        address: addressSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path:    ["confirmPassword"],
    });

/* ---------- Safe error formatter ---------- */
export const formatZodErrors = (zodError) => {
    const errors = {};
    if (!zodError || !Array.isArray(zodError?.errors)) return errors;
    zodError.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
    });
    return errors;
};
