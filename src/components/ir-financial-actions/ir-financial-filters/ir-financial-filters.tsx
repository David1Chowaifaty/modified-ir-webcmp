import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-financial-filters',
  styleUrl: 'ir-financial-filters.css',
  scoped: true,
})
export class IrFinancialFilters {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
