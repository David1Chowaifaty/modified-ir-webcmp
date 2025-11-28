import { Booking } from '@/models/booking.dto';
import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-booking-number-cell',
  styleUrl: 'ir-booking-number-cell.css',
  scoped: true,
})
export class IrBookingNumberCell {
  @Prop() bookingNumber: Booking['booking_nbr'];
  @Prop() channelBookingNumber: Booking['channel_booking_nbr'];
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
