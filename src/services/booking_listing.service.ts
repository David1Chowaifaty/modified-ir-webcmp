import booking_listing, { ExposedBookingsParams, initializeUserSelection } from '@/stores/booking_listing.store';
import { extras, isPrivilegedUser } from '@/utils/utils';
import axios from 'axios';

export class BookingListingService {
  public async getExposedBookingsCriteria(property_id: number) {
    const { data } = await axios.post(`/Get_Exposed_Bookings_Criteria`, {
      property_id,
    });
    const result = data.My_Result;
    booking_listing.channels = result.channels;
    booking_listing.settlement_methods = result.settlement_methods;
    booking_listing.statuses = result.statuses;
    booking_listing.types = result.types;
    booking_listing.balance_filter = result.balance_filter;
    initializeUserSelection();
  }

  public async getExposedBookings(params: ExposedBookingsParams, options?: { append?: boolean }) {
    const { property_id, userTypeCode, channel, property_ids, ...rest } = params;
    const havePrivilege = isPrivilegedUser(userTypeCode);
    const { data } = await axios.post(`/Get_Exposed_Bookings`, {
      ...rest,
      extras,
      property_id: havePrivilege ? undefined : property_id,
      property_ids: havePrivilege ? property_ids : null,
      channel: havePrivilege ? '' : channel,
    });
    const result = data.My_Result;
    const header = data.My_Params_Get_Exposed_Bookings;
    if (options?.append) {
      booking_listing.bookings = [...booking_listing.bookings, ...result];
    } else {
      booking_listing.bookings = [...result];
    }
    booking_listing.userSelection = {
      ...booking_listing.userSelection,
      total_count: header.total_count,
    };
    booking_listing.download_url = header.exported_data_url;
  }
  public async removeExposedBooking(booking_nbr: string, is_to_revover: boolean) {
    await axios.post(`/Remove_Exposed_Booking`, {
      booking_nbr,
      is_to_revover,
    });
  }
}
