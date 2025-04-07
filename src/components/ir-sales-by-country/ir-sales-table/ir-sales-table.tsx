import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-sales-table',
  styleUrl: 'ir-sales-table.css',
  scoped: true,
})
export class IrSalesTable {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
