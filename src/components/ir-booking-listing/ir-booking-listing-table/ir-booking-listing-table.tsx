import { Booking } from '@/models/booking.dto';
import booking_listing from '@/stores/booking_listing.store';
import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-booking-listing-table',
  styleUrls: ['ir-booking-listing-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrBookingListingTable {
  private renderRow(booking: Booking) {
    const rowKey = `${booking.booking_nbr}`;

    return (
      <tr class="ir-table-row" key={rowKey}>
        <td class="sticky-column">
          <ir-booking-number-cell channelBookingNumber={booking.channel_booking_nbr} bookingNumber={booking.booking_nbr}></ir-booking-number-cell>
        </td>
        <td>
          <ir-booked-on-cell bookedOn={booking.booked_on}></ir-booked-on-cell>
        </td>
        <td>
          <ir-booked-by-source-cell origin={booking.origin} guest={booking.guest} source={booking.source}></ir-booked-by-source-cell>
        </td>
        <td>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {booking.rooms.map(room => (
              <ir-unit-cell key={room.identifier} room={room}></ir-unit-cell>
            ))}
          </div>
        </td>
        <td>
          <ir-dates-cell checkIn={booking.from_date} checkOut={booking.to_date}></ir-dates-cell>
        </td>
        <td class="text-right">
          <ir-balance-cell
            bookingNumber={booking.booking_nbr}
            isDirect={booking.is_direct}
            statusCode={booking.status.code}
            currencySymbol={booking.currency.symbol}
            financial={booking.financial}
          ></ir-balance-cell>
        </td>
        <td>
          <div>
            <wa-badge style={{ padding: '0.375em 0.625em' }} variant="success">
              {booking.status.description}
            </wa-badge>
          </div>
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
                <th>Booked on</th>
                <th>
                  <div>
                    <p>Booked by / Source</p>
                  </div>
                </th>
                <th>Services</th>
                <th>Dates</th>
                <th class="text-right">Amount</th>
                <th>Status</th>
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
