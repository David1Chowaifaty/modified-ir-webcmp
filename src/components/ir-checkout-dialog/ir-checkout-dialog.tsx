import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-checkout-dialog',
  styleUrl: 'ir-checkout-dialog.css',
  shadow: true,
})
export class IrCheckoutDialog {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
