import type { PaginationChangeEvent } from '@/components/ir-pagination/ir-pagination';
import { Booking } from '@/models/booking.dto';
import { departuresStore } from '@/stores/departures.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Host, h } from '@stencil/core';
import moment from 'moment';
export type CheckoutRoomEvent = {
  booking: Booking;
  identifier: string;
};
@Component({
  tag: 'ir-departures-table',
  styleUrls: ['ir-departures-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrDeparturesTable {
  @Event() checkoutRoom: EventEmitter<CheckoutRoomEvent>;
  @Event() requestPageChange: EventEmitter<PaginationChangeEvent>;
  @Event() requestPageSizeChange: EventEmitter<PaginationChangeEvent>;

  private renderSection({ bookings, showAction = false, isFuture = false }: { bookings: Booking[]; showAction?: boolean; isFuture?: boolean }) {
    if (!bookings?.length) {
      return null;
    }

    const rows = bookings.flatMap(booking => this.renderBookingRows({ booking, showAction, isFuture }));
    return [...rows];
  }

  private renderBookingRows({ booking, isFuture, showAction }: { booking: Booking; showAction?: boolean; isFuture?: boolean }) {
    return (booking.rooms ?? []).map((room, index) => this.renderRow(booking, room, index, showAction, isFuture));
  }

  private renderRow(booking: Booking, room: Booking['rooms'][number], index: number, showAction: boolean, isFuture) {
    const rowKey = `${booking.booking_nbr}-${room?.identifier ?? index}`;
    const isOverdueCheckout = moment(room.to_date, 'YYYY-MM-DD').startOf('day').isBefore(moment().startOf('day'));
    return (
      <tr class="ir-table-row" key={rowKey}>
        <td class="sticky-column">
          <ir-booking-number-cell
            origin={booking.origin}
            channelBookingNumber={booking.channel_booking_nbr}
            source={booking.source}
            bookingNumber={booking.booking_nbr}
          ></ir-booking-number-cell>
        </td>
        <td>
          <ir-booked-by-cell guest={booking.guest}></ir-booked-by-cell>
        </td>
        <td>
          <ir-guest-name-cell name={room.guest}></ir-guest-name-cell>
        </td>
        <td>
          <ir-unit-cell room={room}></ir-unit-cell>
        </td>
        <td>
          <ir-dates-cell overdueCheckout={isOverdueCheckout} checkIn={room.from_date} checkOut={room.to_date}></ir-dates-cell>
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
          <div class="departures-table__actions-cell">
            {showAction ? (
              <ir-actions-cell
                onIrAction={e => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  this.checkoutRoom.emit({
                    booking: booking,
                    identifier: room.identifier,
                  });
                }}
                buttons={isOverdueCheckout ? ['overdue_check_out'] : ['check_out']}
              ></ir-actions-cell>
            ) : isFuture ? (
              ''
            ) : (
              'In-house'
            )}
          </div>
        </td>
      </tr>
    );
  }

  private handlePageChange(event: CustomEvent<PaginationChangeEvent>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.requestPageChange.emit(event.detail);
  }

  private handlePageSizeChange(event: CustomEvent<PaginationChangeEvent>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.requestPageSizeChange.emit(event.detail);
  }

  render() {
    const { needsCheckOutBookings, futureRooms, outBookings, pagination } = departuresStore;
    return (
      <Host>
        <div class="table--container">
          <table class="table data-table">
            <thead>
              <tr>
                <th>
                  <span class={'departures-table__departure__cell'}>Booking#</span>
                </th>
                <th>
                  <div>
                    <p>Booked by</p>
                  </div>
                </th>
                <th>Guest name</th>
                <th>Unit</th>
                <th>Dates</th>
                <th class="text-center">Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.renderSection({ bookings: futureRooms, isFuture: true })}
              {this.renderSection({ bookings: needsCheckOutBookings, showAction: true })}
              {this.renderSection({ bookings: outBookings })}
              {!needsCheckOutBookings.length && !outBookings.length && (
                <tr>
                  <td colSpan={7} class="empty-row">
                    <ir-empty-state></ir-empty-state>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {(needsCheckOutBookings.length > 0 || outBookings.length > 0 || futureRooms.length > 0) && (
          <ir-pagination
            class="data-table--pagination"
            showing={pagination.showing}
            total={pagination.total}
            pages={pagination.totalPages}
            pageSize={pagination.pageSize}
            currentPage={pagination.currentPage}
            allowPageSizeChange={false}
            pageSizes={[pagination.pageSize]}
            recordLabel={locales.entries?.Lcz_Bookings ?? 'Bookings'}
            onPageChange={event => this.handlePageChange(event as CustomEvent<PaginationChangeEvent>)}
            onPageSizeChange={event => this.handlePageSizeChange(event as CustomEvent<PaginationChangeEvent>)}
          ></ir-pagination>
        )}
      </Host>
    );
  }
}
