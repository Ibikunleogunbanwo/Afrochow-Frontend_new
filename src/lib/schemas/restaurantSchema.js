import { z } from "zod";

export const restaurantSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  cuisineType: z.string().min(1, "Cuisine type is required"),
});
