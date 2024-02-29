import { IExposedBookingsCriteria } from '@/models/IrBookingListing';
import { Booking } from '@/models/booking.dto';
import { createStore } from '@stencil/store';
import moment from 'moment';

export interface IBookingListingStore extends IExposedBookingsCriteria {
  token: string;
  userSelection: IUserListingSelection;
  bookings: Booking[];
  download_url: string | null;
}
export interface IUserListingSelection {
  channel: string;
  property_id: number;
  filter_type: number;
  from: string;
  to: string;
  name: string;
  book_nbr: string;
  booking_status: string;
  affiliate_id: 0;
  is_mpo_managed: false;
  is_mpo_used: false;
  is_for_mobile: false;
  is_combined_view: false;
  start_row: number;
  end_row: number;
  total_count: number;
  is_to_export: boolean;
}

const initialState: IBookingListingStore = {
  channels: [],
  settlement_methods: [],
  statuses: [],
  types: [],
  token: '',
  bookings: [],
  userSelection: {
    from: moment().add(-7, 'days').format('YYYY-MM-DD'),
    to: moment().format('YYYY-MM-DD'),
    channel: undefined,
    property_id: null,
    start_row: 0,
    end_row: 20,
    total_count: 0,
    filter_type: null,
    name: '',
    book_nbr: '',
    booking_status: '',
    affiliate_id: 0,
    is_mpo_managed: false,
    is_mpo_used: false,
    is_for_mobile: false,
    is_combined_view: false,
    is_to_export: false,
  },
  download_url: null,
};

export const { state: booking_listing, onChange: onBookingListingChange } = createStore<IBookingListingStore>(initialState);
export function initializeUserSelection() {
  //booking_listing.channels[0].name
  booking_listing.userSelection = {
    ...booking_listing.userSelection,
    channel: '',
    booking_status: booking_listing.statuses[0].code,
    filter_type: booking_listing.types[0].id,
    book_nbr: '',
    name: '',
    total_count: 0,
  };
}
export function updateUserSelection(key: keyof IUserListingSelection, value: any) {
  booking_listing.userSelection = {
    ...booking_listing.userSelection,
    [key]: value,
  };
}
export default booking_listing;
