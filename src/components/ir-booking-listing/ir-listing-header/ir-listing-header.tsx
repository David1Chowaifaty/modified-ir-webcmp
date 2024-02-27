import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-listing-header',
  styleUrl: 'ir-listing-header.css',
  shadow: true,
})
export class IrListingHeader {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
