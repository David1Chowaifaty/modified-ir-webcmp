import { IrActionButton } from '@/components/table-cells/booking/ir-actions-cell/ir-actions-cell';
import { Booking, Occupancy } from '@/models/booking.dto';
import booking_listing from '@/stores/booking_listing.store';
import locales from '@/stores/locales.store';
import { getPrivateNote } from '@/utils/booking';
import { Component, Event, EventEmitter, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-booking-listing-table',
  styleUrls: ['ir-booking-listing-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrBookingListingTable {
  @Event() openBookingDetails: EventEmitter<string>;

  private calculateTotalPersons(booking: Booking) {
    const sumOfOccupancy = ({ adult_nbr, children_nbr, infant_nbr }: Occupancy) => {
      return (adult_nbr ?? 0) + (children_nbr ?? 0) + (infant_nbr ?? 0);
    };
    return booking.rooms.reduce((prev, cur) => {
      return sumOfOccupancy(cur.occupancy) + prev;
    }, 0);
  }
  private handleIrActions({ action, booking }: { action: IrActionButton; booking: Booking }) {
    if (action === 'edit') {
      this.openBookingDetails.emit(booking.booking_nbr);
    }
  }
  private renderRow(booking: Booking) {
    const rowKey = `${booking.booking_nbr}`;
    const totalPersons = this.calculateTotalPersons(booking);
    const lastManipulation = booking.ota_manipulations ? booking.ota_manipulations[booking.ota_manipulations.length - 1] : null;

    return (
      <tr class="ir-table-row" key={rowKey}>
        <td>
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
            <ir-actions-cell
              onIrAction={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.handleIrActions({ action: e.detail.action, booking });
              }}
              buttons={['edit', 'delete']}
            ></ir-actions-cell>
          </div>
        </td>
      </tr>
    );
  }
  render() {
    return (
      <Host>
        <div class="table--container">
          <table class="table data-table">
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
              {booking_listing.bookings.length === 0 && (
                <tr>
                  <td colSpan={8} class="empty-row">
                    No bookings found
                  </td>
                </tr>
              )}
              {booking_listing.bookings?.map(booking => this.renderRow(booking))}
            </tbody>
          </table>
        </div>
        <ir-pagination
          showing={{
            from: 1,
            to: 10,
          }}
          class="data-table--pagination"
          total={10}
          pages={10}
          pageSize={10}
          currentPage={1}
          pageSizes={[10]}
          onPageChange={e => {}}
          onPageSizeChange={e => {}}
          showTotalRecords={true}
          recordLabel="bookings"
        ></ir-pagination>
      </Host>
    );
  }
}
