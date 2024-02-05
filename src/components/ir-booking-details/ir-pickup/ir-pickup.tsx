import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-pickup',
  styleUrl: 'ir-pickup.css',
  shadow: true,
})
export class IrPickup {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
