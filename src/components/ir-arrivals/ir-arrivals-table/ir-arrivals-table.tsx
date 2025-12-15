import { IrActionButton } from '@/components/table-cells/booking/ir-actions-cell/ir-actions-cell';
import type { PaginationChangeEvent } from '@/components/ir-pagination/ir-pagination';
import { Booking, IUnit } from '@/models/booking.dto';
import { arrivalsStore } from '@/stores/arrivals.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Host, State, h } from '@stencil/core';
import moment from 'moment';
import { RoomGuestsPayload } from '@/components/ir-booking-details/types';

@Component({
  tag: 'ir-arrivals-table',
  styleUrls: ['ir-arrivals-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrArrivalsTable {
  @State() selectedBooking: Booking;

  @Event() requestPageChange: EventEmitter<PaginationChangeEvent>;
  @Event() requestPageSizeChange: EventEmitter<PaginationChangeEvent>;
  @Event() checkInRoom: EventEmitter<RoomGuestsPayload>;

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
  private compareGuests(booking: Booking, room: Booking['rooms'][number]): boolean {
    const roomGuest = room?.guest;
    const bookingGuest = booking?.guest;

    if (!roomGuest || !bookingGuest) {
      return false;
    }

    const normalize = (value?: string) => value?.trim().toLowerCase() ?? '';

    return normalize(roomGuest.first_name) === normalize(bookingGuest.first_name) && normalize(roomGuest.last_name) === normalize(bookingGuest.last_name);
  }
  private async handleActionsClicked(e: CustomEvent<{ action: IrActionButton }>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    switch (e.detail.action) {
      case 'check_in':
      case 'overdue_check_in':
        const room = this.selectedBooking.rooms[0];
        const { adult_nbr, children_nbr, infant_nbr } = room.occupancy;
        this.checkInRoom.emit({
          identifier: room.identifier,
          sharing_persons: room.sharing_persons,
          booking_nbr: this.selectedBooking.booking_nbr,
          checkin: true,
          roomName: (room.unit as IUnit)?.name,
          totalGuests: adult_nbr + children_nbr + infant_nbr,
        });
        return;
      default:
        console.warn(e.detail.action + ' not handled');
    }
  }
  private renderRow(booking: Booking, room: Booking['rooms'][number], index: number, showAction: boolean) {
    const rowKey = `${booking.booking_nbr}-${room?.identifier ?? index}`;
    const isOverdueCheckIn = moment(room.from_date, 'YYYY-MM-DD').startOf('day').isBefore(moment().startOf('day'), 'dates');
    return (
      <tr class="ir-table-row" key={rowKey}>
        <td class="sticky-column">
          <ir-booking-number-cell
            source={booking.source}
            origin={booking.origin}
            channelBookingNumber={booking.channel_booking_nbr}
            bookingNumber={booking.booking_nbr}
          ></ir-booking-number-cell>
        </td>
        <td>
          <ir-booked-by-cell guest={booking.guest}></ir-booked-by-cell>

          {!this.compareGuests(booking, room) && <ir-guest-name-cell name={room.guest}></ir-guest-name-cell>}
        </td>
        {/* <td>
        </td> */}
        <td>
          <ir-unit-cell room={room}></ir-unit-cell>
        </td>
        <td>
          <ir-dates-cell overdueCheckin={isOverdueCheckIn} checkIn={room.from_date} checkOut={room.to_date}></ir-dates-cell>
        </td>
        <td class="text-center">
          <ir-balance-cell
            bookingNumber={booking.booking_nbr}
            isDirect={booking.is_direct}
            statusCode={booking.status.code}
            currencySymbol={booking.currency.symbol}
            financial={booking.financial}
            removeBalance
          ></ir-balance-cell>
        </td>
        <td>
          <div class="arrivals-table__actions-cell">
            {showAction ? (
              <ir-actions-cell
                buttons={isOverdueCheckIn ? ['overdue_check_in'] : ['check_in']}
                onIrAction={e => {
                  this.selectedBooking = booking;
                  this.handleActionsClicked(e);
                }}
              ></ir-actions-cell>
            ) : room.in_out.code === '001' ? (
              'In-house'
            ) : (
              ''
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
    const { needsCheckInBookings, inHouseBookings, futureBookings, pagination } = arrivalsStore;
    return (
      <Host>
        <div class="table--container">
          <table class="table data-table">
            <thead>
              <tr>
                <th>
                  <span class={'arrivals-table__departure__cell'}>Booking#</span>
                </th>
                <th>
                  <div>
                    <p>Booked by /</p>
                    <p>Guest name</p>
                  </div>
                </th>
                {/* <th></th> */}
                <th>Unit</th>
                <th>Dates</th>
                <th class="text-center">Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.renderSection(futureBookings)}
              {this.renderSection(needsCheckInBookings, true)}
              {this.renderSection(inHouseBookings)}
              {!needsCheckInBookings.length && !inHouseBookings.length && (
                <tr>
                  <td colSpan={6} class="empty-row">
                    No arrivals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
      </Host>
    );
  }
}
