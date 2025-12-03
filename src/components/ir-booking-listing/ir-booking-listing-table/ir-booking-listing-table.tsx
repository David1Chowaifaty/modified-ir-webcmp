import { IrActionButton } from '@/components/table-cells/booking/ir-actions-cell/ir-actions-cell';
import { Booking, Occupancy } from '@/models/booking.dto';
import booking_listing from '@/stores/booking_listing.store';
import locales from '@/stores/locales.store';
import { getPrivateNote } from '@/utils/booking';
import type { PaginationChangeEvent } from '@/components/ir-pagination/ir-pagination';
import { Component, Event, EventEmitter, Host, State, h } from '@stencil/core';
import { BookingListingService } from '@/services/booking_listing.service';

@Component({
  tag: 'ir-booking-listing-table',
  styleUrls: ['ir-booking-listing-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrBookingListingTable {
  @State() booking_nbr: string;
  @State() isLoading: boolean;

  @Event() openBookingDetails: EventEmitter<string>;
  @Event() requestPageChange: EventEmitter<PaginationChangeEvent>;
  @Event() requestPageSizeChange: EventEmitter<PaginationChangeEvent>;

  private bookingListingsService = new BookingListingService();

  private async deleteBooking() {
    if (!this.booking_nbr) {
      return;
    }
    try {
      this.isLoading = true;
      await this.bookingListingsService.removeExposedBooking(this.booking_nbr, true);
    } catch (error) {
    } finally {
      this.isLoading = false;
    }
  }

  private calculateTotalPersons(booking: Booking) {
    const sumOfOccupancy = ({ adult_nbr, children_nbr, infant_nbr }: Occupancy) => {
      return (adult_nbr ?? 0) + (children_nbr ?? 0) + (infant_nbr ?? 0);
    };
    return booking.rooms.reduce((prev, cur) => {
      return sumOfOccupancy(cur.occupancy) + prev;
    }, 0);
  }
  private handleIrActions({ action, booking }: { action: IrActionButton; booking: Booking }) {
    switch (action) {
      case 'edit':
        this.openBookingDetails.emit(booking.booking_nbr);
        break;
      case 'delete':
        this.booking_nbr = booking.booking_nbr;
        break;
      default:
        console.warn(`${action} not handled`);
    }
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
  private renderRow(booking: Booking) {
    const rowKey = `${booking.booking_nbr}`;
    const totalPersons = this.calculateTotalPersons(booking);
    const lastManipulation = booking.ota_manipulations ? booking.ota_manipulations[booking.ota_manipulations.length - 1] : null;

    return (
      <tr class="ir-table-row" key={rowKey}>
        <td>
          <ir-booking-number-cell
            origin={booking.origin}
            source={booking.source}
            channelBookingNumber={booking.channel_booking_nbr}
            bookingNumber={booking.booking_nbr}
          ></ir-booking-number-cell>
        </td>
        <td>
          <ir-booked-on-cell bookedOn={booking.booked_on}></ir-booked-on-cell>
        </td>
        <td class="text-center">
          <ir-booked-by-cell
            class="text-center"
            clickableGuest
            showRepeatGuestBadge={booking.guest.nbr_confirmed_bookings > 1 && !booking.agent}
            guest={booking.guest}
            identifier={booking.booking_nbr}
            showPersons
            showPrivateNoteDot={getPrivateNote(booking.extras)}
            totalPersons={totalPersons?.toString()}
            showPromoIcon={!!booking.promo_key}
            promoKey={booking.promo_key}
            showLoyaltyIcon={booking.is_in_loyalty_mode && !booking.promo_key}
          ></ir-booked-by-cell>
        </td>
        <td>
          <ir-dates-cell checkIn={booking.from_date} checkOut={booking.to_date}></ir-dates-cell>
        </td>
        <td>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {booking.rooms.map(room => (
              <ir-unit-cell key={room.identifier} room={room}></ir-unit-cell>
            ))}
            {booking.extra_services && <p style={{ fontSize: '0.93rem' }}>{locales.entries.Lcz_ExtraServices}</p>}
          </div>
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
    const pagination = booking_listing.pagination;
    return (
      <Host>
        <div class="table--container">
          <table class="table data-table">
            <thead>
              <tr>
                <th>
                  <span class={'arrivals-table__departure__cell'}>Booking#</span>
                </th>
                <th>Booked on</th>
                <th>
                  <div>
                    <p>Booked by</p>
                  </div>
                </th>
                <th>Dates</th>
                <th>Services</th>
                <th class="text-center">
                  <p>Amount </p>
                  <wa-tooltip for="balance-info">Booking balance click to settle.</wa-tooltip>
                  <div style={{ width: 'fit-content', marginLeft: 'auto', marginRight: 'auto' }}>
                    <ir-custom-button
                      id="balance-info"
                      style={{ '--ir-c-btn-height': 'fit-content', '--ir-c-btn-padding': '0.25rem', '--ir-c-btn-font-size': '0.725rem' }}
                      size="small"
                      variant="danger"
                      appearance="outlined"
                    >
                      Balance
                    </ir-custom-button>
                  </div>
                </th>
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
        <div class="card--container">
          {booking_listing.bookings.map(booking => {
            const rowKey = `mobile--${booking.booking_nbr}`;
            const totalPersons = this.calculateTotalPersons(booking);
            const lastManipulation = booking.ota_manipulations ? booking.ota_manipulations[booking.ota_manipulations.length - 1] : null;
            return (
              <wa-card key={rowKey}>
                <div slot="header" class="d-flex align-items-center justify-content-between">
                  <ir-booking-number-cell
                    origin={booking.origin}
                    source={booking.source}
                    channelBookingNumber={booking.channel_booking_nbr}
                    bookingNumber={booking.booking_nbr}
                  ></ir-booking-number-cell>
                  <ir-status-activity-cell
                    lastManipulation={lastManipulation}
                    showManipulationBadge={!!lastManipulation}
                    showModifiedBadge={!lastManipulation && booking.events?.length > 0 && booking.events[0].type.toLowerCase() === 'modified'}
                    status={booking.status}
                    isRequestToCancel={booking.is_requested_to_cancel}
                    bookingNumber={booking.booking_nbr}
                  ></ir-status-activity-cell>
                </div>
                <div class="d-flex flex-column" style={{ gap: '0.5rem' }}>
                  <ir-booked-by-cell
                    display="inline"
                    class="text-center"
                    label="Booked by"
                    clickableGuest
                    showRepeatGuestBadge={booking.guest.nbr_confirmed_bookings > 1 && !booking.agent}
                    guest={booking.guest}
                    identifier={`mobile-${booking.booking_nbr}`}
                    showPersons
                    showPrivateNoteDot={getPrivateNote(booking.extras)}
                    totalPersons={totalPersons?.toString()}
                    showPromoIcon={!!booking.promo_key}
                    promoKey={booking.promo_key}
                    showLoyaltyIcon={booking.is_in_loyalty_mode && !booking.promo_key}
                  ></ir-booked-by-cell>

                  <ir-booked-on-cell display="inline" label="Booked on" bookedOn={booking.booked_on}></ir-booked-on-cell>

                  <div>
                    <div class="d-flex align-items-center">
                      <ir-dates-cell display="inline" checkInLabel="Check-in" checkoutLabel="Check-out" checkIn={booking.from_date} checkOut={booking.to_date}></ir-dates-cell>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {booking.rooms.map((room, idx) => (
                      <div class="d-flex">
                        <ir-unit-cell key={room.identifier} room={room}></ir-unit-cell>
                        {idx < booking.rooms.length - 1 && <span>, </span>}
                      </div>
                    ))}
                    {booking.extra_services && <p style={{ fontSize: '0.93rem' }}>{locales.entries.Lcz_ExtraServices}</p>}
                  </div>
                  <ir-balance-cell
                    display="inline"
                    label="Amount"
                    bookingNumber={booking.booking_nbr}
                    isDirect={booking.is_direct}
                    statusCode={booking.status.code}
                    currencySymbol={booking.currency.symbol}
                    financial={booking.financial}
                  ></ir-balance-cell>
                </div>
                <div slot="footer" class="d-flex" style={{ gap: '0.5rem' }}>
                  <ir-custom-button
                    onClickHandler={() => {
                      this.handleIrActions({ action: 'edit', booking });
                    }}
                    style={{ flex: '1 1 0%' }}
                    appearance="outlined"
                  >
                    Edit
                  </ir-custom-button>
                  <ir-custom-button
                    onClickHandler={() => {
                      this.handleIrActions({ action: 'delete', booking });
                    }}
                    style={{ flex: '1 1 0%' }}
                    variant="danger"
                  >
                    Delete
                  </ir-custom-button>
                </div>
              </wa-card>
            );
          })}
        </div>
        {pagination.totalRecords > 0 && (
          <ir-pagination
            class="data-table--pagination"
            showing={pagination.showing}
            total={pagination.totalRecords}
            pages={pagination.totalPages}
            pageSize={pagination.pageSize}
            currentPage={pagination.currentPage}
            allowPageSizeChange={false}
            pageSizes={[pagination.pageSize]}
            recordLabel={locales.entries?.Lcz_Bookings ?? 'bookings'}
            onPageChange={event => this.handlePageChange(event as CustomEvent<PaginationChangeEvent>)}
            onPageSizeChange={event => this.handlePageSizeChange(event as CustomEvent<PaginationChangeEvent>)}
          ></ir-pagination>
        )}
        <ir-dialog
          label="Delete"
          open={!!this.booking_nbr}
          onIrDialogHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.booking_nbr = null;
          }}
          lightDismiss={false}
        >
          <span>{locales.entries.Lcz_SureYouWantToDeleteBookingNbr + this.booking_nbr}</span>
          <div slot="footer" class="ir-dialog__footer">
            <ir-custom-button
              onClickHandler={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.booking_nbr = null;
              }}
              size="medium"
              variant="neutral"
              appearance="filled"
            >
              Cancel
            </ir-custom-button>
            <ir-custom-button
              onClickHandler={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.deleteBooking();
              }}
              loading={this.isLoading}
              size="medium"
              variant="danger"
            >
              Confirm
            </ir-custom-button>
          </div>
        </ir-dialog>
      </Host>
    );
  }
}
