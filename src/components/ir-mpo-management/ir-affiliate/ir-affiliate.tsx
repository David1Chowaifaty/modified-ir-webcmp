import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-affiliate',
  styleUrl: 'ir-affiliate.css',
  scoped: true,
})
export class IrAffiliate {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
