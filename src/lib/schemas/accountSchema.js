import { z } from "zod";

export const accountSchema = z.object({
  username: z.string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(20, { message: "Username must be less than 20 characters" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores"
      }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z
      .string()
      .min(8, { message: "Confirm password must be at least 8 characters" }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});