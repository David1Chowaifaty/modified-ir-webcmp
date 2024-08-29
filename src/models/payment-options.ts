export interface PaymentOption {
  code: string;
  data: OptionField[] | null;
  description: string;
  id: null | number;
  is_active: boolean;
  is_payment_gateway: boolean;
  property_id: string | null;
  localizables: ILocalizable[] | null;
  display_order?: number;
}
export interface ILocalizable {
  code: string;
  description: string;
  id: number;
  language: ILanguages;
}

export interface OptionField {
  key: string;
  value: null;
}
export interface ILanguages {
  code: string;
  culture: string;
  description: string;
  direction: string;
  entries: null;
  flag: string;
  id: number;
}
