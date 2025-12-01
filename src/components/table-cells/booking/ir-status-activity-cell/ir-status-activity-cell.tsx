import { Booking, OTAManipulations } from '@/models/booking.dto';
import WaBadge from '@awesome.me/webawesome/dist/components/badge/badge';
import { Component, Fragment, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-status-activity-cell',
  styleUrl: 'ir-status-activity-cell.css',
  scoped: true,
})
export class IrStatusActivityCell {
  @Prop() isRequestToCancel: boolean;
  @Prop() status: Booking['status'];
  @Prop() showModifiedBadge: boolean;
  @Prop() showManipulationBadge: boolean;
  @Prop() lastManipulation: OTAManipulations;
  @Prop() bookingNumber: string;

  private badgeVariant: Record<string, WaBadge['variant']> = {
    '001': 'warning',
    '002': 'success',
    '003': 'danger',
    '004': 'danger',
  };

  render() {
    return (
      <Host>
        <wa-badge style={{ padding: '0.375em 0.625em' }} variant={this.badgeVariant[this.isRequestToCancel ? '003' : this.status.code]}>
          {this.status.description}
        </wa-badge>
        {this.showModifiedBadge && <p class="status-activity__modified">Modified</p>}
        {this.showManipulationBadge && (
          <Fragment>
            <wa-tooltip
              for={`manipulation_badge_${this.bookingNumber}`}
            >{`Modified by ${this.lastManipulation.user} at ${this.lastManipulation.date} ${this.lastManipulation.hour}:${this.lastManipulation.minute}`}</wa-tooltip>
            <p class="status-activity__manipulation" id={`manipulation_badge_${this.bookingNumber}`}>
              Modified
            </p>
          </Fragment>
        )}
      </Host>
    );
  }
}
