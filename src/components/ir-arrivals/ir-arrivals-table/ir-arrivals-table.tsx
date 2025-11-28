import { Component, Host, h } from '@stencil/core';
import { data } from '../_data';

@Component({
  tag: 'ir-arrivals-table',
  styleUrls: ['ir-arrivals-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrArrivalsTable {
  render() {
    return (
      <Host>
        <table class="table">
          <thead>
            <tr>
              <th>Booking#</th>
              <th>
                <div>
                  <p>Booked by/ </p>
                  <p>Source</p>
                </div>
              </th>
              <th>Guest name</th>
              <th>Unit</th>
              <th>Dates</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data as any).map(d => (
              <tr class="ir-table-row">
                <td>
                  <ir-booking-number-cell channelBookingNumber={d.channel_booking_nbr} bookingNumber={d.booking_nbr}></ir-booking-number-cell>
                </td>
                <td>
                  <ir-booked-by-source-cell origin={d.origin} guest={d.guest} source={d.source}></ir-booked-by-source-cell>
                </td>
                <td>
                  <ir-guest-name-cell name={d.rooms[0].guest}></ir-guest-name-cell>
                </td>
                <td>
                  <ir-unit-cell unit={d.rooms[0].unit}></ir-unit-cell>
                </td>
                <td>
                  <ir-dates-cell checkIn={d.rooms[0].from_date} checkOut={d.rooms[0].to_date}></ir-dates-cell>
                </td>
                <td>
                  <ir-balance-cell amount={d.financial.gross_total}></ir-balance-cell>
                </td>
                <td>
                  <ir-actions-cell></ir-actions-cell>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Host>
    );
  }
}
