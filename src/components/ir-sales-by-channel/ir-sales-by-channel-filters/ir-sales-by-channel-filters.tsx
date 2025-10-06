import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-sales-by-channel-filters',
  styleUrl: 'ir-sales-by-channel-filters.css',
  scoped: true,
})
export class IrSalesByChannelFilters {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
