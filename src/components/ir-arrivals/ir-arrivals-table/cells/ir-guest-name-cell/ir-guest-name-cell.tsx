import { Guest } from '@/models/booking.dto';
import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-guest-name-cell',
  styleUrl: 'ir-guest-name-cell.css',
  scoped: true,
})
export class IrGuestNameCell {
  @Prop() name: Guest;
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
