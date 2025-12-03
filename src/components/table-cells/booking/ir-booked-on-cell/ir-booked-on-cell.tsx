import { _formatTime } from '@/components/ir-booking-details/functions';
import { Booking } from '@/models/booking.dto';
import { Component, Host, Prop, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-booked-on-cell',
  styleUrl: 'ir-booked-on-cell.css',
  scoped: true,
})
export class IrBookedOnCell {
  @Prop({ reflect: true }) display: 'inline' | 'block' = 'block';
  @Prop() bookedOn: Booking['booked_on'];
  @Prop() label: string;
  render() {
    const { date, hour, minute } = this.bookedOn;
    return (
      <Host>
        {this.label && <p class="cell-label">{this.label}:</p>}
        <p class="booked-on-cell__date">{moment(date, 'YYYY-MM-DD').format('DD MMM YYYY')}</p>
        <p class="booked-on-cell__time">{_formatTime(hour.toString(), minute.toString())}</p>
      </Host>
    );
  }
}
