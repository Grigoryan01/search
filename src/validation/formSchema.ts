import { z } from 'zod';

import { COUNTRIES } from '../data/countries';
import { isValidEmail } from '../utils/emailValidation';

const countrySet = new Set<string>(COUNTRIES);

export function isNameValid(name: string): boolean {
  if (!name || name.length === 0) {
    return false;
  }
  const firstChar = name.charAt(0);
  return firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
}

export const formSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .refine(isNameValid, 'Name must start with an uppercase letter'),
    age: z
      .number({ message: 'Age must be a number' })
      .refine((value) => !Number.isNaN(value), 'Age must be a number')
      .refine((value) => value >= 0, 'Age cannot be negative'),
    email: z
      .string()
      .min(1, 'Email is required')
      .refine(isValidEmail, 'Enter a valid email (one @, non-empty local part, domain with a dot)'),
    gender: z.string().min(1, 'Please select a gender'),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: 'You must accept the Terms and Conditions',
    }),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    country: z
      .string()
      .min(1, 'Country is required')
      .refine((value) => countrySet.has(value), 'Select a country from the list'),
    imageBase64: z.string().min(1, 'Image is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type FormSchemaValues = z.infer<typeof formSchema>;

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((fieldErrors, issue) => {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) {
      return { ...fieldErrors, [key]: issue.message };
    }
    return fieldErrors;
  }, {});
}
