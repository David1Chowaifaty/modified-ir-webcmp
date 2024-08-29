import { createStore } from '@stencil/store';
import { ILanguages, PaymentOption } from '@/models/payment-options';
export interface IPaymentOptionStore {
  selectedOption: PaymentOption | null;
  token: string;
  languages: ILanguages[];
  mode: 'edit' | 'create';
}
const initialState: IPaymentOptionStore = {
  selectedOption: null,
  token: null,
  mode: 'create',
  languages: null,
};
export const { state: payment_option_store } = createStore<IPaymentOptionStore>(initialState);

export default payment_option_store;
