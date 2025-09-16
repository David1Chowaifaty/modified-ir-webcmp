import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-financial-actions',
  styleUrl: 'ir-financial-actions.css',
  scoped: true,
})
export class IrFinancialActions {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
