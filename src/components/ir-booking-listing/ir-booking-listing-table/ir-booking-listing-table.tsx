import { Booking, Occupancy } from '@/models/booking.dto';
import booking_listing from '@/stores/booking_listing.store';
import locales from '@/stores/locales.store';
import { getPrivateNote } from '@/utils/booking';
import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-booking-listing-table',
  styleUrls: ['ir-booking-listing-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrBookingListingTable {
  private calculateTotalPersons(booking: Booking) {
    const sumOfOccupancy = ({ adult_nbr, children_nbr, infant_nbr }: Occupancy) => {
      return (adult_nbr ?? 0) + (children_nbr ?? 0) + (infant_nbr ?? 0);
    };
    return booking.rooms.reduce((prev, cur) => {
      return sumOfOccupancy(cur.occupancy) + prev;
    }, 0);
  }
  private renderRow(booking: Booking) {
    const rowKey = `${booking.booking_nbr}`;
    const totalPersons = this.calculateTotalPersons(booking);
    const lastManipulation = booking.ota_manipulations ? booking.ota_manipulations[booking.ota_manipulations.length - 1] : null;

    return (
      <tr class="ir-table-row" key={rowKey}>
        <td class="sticky-column">
          <ir-booking-number-cell channelBookingNumber={booking.channel_booking_nbr} bookingNumber={booking.booking_nbr}></ir-booking-number-cell>
        </td>
        <td>
          <ir-booked-on-cell bookedOn={booking.booked_on}></ir-booked-on-cell>
        </td>
        <td class="text-center">
          <ir-booked-by-source-cell
            class="text-center"
            clickableGuest
            showRepeatGuestBadge={booking.guest.nbr_confirmed_bookings > 1 && !booking.agent}
            origin={booking.origin}
            guest={booking.guest}
            source={booking.source}
            identifier={booking.booking_nbr}
            showPersons
            showPrivateNoteDot={getPrivateNote(booking.extras)}
            totalPersons={totalPersons?.toString()}
            showPromoIcon={!!booking.promo_key}
            promoKey={booking.promo_key}
            showLoyaltyIcon={booking.is_in_loyalty_mode && !booking.promo_key}
          ></ir-booked-by-source-cell>
        </td>
        <td>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {booking.rooms.map(room => (
              <ir-unit-cell key={room.identifier} room={room}></ir-unit-cell>
            ))}
            {booking.extra_services && <p>{locales.entries.Lcz_ExtraServices}</p>}
          </div>
        </td>
        <td class="text-center">
          <ir-dates-cell checkIn={booking.from_date} checkOut={booking.to_date}></ir-dates-cell>
        </td>
        <td class="text-center">
          <ir-balance-cell
            data-css="center"
            bookingNumber={booking.booking_nbr}
            isDirect={booking.is_direct}
            statusCode={booking.status.code}
            currencySymbol={booking.currency.symbol}
            financial={booking.financial}
          ></ir-balance-cell>
        </td>
        <td class="text-center">
          <ir-status-activity-cell
            lastManipulation={lastManipulation}
            showManipulationBadge={!!lastManipulation}
            showModifiedBadge={!lastManipulation && booking.events?.length > 0 && booking.events[0].type.toLowerCase() === 'modified'}
            status={booking.status}
            isRequestToCancel={booking.is_requested_to_cancel}
            bookingNumber={booking.booking_nbr}
          ></ir-status-activity-cell>
        </td>
        <td>
          <div class="">
            <ir-actions-cell buttons={['edit', 'delete']}></ir-actions-cell>
          </div>
        </td>
      </tr>
    );
  }
  render() {
    return (
      <Host>
        <div class="table--container">
          <table class="table">
            <thead>
              <tr>
                <th>
                  <span class={'arrivals-table__departure__cell'}>Booking#</span>
                </th>
                <th class="text-center">Booked on</th>
                <th>
                  <div>
                    <p>Booked by / Source</p>
                  </div>
                </th>
                <th>Services</th>
                <th class="text-center">Dates</th>
                <th class="text-center">Amount</th>
                <th class="text-center">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {booking_listing.bookings?.map(booking => this.renderRow(booking))}
              {/* {!needsCheckInBookings.length && !inHouseBookings.length && (
                <tr>
                  <td colSpan={7} class="text-center text-muted">
                    No arrivals found.
                  </td>
                </tr>
              )} */}
            </tbody>
          </table>
        </div>
      </Host>
    );
  }
}
