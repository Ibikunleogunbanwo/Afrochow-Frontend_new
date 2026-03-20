import { z } from "zod";

// Shared password rules — must match backend exactly
export const passwordSchema = z.string()
    .min(8,   { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>\/?]/, {
        message: "Password must contain at least one special character (!@#$%^&* etc.)",
    });

export const accountSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
