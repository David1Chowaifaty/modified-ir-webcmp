import { createStore } from '@stencil/store';
import { MpoWhiteLabelSettings } from '@/components/ir-mpo-management/types';

export interface MpoManagementFormValues {
  companyName: string;
  username: string;
  password: string;
  country: string;
  city: string;
  billingCurrency: string;
  address: string;
  mainContact: string;
  email: string;
  phone: string;
  whiteLabel: MpoWhiteLabelSettings;
}

export type SelectOption = { label: string; value: string };

export interface MpoManagementSelects {
  countries: SelectOption[];
}

export interface MpoManagementStoreState {
  form: MpoManagementFormValues;
  selects: MpoManagementSelects;
}

const initialState: MpoManagementStoreState = {
  form: {
    companyName: '',
    username: '',
    password: '',
    country: '',
    city: '',
    billingCurrency: '',
    address: '',
    mainContact: '',
    email: '',
    phone: '',
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
    countries: [
      { label: 'United States', value: 'US' },
      { label: 'United Kingdom', value: 'UK' },
      { label: 'Canada', value: 'CA' },
      { label: 'Australia', value: 'AU' },
      { label: 'Germany', value: 'DE' },
    ],
  },
};

export const { state: mpoManagementStore } = createStore<MpoManagementStoreState>(initialState);

type RootMpoFields = Exclude<keyof MpoManagementFormValues, 'whiteLabel'>;

export function updateMpoManagementField(field: RootMpoFields, value: string) {
  mpoManagementStore.form = {
    ...mpoManagementStore.form,
    [field]: value,
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

export function setMpoManagementSelectOptions(selectKey: keyof MpoManagementSelects, options: SelectOption[]) {
  mpoManagementStore.selects = {
    ...mpoManagementStore.selects,
    [selectKey]: options,
  };
}
