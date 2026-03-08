import { z } from "zod";

export const addressSchema = z.object({
  addressLine: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().length(2, "Province code required"),
  postalCode: z
    .string()
    .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, "Invalid postal code"),
  country: z.string().min(2),
  defaultAddress: z.boolean(),
});
