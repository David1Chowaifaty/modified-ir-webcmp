import { z } from 'zod';

const nonEmptyString = (message: string) => z.string().trim().min(1, message);

const optionalEmailSchema = z.string().trim().email('Enter a valid email address').or(z.literal('')).optional().nullable();

export const guestInfoFormSchema = z.object({
  first_name: nonEmptyString('First name is required'),
  last_name: nonEmptyString('Last name is required'),
  email: nonEmptyString('Email is required').email('Enter a valid email address'),
  alternative_email: optionalEmailSchema,
  country_id: z.number({ required_error: 'Country is required' }).int('Country is required').positive('Country is required'),
  mobile: nonEmptyString('Mobile number is required').min(5, 'Mobile number is too short'),
  country_phone_prefix: nonEmptyString('Country code is required'),
  notes: z.string().max(2000, 'Private note cannot exceed 2000 characters').optional(),
});

export type GuestInfoFormValues = z.infer<typeof guestInfoFormSchema>;
