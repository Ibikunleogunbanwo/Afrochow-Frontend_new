import { z } from "zod";

/**
 * Helper to safely parse optional numeric fields
 * Accepts string or number, converts to number, treats invalid/empty as null
 */
const optionalNumber = (minVal, maxVal, name) => {
    return z
        .union([z.number(), z.string(), z.null(), z.undefined()])
        .transform((val) => {
            // Handle null, undefined, or empty string
            if (val === null || val === undefined || val === "") {
                return null;
            }
            const num = Number(val);
            return Number.isNaN(num) ? null : num;
        })
        .nullable()
        .refine((val) => val === null || typeof val === "number", {
            message: `${name} must be a valid number`,
        })
        .refine((val) => val === null || (minVal === undefined || val >= minVal), {
            message: minVal !== undefined ? `${name} cannot be less than ${minVal}` : undefined,
        })
        .refine((val) => val === null || (maxVal === undefined || val <= maxVal), {
            message: maxVal !== undefined ? `${name} cannot be greater than ${maxVal}` : undefined,
        });
};

/**
 * Single day operating hours
 */
const dayHoursSchema = z.object({
    isOpen: z.boolean(),
    openTime: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    closeTime: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
}).refine((data) => {
    if (!data.isOpen) return true;
    const [openH, openM] = data.openTime.split(":").map(Number);
    const [closeH, closeM] = data.closeTime.split(":").map(Number);
    return closeH * 60 + closeM > openH * 60 + openM;
}, {
    message: "Closing time must be after opening time",
    path: ["closeTime"],
});

/**
 * Full business operations schema
 */
export const businessOpsSchema = z.object({
    // Operating hours
    operatingHours: z.object({
        monday: dayHoursSchema,
        tuesday: dayHoursSchema,
        wednesday: dayHoursSchema,
        thursday: dayHoursSchema,
        friday: dayHoursSchema,
        saturday: dayHoursSchema,
        sunday: dayHoursSchema,
    }).refine(
        (hours) => Object.values(hours).some(day => day.isOpen),
        { message: "At least one day must be open", path: ["monday"] }
    ),

    // Delivery & Pickup options
    offersDelivery: z.boolean(),
    offersPickup: z.boolean(),

    // Preparation time is required
    preparationTime: optionalNumber(5, 180, "Preparation time").refine(val => val !== null, {
        message: "Preparation time is required",
    }),

    // Delivery fields — optional but validated if provided
    deliveryFee: optionalNumber(0, undefined, "Delivery fee"),
    minimumOrderAmount: optionalNumber(0, undefined, "Minimum order amount"),
    estimatedDeliveryMinutes: optionalNumber(10, 180, "Estimated delivery minutes"),
    maxDeliveryDistanceKm: optionalNumber(1, 50, "Max delivery distance"),

}).refine((data) => data.offersDelivery || data.offersPickup, {
    message: "At least delivery or pickup must be enabled",
    path: ["offersDelivery"],
}).refine((data) => {
    if (!data.offersDelivery) return true;
    // If delivery is enabled, all delivery fields must be filled
    return (
        data.deliveryFee !== null &&
        data.minimumOrderAmount !== null &&
        data.estimatedDeliveryMinutes !== null &&
        data.maxDeliveryDistanceKm !== null
    );
}, {
    message: "All delivery settings are required when delivery is enabled",
    path: ["deliveryFee"],
});

export default businessOpsSchema;


/**
 * Creates default operating hours for a week
 */
export const createDefaultOperatingHours = () => ({
    monday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
    tuesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
    wednesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
    thursday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
    friday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
    saturday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
    sunday: { isOpen: false, openTime: "09:00", closeTime: "22:00" },
});
