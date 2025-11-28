import { Booking } from '@/models/booking.dto';
import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-booked-by-source-cell',
  styleUrl: 'ir-booked-by-source-cell.css',
  scoped: true,
})
export class IrBookedBySourceCell {
  @Prop() guest: Booking['guest'];
  @Prop() source: Booking['source'];
  @Prop() origin: Booking['origin'];
  render() {
    console.log(this.source);
    return (
      <Host>
        <img class="booked-by-source__logo" src={this.origin.Icon} alt={this.origin.Label} />
        <div>
          <p>
            {this.guest.first_name} {this.guest.last_name}
          </p>
          <p class="booked-by-cell__description">{this.source.description}</p>
        </div>
      </Host>
    );
  }
}
