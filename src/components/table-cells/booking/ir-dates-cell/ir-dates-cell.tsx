import { Component, Host, Prop, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-dates-cell',
  styleUrl: 'ir-dates-cell.css',
  scoped: true,
})
export class IrDatesCell {
  @Prop({ reflect: true }) display: 'block' | 'inline' = 'block';
  @Prop() checkIn: string;
  @Prop() checkOut: string;
  @Prop() checkInLabel: string;
  @Prop() checkoutLabel: string;
  @Prop() overdueCheckin: boolean;
  @Prop() overdueCheckout: boolean;
  private formatDate(date: string) {
    return moment(date, 'YYYY-MM-DD').format('DD MMM YYYY');
  }
  render() {
    return (
      <Host>
        <div class="date-cell__container">
          {this.checkInLabel && <span class="date-cell__label">{this.checkInLabel}: </span>}
          <p style={{ fontWeight: this.overdueCheckin ? 'bold' : 'auto' }}>{this.formatDate(this.checkIn)}</p>
        </div>
        <div class="date-cell__container">
          {this.checkoutLabel && <span class="date-cell__label">{this.checkoutLabel}: </span>}
          <p style={{ fontWeight: this.overdueCheckout ? 'bold' : 'auto' }}>{this.formatDate(this.checkOut)}</p>
        </div>
      </Host>
    );
  }
}
