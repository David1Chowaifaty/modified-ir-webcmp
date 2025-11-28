import { Booking } from '@/models/booking.dto';
import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-booking-number-cell',
  styleUrl: 'ir-booking-number-cell.css',
  scoped: true,
})
export class IrBookingNumberCell {
  @Prop() bookingNumber: Booking['booking_nbr'];
  @Prop() channelBookingNumber: Booking['channel_booking_nbr'];
  @Event({ bubbles: true, composed: true }) openBookingDetails: EventEmitter<Booking['booking_nbr']>;
  render() {
    return (
      <Host>
        <slot name="start"></slot>
        <div>
          <ir-custom-button size="medium" onClickHandler={() => this.openBookingDetails.emit(this.bookingNumber)} link variant="brand" appearance="plain">
            {this.bookingNumber}
          </ir-custom-button>

          {this.channelBookingNumber && <p>{this.channelBookingNumber}</p>}
        </div>
        <slot name="end"></slot>
      </Host>
    );
  }
}
