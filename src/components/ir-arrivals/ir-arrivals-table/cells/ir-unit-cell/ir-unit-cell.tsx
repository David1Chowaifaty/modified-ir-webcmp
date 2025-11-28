import { Room } from '@/models/booking.dto';
import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-unit-cell',
  styleUrl: 'ir-unit-cell.css',
  scoped: true,
})
export class IrUnitCell {
  @Prop() unit: Room['unit'];
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
