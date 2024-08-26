import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-option-details',
  styleUrl: 'ir-option-details.css',
  shadow: true,
})
export class IrOptionDetails {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
