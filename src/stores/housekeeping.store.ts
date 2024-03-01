import { createStore } from '@stencil/store';

export interface IHouseKeepingStore {
  token: string;
}

const initialValue: IHouseKeepingStore = {
  token: '',
};

export const { state: housekeeping_store } = createStore<IHouseKeepingStore>(initialValue);
export default housekeeping_store;
