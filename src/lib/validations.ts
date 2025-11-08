import { z } from 'zod';

// Name validation: limit characters, no special characters
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

// Email validation: proper format
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format');

// Mobile validation: starts with 6, 10 digits (without +91, as it's prefixed)
const mobileSchema = z
  .string()
  .min(1, 'Mobile number is required')
  .regex(/^[6-9]\d{9}$/, 'Invalid Mobile number. ');

// Password validation (assuming basic)
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

// Role validation
const roleSchema = z.enum(['member', 'manager']);

// Job title validation (string ID)
const jobTitleSchema = z
  .string()
  .min(1, 'Job title is required');

// Company name validation
const companyNameSchema = z
  .string()
  .max(100, 'Company name must be less than 100 characters')
  .optional();

// Interested locality validation (array of strings - IDs)
const interestedLocalitySchema = z
  .array(z.string())
  .optional();

// Interested category validation (array of strings - IDs)
const interestedCategorySchema = z
  .array(z.string())
  .optional();

// Register form schema
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  mobile: mobileSchema,
  jobTitle: jobTitleSchema,
  companyName: companyNameSchema,
  interestedLocality: interestedLocalitySchema,
  interestedCategory: interestedCategorySchema,
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Login form schema (only mobile number)
export const loginSchema = z.object({
  mobile: mobileSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;