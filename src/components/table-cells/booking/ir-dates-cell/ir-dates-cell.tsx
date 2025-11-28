import { Component, Host, Prop, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-dates-cell',
  styleUrl: 'ir-dates-cell.css',
  scoped: true,
})
export class IrDatesCell {
  @Prop() checkIn: string;
  @Prop() checkOut: string;
  @Prop() overdueCheckin: boolean;
  @Prop() overdueCheckout: boolean;
  private formatDate(date: string) {
    return moment(date, 'YYYY-MM-DD').format('DD MMM YYYY');
  }
  render() {
    return (
      <Host>
        <p style={{ fontWeight: this.overdueCheckin ? 'bold' : 'auto' }}>{this.formatDate(this.checkIn)}</p>
        <p style={{ fontWeight: this.overdueCheckout ? 'bold' : 'auto' }}>{this.formatDate(this.checkOut)}</p>
      </Host>
    );
  }
}
