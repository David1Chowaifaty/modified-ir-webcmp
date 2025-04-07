import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-sales-filters',
  styleUrl: 'ir-sales-filters.css',
  scoped: true,
})
export class IrSalesFilters {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
