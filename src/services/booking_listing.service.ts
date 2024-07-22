import { Token } from '@/models/Token';
import booking_listing, { IUserListingSelection, initializeUserSelection } from '@/stores/booking_listing.store';
import axios from 'axios';

export class BookingListingService extends Token {
  public async getExposedBookingsCriteria(property_id: number) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Invalid token');
    }
    const { data } = await axios.post(`/Get_Exposed_Bookings_Criteria?Ticket=${token}`, {
      property_id,
    });

    const result = data.My_Result;

    booking_listing.channels = result.channels;
    booking_listing.settlement_methods = result.settlement_methods;
    booking_listing.statuses = result.statuses;
    booking_listing.types = result.types;
    initializeUserSelection();
  }

  public async getExposedBookings(params: IUserListingSelection) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Invalid token');
    }
    const { data } = await axios.post(`/Get_Exposed_Bookings?Ticket=${token}`, { ...params, extras: [{ key: 'private_note', value: '' }] });
    const result = data.My_Result;
    const header = data.My_Params_Get_Exposed_Bookings;
    booking_listing.bookings = [...result];
    booking_listing.userSelection = {
      ...booking_listing.userSelection,
      total_count: header.total_count,
    };
    booking_listing.download_url = header.exported_data_url;
  }
  public async removeExposedBooking(booking_nbr: string, is_to_revover: boolean) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Invalid token');
    }
    await axios.post(`/Remove_Exposed_Booking?Ticket=${token}`, {
      booking_nbr,
      is_to_revover,
    });
  }
}
