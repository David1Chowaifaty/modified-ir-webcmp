import { TAdultChildConstraints } from '..';
import { ISource } from './../../dist/types/models/IBooking.d';

import { createStore } from '@stencil/store';
export interface IBookingDetails {
  source: ISource | null;
  guests: TAdultChildConstraints;
  dates: null;
}

const initialState: IBookingDetails = {
  source: null,
  guests: {
    adult_max_nbr: 0,
    child_max_nbr: 0,
    child_max_age: 0,
  },
  dates: null,
};
export const { state: booking_details } = createStore<IBookingDetails>(initialState);

export default booking_details;
