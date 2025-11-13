import { ICountry } from '@/models/IBooking';
import { createStore } from '@stencil/store';
import { z } from 'zod';
import { Currency } from '@/models/property';
import { MarketPlace } from '@/services/mpo-service/types';

const optionalString = () => z.string().optional().or(z.literal(''));
const optionalUrl = () => z.string().url().optional().or(z.literal(''));
const fileSchema = typeof File !== 'undefined' ? z.instanceof(File) : z.any();
const fileArraySchema = z.array(fileSchema).max(10);
const smtpDependentKeys = ['smtpPort', 'smtpLogin', 'smtpPassword', 'noReplyEmail'] as const;

export const smtpDependentFields = smtpDependentKeys;

const mpoWhiteLabelBaseSchema = z.object({
  enabled: z.boolean(),
  extranetUrl: optionalUrl(),
  smtpServer: optionalUrl(),
  smtpPort: optionalString(),
  smtpLogin: optionalString(),
  smtpPassword: optionalString(),
  noReplyEmail: optionalString(),
  enableCustomSmtp: z.boolean().default(false),
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
  companyWebsite: optionalUrl(),
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
  companyWebsite: schemaShape.companyWebsite,
} as const;

const whiteLabelShape = mpoWhiteLabelBaseSchema.shape;

export const mpoWhiteLabelFieldSchemas = {
  extranetUrl: whiteLabelShape.extranetUrl,
  smtpServer: whiteLabelShape.smtpServer,
  smtpPort: whiteLabelShape.smtpPort,
  smtpLogin: whiteLabelShape.smtpLogin,
  smtpPassword: whiteLabelShape.smtpPassword,
  noReplyEmail: whiteLabelShape.noReplyEmail,
  enableCustomSmtp: whiteLabelShape.enableCustomSmtp,
} as const;

export const affiliateFormSchema = z.object({
  active: z.boolean({ required_error: 'Select a status' }),
  code: z.string().min(1, 'Affiliate code is required'),
  companyName: z.string().min(1, 'Company name is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Enter a valid email'),
  website: z
    .string()
    .min(1, 'Website is required')
    .regex(/^(?!https?:\/\/)(?!www\.)[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/u, 'Enter a valid domain (no protocol or www)'),
  ctaColor: optionalString(),
  logo: z.union([optionalString(), fileArraySchema.optional()]),
  favicon: z.union([optionalString(), fileArraySchema.optional()]),
  customCss: optionalString(),
  conversionTag: optionalString(),
  headerTag: optionalString(),
  bodyTag: optionalString(),
  footerTag: optionalString(),
});

export type AffiliateForm = z.infer<typeof affiliateFormSchema>;

const affiliateShape = affiliateFormSchema.shape;

export const affiliateFormSchemas = {
  active: affiliateShape.active,
  code: affiliateShape.code,
  companyName: affiliateShape.companyName,
  country: affiliateShape.country,
  city: affiliateShape.city,
  address: affiliateShape.address,
  phone: affiliateShape.phone,
  email: affiliateShape.email,
  website: affiliateShape.website,
  ctaColor: affiliateShape.ctaColor,
  logo: affiliateShape.logo,
} as const;

export interface MpoManagementSelects {
  countries: ICountry[];
  marketPlaces: ICountry[];
  currencies: Currency[];
}

export interface MpoManagementStoreState {
  companyInfo: MpoManagementForm;
  selects: MpoManagementSelects;
  marketPlaces: MarketPlace[];
  affiliates: AffiliateForm[];
  affiliateNewForm: AffiliateForm;
}

const initialState: MpoManagementStoreState = {
  companyInfo: {
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
    companyWebsite: '',
    whiteLabel: {
      enabled: false,
      extranetUrl: '',
      smtpServer: '',
      smtpPort: '',
      smtpLogin: '',
      smtpPassword: '',
      noReplyEmail: '',
      enableCustomSmtp: false,
    },
  },
  affiliates: [],
  affiliateNewForm: {
    active: false,
    address: '',
    city: '',
    code: '',
    companyName: '',
    country: '',
    ctaColor: '',
    email: '',
    logo: '',
    phone: '',
    website: '',
    bodyTag: '',
    conversionTag: '',
    customCss: '',
    favicon: '',
    footerTag: '',
    headerTag: '',
  },
  marketPlaces: [],
  selects: {
    marketPlaces: [],
    countries: [],
    currencies: [],
  },
};

export const { state: mpoManagementStore } = createStore<MpoManagementStoreState>(initialState);

export type RootMpoFields = Exclude<keyof MpoManagementForm, 'whiteLabel'>;

export function updateMpoManagementField<Field extends RootMpoFields>(field: Field, value: MpoManagementForm[Field]) {
  mpoManagementStore.companyInfo = {
    ...mpoManagementStore.companyInfo,
    [field]: value,
  };
}
export function updateMpoManagementFields(params: Partial<Omit<MpoManagementForm, 'whiteLabel'>>) {
  mpoManagementStore.companyInfo = {
    ...mpoManagementStore.companyInfo,
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
  mpoManagementStore.companyInfo = {
    ...mpoManagementStore.companyInfo,
    whiteLabel: {
      ...mpoManagementStore.companyInfo.whiteLabel,
      [field]: value,
    },
  };
}

export function resetMpoManagementForm(next?: Partial<MpoManagementForm>) {
  mpoManagementStore.companyInfo = {
    ...initialState.companyInfo,
    ...next,
    whiteLabel: {
      ...initialState.companyInfo.whiteLabel,
      ...(next?.whiteLabel || {}),
    },
  };
}

//--------------
// Marketplaces
//--------------

export function removeMarketPlace(id: MarketPlace['id']) {
  mpoManagementStore.marketPlaces = [...mpoManagementStore.marketPlaces.filter(m => m.id !== id)];
}

export function upsertMarketPlace(params: MarketPlace[]) {
  mpoManagementStore.marketPlaces = [...params];
}

//--------------
// Affiliate
//--------------

export function updateAffiliateFormField<Field extends keyof AffiliateForm>(field: Field, value: AffiliateForm[Field]) {
  mpoManagementStore.affiliateNewForm = {
    ...mpoManagementStore.affiliateNewForm,
    [field]: value,
  };
}

export function resetAffiliateForm(next?: Partial<AffiliateForm>) {
  mpoManagementStore.affiliateNewForm = {
    ...initialState.affiliateNewForm,
    ...next,
  };
}
