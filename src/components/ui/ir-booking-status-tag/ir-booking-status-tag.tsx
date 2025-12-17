import { Booking } from '@/models/booking.dto';
import WaBadge from '@awesome.me/webawesome/dist/components/badge/badge';
import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-booking-status-tag',
  styleUrl: 'ir-booking-status-tag.css',
  scoped: true,
})
export class IrBookingStatusTag {
  @Prop() status: Booking['status'];
  @Prop() isRequestToCancel: Booking['is_requested_to_cancel'];

  private badgeVariant: Record<string, WaBadge['variant']> = {
    '001': 'warning',
    '002': 'success',
    '003': 'danger',
    '004': 'danger',
  };

  render() {
    return (
      <wa-badge style={{ padding: '0.375em 0.625em', letterSpacing: '0.03rem' }} variant={this.badgeVariant[this.isRequestToCancel ? '003' : this.status.code]}>
        {this.status.description.toUpperCase()}
      </wa-badge>
    );
  }
}
