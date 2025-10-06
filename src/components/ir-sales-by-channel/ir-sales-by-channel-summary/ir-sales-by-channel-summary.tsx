import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-sales-by-channel-summary',
  styleUrl: 'ir-sales-by-channel-summary.css',
  scoped: true,
})
export class IrSalesByChannelSummary {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
