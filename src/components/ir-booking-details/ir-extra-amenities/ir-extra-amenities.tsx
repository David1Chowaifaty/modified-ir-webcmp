import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-extra-amenities',
  styleUrl: 'ir-extra-amenities.css',
  shadow: true,
})
export class IrExtraAmenities {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
