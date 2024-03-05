import { IExposedHouseKeepingSetup } from '@/models/housekeeping';
import { createStore } from '@stencil/store';

export interface IHouseKeepingStore {
  hk_criteria: IExposedHouseKeepingSetup;
  default_properties: {
    token: string;
    property_id: number;
    language: string;
  };
}

const initialValue: IHouseKeepingStore = {
  default_properties: undefined,
  hk_criteria: undefined,
};

export const { state: housekeeping_store } = createStore<IHouseKeepingStore>(initialValue);
export function updateHKStore(key: keyof IHouseKeepingStore, value: any) {
  housekeeping_store[key] = value;
}
export function getDefaultProperties() {
  return housekeeping_store.default_properties;
}
export default housekeeping_store;
