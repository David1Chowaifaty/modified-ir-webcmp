import { Booking, OTAManipulations } from '@/models/booking.dto';
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

  render() {
    return (
      <Host>
        <ir-booking-status-tag status={this.status} isRequestToCancel={this.isRequestToCancel}></ir-booking-status-tag>
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
