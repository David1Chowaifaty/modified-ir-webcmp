import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-sales-by-channel-table',
  styleUrl: 'ir-sales-by-channel-table.css',
  scoped: true,
})
export class IrSalesByChannelTable {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
