import { IrActionButton } from '@/components/table-cells/booking/ir-actions-cell/ir-actions-cell';
import { Booking } from '@/models/booking.dto';
import { getPrivateNote } from '@/utils/booking';
import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-booking-listing-mobile-card',
  styleUrl: 'ir-booking-listing-mobile-card.css',
  scoped: true,
})
export class IrBookingListingMobileCard {
  @Prop() booking: Booking;
  @Prop() totalPersons?: number;
  @Prop() lastManipulation?: Booking['ota_manipulations'] extends Array<infer T> ? T : never;
  @Prop() extraServicesLabel?: string;

  @Event() irBookingCardAction: EventEmitter<{ action: IrActionButton; booking: Booking }>;

  private emitAction(action: IrActionButton) {
    if (!this.booking) {
      return;
    }
    this.irBookingCardAction.emit({ action, booking: this.booking });
  }

  private renderRooms() {
    if (!this.booking?.rooms?.length) {
      return null;
    }

    return this.booking.rooms.map((room, idx) => (
      <div class="mobile-card__room" key={room.identifier ?? idx}>
        <ir-unit-cell room={room}></ir-unit-cell>
        {idx < this.booking.rooms.length - 1 && <span class="mobile-card__room-divider">,</span>}
      </div>
    ));
  }

  render() {
    if (!this.booking) {
      return null;
    }

    const identifier = `${this.booking.booking_nbr}`;

    return (
      <wa-card>
        <div slot="header" class="mobile-card__header">
          <ir-booking-number-cell
            origin={this.booking.origin}
            source={this.booking.source}
            channelBookingNumber={this.booking.channel_booking_nbr}
            bookingNumber={this.booking.booking_nbr}
          ></ir-booking-number-cell>
          <ir-status-activity-cell
            lastManipulation={this.lastManipulation}
            showManipulationBadge={!!this.lastManipulation}
            showModifiedBadge={!this.lastManipulation && this.booking.events?.length > 0 && this.booking.events[0].type.toLowerCase() === 'modified'}
            status={this.booking.status}
            isRequestToCancel={this.booking.is_requested_to_cancel}
            bookingNumber={this.booking.booking_nbr}
          ></ir-status-activity-cell>
        </div>
        <div class="mobile-card__body">
          <ir-booked-by-cell
            display="inline"
            class="mobile-card__text-center"
            label="Booked by"
            clickableGuest
            showRepeatGuestBadge={this.booking.guest.nbr_confirmed_bookings > 1 && !this.booking.agent}
            guest={this.booking.guest}
            identifier={identifier}
            cellId={`mobile-${identifier}`}
            showPersons
            showPrivateNoteDot={getPrivateNote(this.booking.extras)}
            totalPersons={this.totalPersons?.toString()}
            showPromoIcon={!!this.booking.promo_key}
            promoKey={this.booking.promo_key}
            showLoyaltyIcon={this.booking.is_in_loyalty_mode && !this.booking.promo_key}
          ></ir-booked-by-cell>

          <div class="mobile-card__rooms">
            {this.renderRooms()}
            {this.booking.extra_services && this.extraServicesLabel && <p class="mobile-card__extra-services">{this.extraServicesLabel}</p>}
          </div>

          <ir-booked-on-cell display="inline" label="Booked on" bookedOn={this.booking.booked_on}></ir-booked-on-cell>

          <div class="mobile-card__dates">
            <ir-dates-cell display="inline" checkInLabel="Check-in" checkoutLabel="Check-out" checkIn={this.booking.from_date} checkOut={this.booking.to_date}></ir-dates-cell>
          </div>

          <ir-balance-cell
            display="inline"
            label="Amount"
            bookingNumber={this.booking.booking_nbr}
            isDirect={this.booking.is_direct}
            statusCode={this.booking.status.code}
            currencySymbol={this.booking.currency.symbol}
            financial={this.booking.financial}
          ></ir-balance-cell>
        </div>
        <div slot="footer" class="mobile-card__actions">
          <ir-custom-button class="mobile-card__action-button" onClickHandler={() => this.emitAction('edit')} appearance="outlined">
            Edit
          </ir-custom-button>
          <ir-custom-button class="mobile-card__action-button" onClickHandler={() => this.emitAction('delete')} variant="danger">
            Delete
          </ir-custom-button>
        </div>
      </wa-card>
    );
  }
}
