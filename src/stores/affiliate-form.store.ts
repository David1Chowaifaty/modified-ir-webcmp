import { createStore } from '@stencil/store';
import { z } from 'zod';

const optionalString = () => z.string().optional().or(z.literal(''));

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
  logo: optionalString(),
});

export type AffiliateForm = z.infer<typeof affiliateFormSchema>;

const schemaShape = affiliateFormSchema.shape;

export const affiliateFormSchemas = {
  active: schemaShape.active,
  code: schemaShape.code,
  companyName: schemaShape.companyName,
  country: schemaShape.country,
  city: schemaShape.city,
  address: schemaShape.address,
  phone: schemaShape.phone,
  email: schemaShape.email,
  website: schemaShape.website,
  ctaColor: schemaShape.ctaColor,
  logo: schemaShape.logo,
} as const;

export type SelectOption = { label: string; value: string };

export interface AffiliateFormSelects {
  countries: SelectOption[];
}

export interface AffiliateFormStoreState {
  form: AffiliateForm;
  selects: AffiliateFormSelects;
}

const initialState: AffiliateFormStoreState = {
  form: {
    active: false,
    code: '',
    companyName: '',
    country: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    ctaColor: '',
    logo: '',
  },
  selects: {
    countries: [
      { label: 'Select...', value: '' },
      { label: 'United States', value: 'US' },
      { label: 'United Kingdom', value: 'UK' },
      { label: 'Canada', value: 'CA' },
      { label: 'Australia', value: 'AU' },
      { label: 'Germany', value: 'DE' },
    ],
  },
};

export const { state: affiliateFormStore } = createStore<AffiliateFormStoreState>(initialState);

export function updateAffiliateFormField<Field extends keyof AffiliateForm>(field: Field, value: AffiliateForm[Field]) {
  affiliateFormStore.form = {
    ...affiliateFormStore.form,
    [field]: value,
  };
}

export function resetAffiliateForm(next?: Partial<AffiliateForm>) {
  affiliateFormStore.form = {
    ...initialState.form,
    ...next,
  };
}
