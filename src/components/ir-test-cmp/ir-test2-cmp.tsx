import { Component, Host, h } from '@stencil/core';
import { booking } from './_data';

@Component({
  tag: 'ir-test2-cmp',
  styleUrl: 'ir-test-cmp.css',
  scoped: true,
})
export class IrTest2Cmp {
  render() {
    return (
      <Host style={{ background: 'white' }}>
        <ir-booking-billing-recipient booking={booking as any}></ir-booking-billing-recipient>
      </Host>
    );
  }
}
