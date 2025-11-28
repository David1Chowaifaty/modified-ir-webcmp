import { Booking } from '@/models/booking.dto';
import { arrivalsStore } from '@/stores/arrivals.store';
import { Component, Host, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-arrivals-table',
  styleUrls: ['ir-arrivals-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrArrivalsTable {
  private renderSection(bookings: Booking[], showAction = false) {
    if (!bookings?.length) {
      return null;
    }

    const rows = bookings.flatMap(booking => this.renderBookingRows(booking, showAction));
    return [...rows];
  }

  private renderBookingRows(booking: Booking, showAction: boolean) {
    return (booking.rooms ?? []).map((room, index) => this.renderRow(booking, room, index, showAction));
  }

  private renderRow(booking: Booking, room: Booking['rooms'][number], index: number, showAction: boolean) {
    const rowKey = `${booking.booking_nbr}-${room?.identifier ?? index}`;
    const isOverdueCheckIn = moment(room.from_date, 'YYYY-MM-DD').isBefore(moment());
    return (
      <tr class="ir-table-row" key={rowKey}>
        <td class="sticky-column">
          <ir-booking-number-cell channelBookingNumber={booking.channel_booking_nbr} bookingNumber={booking.booking_nbr}></ir-booking-number-cell>
        </td>
        <td>
          <ir-booked-by-source-cell origin={booking.origin} guest={booking.guest} source={booking.source}></ir-booked-by-source-cell>
        </td>
        <td>
          <ir-guest-name-cell name={room.guest}></ir-guest-name-cell>
        </td>
        <td>
          <ir-unit-cell room={room}></ir-unit-cell>
        </td>
        <td>
          <ir-dates-cell overdueCheckin={isOverdueCheckIn} checkIn={room.from_date} checkOut={room.to_date}></ir-dates-cell>
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
          <div class="arrivals-table__actions-cell">
            {showAction ? <ir-actions-cell buttons={isOverdueCheckIn ? ['overdue_check_in'] : ['check_in']}></ir-actions-cell> : 'In-house'}
          </div>
        </td>
      </tr>
    );
  }

  render() {
    const { needsCheckInBookings, inHouseBookings } = arrivalsStore;
    return (
      <Host>
        <div class="table--container">
          <table class="table">
            <thead>
              <tr>
                <th class="sticky-column">Booking#</th>
                <th>
                  <div>
                    <p>Booked by / Source</p>
                  </div>
                </th>
                <th>Guest name</th>
                <th>Unit</th>
                <th>Dates</th>
                <th class="text-right">Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.renderSection(needsCheckInBookings, true)}
              {this.renderSection(inHouseBookings)}
              {!needsCheckInBookings.length && !inHouseBookings.length && (
                <tr>
                  <td colSpan={7} class="text-center text-muted">
                    No arrivals found for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* <div style={{ height: '30px' }}>pagination</div> */}
      </Host>
    );
  }
}
