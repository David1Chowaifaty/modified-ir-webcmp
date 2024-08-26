export interface PaymentOption {
  code: string;
  data: OptionField[] | null;
  description: string;
  id: null | number;
  is_active: null;
  is_payment_gateway: boolean;
  property_id: null;
}

export interface OptionField {
  key: string;
  value: null;
}
