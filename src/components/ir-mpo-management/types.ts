import { z } from 'zod';

const optionalString = () => z.string().optional().or(z.literal(''));
const fileSchema = typeof File !== 'undefined' ? z.instanceof(File) : z.any();
const fileArraySchema = z.array(fileSchema).max(10);

export const mpoWhiteLabelSchema = z.object({
  enabled: z.boolean(),
  extranetUrl: optionalString(),
  companyWebsite: optionalString(),
  smtpServer: optionalString(),
  smtpPort: optionalString(),
  smtpLogin: optionalString(),
  smtpPassword: optionalString(),
  noReplyEmail: optionalString(),
});

export const mpoManagementSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyLogo: z.union([optionalString(), fileArraySchema.optional()]),
  username: z.string(),
  password: z.string().min(1, 'Password is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  billingCurrency: z.string().min(1, 'Billing currency is required'),
  mainContact: optionalString(),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(1, 'Phone is required'),
  notificationEmail: optionalString(),
  receiveNotificationOnEmail: z.boolean(),
  notes: optionalString(),
  whiteLabel: mpoWhiteLabelSchema,
});

export type MpoWhiteLabelSettings = z.infer<typeof mpoWhiteLabelSchema>;
export type MpoManagementForm = z.infer<typeof mpoManagementSchema>;
