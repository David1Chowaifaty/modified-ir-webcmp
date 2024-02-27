import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-booking-listing',
  styleUrl: 'ir-booking-listing.css',
  shadow: true,
})
export class IrBookingListing {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
