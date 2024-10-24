import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-amenity',
  styleUrl: 'ir-amenity.css',
  shadow: true,
})
export class IrAmenity {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
