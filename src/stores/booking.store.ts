import { TAdultChildConstraints } from '..';
import { ISource } from './../../dist/types/models/IBooking.d';
import { createStore } from '@stencil/store';

export interface IDates {
  fromDate: string;
  toDate: string;
}
export interface IBookingDetails {
  source: ISource | null;
  guests: TAdultChildConstraints;
  dates: IDates;
}

const initialState: IBookingDetails = {
  source: null,
  guests: {
    adult_max_nbr: 0,
    child_max_nbr: 0,
    child_max_age: 0,
  },
  dates: {
    fromDate: '',
    toDate: '',
  },
};
export const { state: booking_details } = createStore<IBookingDetails>(initialState);

export default booking_details;
