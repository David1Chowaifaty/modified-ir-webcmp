import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-financial-table',
  styleUrl: 'ir-financial-table.css',
  scoped: true,
})
export class IrFinancialTable {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
