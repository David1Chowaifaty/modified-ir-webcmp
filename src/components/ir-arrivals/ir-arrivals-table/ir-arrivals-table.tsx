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
              {(data as any).map(d => (
                <tr class="ir-table-row">
                  <td class="sticky-column">
                    <ir-booking-number-cell channelBookingNumber={d.channel_booking_nbr} bookingNumber={d.booking_nbr}></ir-booking-number-cell>
                  </td>
                  <td>
                    <ir-booked-by-source-cell origin={d.origin} guest={d.guest} source={d.source}></ir-booked-by-source-cell>
                  </td>
                  <td>
                    <ir-guest-name-cell name={d.rooms[0].guest}></ir-guest-name-cell>
                  </td>
                  <td>
                    <ir-unit-cell room={d.rooms[0]}></ir-unit-cell>
                  </td>
                  <td>
                    <ir-dates-cell overdue-checkin checkIn={d.rooms[0].from_date} checkOut={d.rooms[0].to_date}></ir-dates-cell>
                  </td>
                  <td class="text-right">
                    <ir-balance-cell amount={d.financial.gross_total}></ir-balance-cell>
                  </td>
                  <td>
                    <div style={{ minWidth: '120px' }}>
                      {/* <ir-actions-cell></ir-actions-cell> */}
                      <ir-custom-button variant="neutral">Overdue check in</ir-custom-button>
                    </div>
                  </td>
                </tr>
              ))}
              {/* <tr>
                <th colSpan={7}>In-house</th>
              </tr> */}
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
                    <ir-unit-cell room={d.rooms[0]}></ir-unit-cell>
                  </td>
                  <td>
                    <ir-dates-cell checkIn={d.rooms[0].from_date} checkOut={d.rooms[0].to_date}></ir-dates-cell>
                  </td>
                  <td class="text-right">
                    <ir-balance-cell amount={d.financial.gross_total}></ir-balance-cell>
                  </td>
                  <td>In house</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* <div style={{ height: '30px' }}>pagination</div> */}
      </Host>
    );
  }
}
