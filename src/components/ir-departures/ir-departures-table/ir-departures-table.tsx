import type { PaginationChangeEvent } from '@/components/ir-pagination/ir-pagination';
import { Booking } from '@/models/booking.dto';
import { departuresStore, setDeparturesPage, setDeparturesPageSize } from '@/stores/departures.store';
import locales from '@/stores/locales.store';
import { Component, Host, h } from '@stencil/core';
import moment from 'moment';
@Component({
  tag: 'ir-departures-table',
  styleUrls: ['ir-departures-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrDeparturesTable {
  private readonly pageSizes = [10, 20, 50];

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
            {showAction ? <ir-actions-cell buttons={isOverdueCheckout ? ['overdue_check_in'] : ['check_in']}></ir-actions-cell> : 'In-house'}
          </div>
        </td>
      </tr>
    );
  }

  private getPaginationShowing() {
    const { page, pageSize, total } = departuresStore.pagination;
    if (!total) {
      return { from: 0, to: 0 };
    }
    const start = (page - 1) * pageSize + 1;
    return {
      from: Math.max(start, 1),
      to: Math.min(start + pageSize - 1, total),
    };
  }

  private handlePageChange(event: CustomEvent<PaginationChangeEvent>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const nextPage = event.detail?.currentPage ?? 1;
    if (nextPage === departuresStore.pagination.page) {
      return;
    }
    setDeparturesPage(nextPage);
  }

  private handlePageSizeChange(event: CustomEvent<PaginationChangeEvent>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const nextSize = event.detail?.pageSize;
    if (!Number.isFinite(nextSize)) {
      return;
    }
    const normalizedSize = Math.floor(Number(nextSize));
    if (normalizedSize === departuresStore.pagination.pageSize) {
      return;
    }
    setDeparturesPageSize(normalizedSize);
  }

  render() {
    const { needsCheckOutBookings, outBookings, pagination } = departuresStore;
    const showing = this.getPaginationShowing();
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
                <th class="text-right">Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.renderSection(needsCheckOutBookings, true)}
              {this.renderSection(outBookings)}
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
        {needsCheckOutBookings.length > 0 && outBookings.length > 0 && (
          <ir-pagination
            class="data-table--pagination"
            showing={showing}
            total={pagination.total}
            pages={pagination.totalPages}
            pageSize={pagination.pageSize}
            currentPage={pagination.page}
            allowPageSizeChange={true}
            pageSizes={this.pageSizes}
            recordLabel={locales.entries?.Lcz_Bookings ?? 'bookings'}
            onPageChange={event => this.handlePageChange(event as CustomEvent<PaginationChangeEvent>)}
            onPageSizeChange={event => this.handlePageSizeChange(event as CustomEvent<PaginationChangeEvent>)}
          ></ir-pagination>
        )}
      </Host>
    );
  }
}
