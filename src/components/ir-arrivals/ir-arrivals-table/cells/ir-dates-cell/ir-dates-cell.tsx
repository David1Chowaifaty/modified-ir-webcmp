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
  private formatDate(date: string) {
    return moment(date, 'YYYY-MM-DD').format('DD MMM YYYY');
  }
  render() {
    return (
      <Host>
        <p>{this.formatDate(this.checkIn)}</p>
        <p>{this.formatDate(this.checkOut)}</p>
      </Host>
    );
  }
}
