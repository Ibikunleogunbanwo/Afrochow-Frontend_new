import { z } from "zod";

export const restaurantSchema = z.object({
  restaurantName: z.string()
      .min(1,   { message: "Restaurant name is required" })
      .max(100, { message: "Restaurant name must be less than 100 characters" }),
  description: z.string()
      .min(10,   { message: "Description must be at least 10 characters" })
      .max(1000, { message: "Description must be less than 1000 characters" }),
  cuisineType: z.string()
      .min(1,  { message: "Product type is required" })
      .max(50, { message: "Product type must be less than 50 characters" }),
});
