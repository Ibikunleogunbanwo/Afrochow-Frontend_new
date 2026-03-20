import { z } from "zod";

export const CANADIAN_PROVINCES = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT",
];

export const addressSchema = z.object({
  addressLine: z.string()
      .min(3,   { message: "Address is required" })
      .max(200, { message: "Address must be less than 200 characters" }),
  city: z.string()
      .min(2,   { message: "City is required" })
      .max(100, { message: "City must be less than 100 characters" }),
  province: z.string()
      .toUpperCase()
      .refine((v) => CANADIAN_PROVINCES.includes(v), {
        message: "Please enter a valid Canadian province code (e.g. AB, ON, BC)",
      }),
  postalCode: z.string()
      .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, {
        message: "Invalid postal code — use format A1A 1A1",
      }),
  country: z.string().min(2, { message: "Country is required" }),
  defaultAddress: z.boolean(),
});
