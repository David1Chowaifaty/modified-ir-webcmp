import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-financial-summary',
  styleUrl: 'ir-financial-summary.css',
  scoped: true,
})
export class IrFinancialSummary {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
