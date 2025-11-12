import { ICountry } from '@/models/IBooking';
import { createStore } from '@stencil/store';
import { z } from 'zod';
import { Currency } from '@/models/property';

const optionalString = () => z.string().optional().or(z.literal(''));
const optionalUrl = () => z.string().url().optional().or(z.literal(''));
const fileSchema = typeof File !== 'undefined' ? z.instanceof(File) : z.any();
const fileArraySchema = z.array(fileSchema).max(10);
const smtpDependentKeys = ['smtpPort', 'smtpLogin', 'smtpPassword', 'noReplyEmail'] as const;
export const smtpDependentFields = smtpDependentKeys;

const mpoWhiteLabelBaseSchema = z.object({
  enabled: z.boolean(),
  extranetUrl: optionalUrl(),
  companyWebsite: optionalUrl(),
  smtpServer: optionalUrl(),
  smtpPort: optionalString(),
  smtpLogin: optionalString(),
  smtpPassword: optionalString(),
  noReplyEmail: optionalString(),
});

export const mpoWhiteLabelSchema = mpoWhiteLabelBaseSchema.superRefine((values, ctx) => {
  const smtpServerFilled = Boolean(values.smtpServer?.trim());
  if (!smtpServerFilled) return;

  smtpDependentKeys.forEach(field => {
    if (!values[field]?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Required when SMTP server is provided',
        path: [field],
      });
    }
  });
});

export type MpoWhiteLabelSettings = z.infer<typeof mpoWhiteLabelSchema>;

export const mpoManagementSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyLogo: z.union([optionalString(), fileArraySchema.optional()]),
  companyFavicon: z.union([optionalString(), fileArraySchema.optional()]),
  username: z.string().min(1, 'Username is required'),
  password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+]).{8,16}$/, 'Password is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  billingCurrency: z.string().min(1, 'Billing currency is required'),
  mainContact: z.string().min(1, 'Main contact is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(1, 'Phone is required'),
  notificationEmail: optionalString(),
  receiveNotificationOnEmail: z.boolean(),
  notes: optionalString(),
  whiteLabel: mpoWhiteLabelSchema,
});

export type MpoManagementForm = z.infer<typeof mpoManagementSchema>;

const schemaShape = mpoManagementSchema.shape;

export const mpoCoreDetailSchemas = {
  companyName: schemaShape.companyName,
  username: schemaShape.username,
  password: schemaShape.password,
  country: schemaShape.country,
  city: schemaShape.city,
  billingCurrency: schemaShape.billingCurrency,
  address: schemaShape.address,
  mainContact: schemaShape.mainContact,
  email: schemaShape.email,
  phone: schemaShape.phone,
} as const;

const whiteLabelShape = mpoWhiteLabelBaseSchema.shape;

export const mpoWhiteLabelFieldSchemas = {
  extranetUrl: whiteLabelShape.extranetUrl,
  companyWebsite: whiteLabelShape.companyWebsite,
  smtpServer: whiteLabelShape.smtpServer,
  smtpPort: whiteLabelShape.smtpPort,
  smtpLogin: whiteLabelShape.smtpLogin,
  smtpPassword: whiteLabelShape.smtpPassword,
  noReplyEmail: whiteLabelShape.noReplyEmail,
} as const;

export interface MpoManagementSelects {
  countries: ICountry[];
  marketPlaces: ICountry[];
  currencies: Currency[];
}

export interface MpoManagementStoreState {
  form: MpoManagementForm;
  selects: MpoManagementSelects;
}

const initialState: MpoManagementStoreState = {
  form: {
    companyName: '',
    companyLogo: '',
    username: '',
    password: '',
    country: '',
    city: '',
    address: '',
    billingCurrency: '',
    mainContact: '',
    email: '',
    phone: '',
    notificationEmail: '',
    receiveNotificationOnEmail: true,
    notes: '',
    whiteLabel: {
      enabled: false,
      extranetUrl: '',
      companyWebsite: '',
      smtpServer: '',
      smtpPort: '',
      smtpLogin: '',
      smtpPassword: '',
      noReplyEmail: '',
    },
  },
  selects: {
    marketPlaces: [],
    countries: [],
    currencies: [],
  },
};

export const { state: mpoManagementStore } = createStore<MpoManagementStoreState>(initialState);

export type RootMpoFields = Exclude<keyof MpoManagementForm, 'whiteLabel'>;

export function updateMpoManagementField<Field extends RootMpoFields>(field: Field, value: MpoManagementForm[Field]) {
  mpoManagementStore.form = {
    ...mpoManagementStore.form,
    [field]: value,
  };
}
export function updateMpoManagementFields(params: Partial<Omit<MpoManagementForm, 'whiteLabel'>>) {
  mpoManagementStore.form = {
    ...mpoManagementStore.form,
    ...params,
  };
}
export function updateMpoSelectField(params: Partial<MpoManagementSelects>) {
  mpoManagementStore.selects = {
    ...mpoManagementStore.selects,
    ...params,
  };
}

export function updateWhiteLabelField(field: keyof MpoWhiteLabelSettings, value: MpoWhiteLabelSettings[typeof field]) {
  mpoManagementStore.form = {
    ...mpoManagementStore.form,
    whiteLabel: {
      ...mpoManagementStore.form.whiteLabel,
      [field]: value,
    },
  };
}

export function resetMpoManagementForm(next?: Partial<MpoManagementForm>) {
  mpoManagementStore.form = {
    ...initialState.form,
    ...next,
    whiteLabel: {
      ...initialState.form.whiteLabel,
      ...(next?.whiteLabel || {}),
    },
  };
}
