import { IExposedHouseKeepingSetup, IHKTasks, IPendingActions } from '@/models/housekeeping';
import { createStore } from '@stencil/store';

export interface IHouseKeepingStore {
  hk_criteria: IExposedHouseKeepingSetup;
  default_properties: {
    token: string;
    property_id: number;
    language: string;
  };
  hk_tasks: IHKTasks;
  pending_housekeepers: IPendingActions[];
}

const initialValue: IHouseKeepingStore = {
  default_properties: undefined,
  hk_criteria: undefined,
  hk_tasks: undefined,
  pending_housekeepers: [],
};

export const { state: housekeeping_store } = createStore<IHouseKeepingStore>(initialValue);
export function updateHKStore(key: keyof IHouseKeepingStore, value: any) {
  housekeeping_store[key] = value;
}
export function getDefaultProperties() {
  return housekeeping_store.default_properties;
}
export default housekeeping_store;
