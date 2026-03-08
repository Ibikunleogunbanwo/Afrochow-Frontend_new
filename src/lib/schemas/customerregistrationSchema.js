// src/app/schemas/customerRegistrationSchema.js
import { z } from 'zod';

/* ---------- sub-schemas ---------- */
const addressSchema = z.object({
    addressLine: z.string().min(1, 'Street address is required'),
    city       : z.string().min(1, 'City is required'),
    province   : z.string().min(1, 'Please select a province'),
    postalCode : z.string().regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Valid postal code: A1A 1A1'),
    country    : z.string().min(1, 'Country is required'),
    defaultAddress: z.boolean(),
});

/* ---------- main schema ---------- */
export const registrationSchema = z
    .object({
        username   : z.string().min(3, 'Username must be at least 3 characters'),
        email      : z.string().email('Please enter a valid email address'),
        password   : z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        firstName  : z.string().min(1, 'First name is required'),
        lastName   : z.string().min(1, 'Last name is required'),
        phone      : z.string().min(1, 'Phone number is required'),
        profileImageUrl: z.any().optional(),
        acceptTerms: z.boolean().refine(v => v, { message: 'You must accept the terms and conditions' }),
        defaultDeliveryInstructions: z.string().optional(),
        address    : addressSchema,
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path   : ['confirmPassword'],
    });

/* ---------- safe error formatter ---------- */
export const formatZodErrors = (zodError) => {
    const errors = {};
    if (!zodError || !Array.isArray(zodError?.errors)) return errors;

    zodError.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
    });
    return errors;
};