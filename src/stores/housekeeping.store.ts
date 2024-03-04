import { IExposedHouseKeepingSetup } from '@/models/housekeeping';
import { createStore } from '@stencil/store';

export interface IHouseKeepingStore {
  token: string;
  hk_criteria: IExposedHouseKeepingSetup;
}

const initialValue: IHouseKeepingStore = {
  token: '',
  hk_criteria: undefined,
};

export const { state: housekeeping_store } = createStore<IHouseKeepingStore>(initialValue);
export function updateHKStore(key: keyof IHouseKeepingStore, value: any) {
  housekeeping_store[key] = value;
}
export default housekeeping_store;
