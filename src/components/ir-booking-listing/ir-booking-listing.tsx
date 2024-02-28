import { BookingListingService } from '@/services/booking_listing.service';
import { RoomService } from '@/services/room.service';
import booking_listing, { updateUserSelection, onBookingListingChange } from '@/stores/booking_listing.store';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import axios from 'axios';
import moment from 'moment';

@Component({
  tag: 'ir-booking-listing',
  styleUrl: 'ir-booking-listing.css',
  scoped: true,
})
export class IrBookingListing {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() baseurl: string = '';
  @Prop() propertyid: number;

  @State() isLoading = false;
  @State() currentPage = 1;
  @State() totalPages = 1;

  private bookingListingService = new BookingListingService();
  private roomService = new RoomService();

  componentWillLoad() {
    if (this.baseurl) {
      axios.defaults.baseURL = this.baseurl;
    }
    if (this.ticket !== '') {
      this.bookingListingService.setToken(this.ticket);
      this.roomService.setToken(this.ticket);
      booking_listing.token = this.ticket;
      this.initializeApp();
    }
    onBookingListingChange('userSelection', newValue => {
      const newTotal = newValue.total_count;
      if (newTotal && this.totalPages !== newTotal) {
        this.totalPages = Math.round(newTotal / 10);
      }
    });
  }
  @Watch('ticket')
  async ticketChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.bookingListingService.setToken(this.ticket);
      this.roomService.setToken(this.ticket);
      booking_listing.token = this.ticket;
      this.initializeApp();
    }
  }
  async initializeApp() {
    try {
      this.isLoading = true;
      updateUserSelection('property_id', this.propertyid);
      await Promise.all([this.bookingListingService.getExposedBookingsCriteria(), this.roomService.fetchLanguage(this.language, ['_BOOKING_LIST_FRONT'])]);
      await this.bookingListingService.getExposedBookings({ ...booking_listing.userSelection, is_to_export: false });
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    if (this.isLoading) {
      return (
        <div class="bg-white h-100">
          <ir-loading-screen></ir-loading-screen>
        </div>
      );
    }
    return (
      <Host class="p-1">
        <ir-listing-header></ir-listing-header>
        <section>
          <div class="card p-1 flex-fill m-0 mt-2">
            <table class="table table-striped table-bordered no-footer dataTable">
              <thead>
                <tr>
                  <th scope="col" class="text-left">
                    {locales.entries?.Lcz_Booking}#
                  </th>
                  <th scope="col">{locales.entries?.Lcz_BookedOn}</th>
                  <th scope="col" class="text-left">
                    {locales.entries?.Lcz_GuestSource}
                  </th>
                  <th scope="col" class="text-left">
                    {locales.entries?.Lcz_PriceBalance}
                  </th>
                  <th scope="col" class="text-left">
                    {locales.entries?.Lcz_Services}
                  </th>
                  <th scope="col" class="text-left">
                    {locales.entries?.Lcz_InOut}
                  </th>
                  <th scope="col" class="text-left">
                    {locales.entries?.Lcz_Status}
                  </th>
                  <th scope="col">
                    <p class="sr-only">actions</p>
                  </th>
                </tr>
              </thead>
              <tbody class="">
                {booking_listing.bookings?.map(booking => (
                  <tr key={booking.booking_nbr}>
                    <td class="text-left">{booking.booking_nbr}</td>
                    <td>
                      <p class="p-0 m-0">{moment(booking.booked_on.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</p>
                      <p class="p-0 m-0">
                        {booking.booked_on.hour}:{booking.booked_on.minute}
                      </p>
                    </td>
                    <th>
                      <p class="p-0 m-0">{moment(booking.booked_on.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</p>
                      <p class="p-0 m-0">
                        {booking.booked_on.hour}:{booking.booked_on.minute}
                      </p>
                    </th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <section>{this.totalPages}</section>
          </div>
        </section>
      </Host>
    );
  }
}
