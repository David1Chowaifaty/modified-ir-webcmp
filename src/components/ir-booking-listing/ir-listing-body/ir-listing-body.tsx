import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-listing-body',
  styleUrl: 'ir-listing-body.css',
  shadow: true,
})
export class IrListingBody {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
