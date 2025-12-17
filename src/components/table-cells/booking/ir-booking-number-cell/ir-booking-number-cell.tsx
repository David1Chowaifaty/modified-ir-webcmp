import { Booking } from '@/models/booking.dto';
import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-booking-number-cell',
  styleUrl: 'ir-booking-number-cell.css',
  scoped: true,
})
export class IrBookingNumberCell {
  @Prop() bookingNumber: Booking['booking_nbr'];
  /**
   * Source of the booking (e.g. website, channel).
   */
  @Prop() source: Booking['source'];
  /**
   * Origin metadata containing label + icon used as logo.
   */
  @Prop() origin: Booking['origin'];

  @Prop() channelBookingNumber: Booking['channel_booking_nbr'];

  @Event({ bubbles: true, composed: true }) openBookingDetails: EventEmitter<Booking['booking_nbr']>;

  render() {
    return (
      <Host>
        {this.channelBookingNumber && <wa-tooltip for={`source-logo__${this.bookingNumber}`}>{this.origin.Label}</wa-tooltip>}
        <img class="booked-by-source__logo" id={`source-logo__${this.bookingNumber}`} src={this.origin.Icon} alt={this.origin.Label} />
        <div class="booking-nbr-cell__container">
          <div style={{ width: 'fit-content' }}>
            <ir-custom-button size="medium" onClickHandler={() => this.openBookingDetails.emit(this.bookingNumber)} link variant="brand" appearance="plain">
              {this.bookingNumber}
            </ir-custom-button>
          </div>
          <p class="booking-nbr-cell__channel_nbr">{this.channelBookingNumber ? this.channelBookingNumber : this.origin.Label}</p>
        </div>
      </Host>
    );
  }
}
