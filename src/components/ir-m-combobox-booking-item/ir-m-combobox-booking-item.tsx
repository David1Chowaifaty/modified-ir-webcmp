import { Booking } from '@/models/booking.dto';
import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-m-combobox-booking-item',
  styleUrl: 'ir-m-combobox-booking-item.css',
  scoped: true,
})
export class IrMComboboxBookingItem {
  @Prop() booking: Booking;
  render() {
    return (
      <Host class="pe-1">
        <img src={this.booking.origin.Icon} alt={this.booking.origin.Label} class="origin-icon" />
        <div>
          <p class="p-0 m-0">{this.booking.booking_nbr}</p>
          {!this.booking.is_direct && <p class="small p-0 m-0">{this.booking.channel_booking_nbr}</p>}
          {<p class="small p-0 m-0 text-muted">BDC-{this.booking.booking_nbr}</p>}
        </div>
        <p class="p-0 m-0">
          {this.booking.guest.first_name} {this.booking.guest.last_name}
        </p>
      </Host>
    );
  }
}
