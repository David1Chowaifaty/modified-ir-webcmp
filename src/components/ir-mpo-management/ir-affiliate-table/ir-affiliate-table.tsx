import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-affiliate-table',
  styleUrl: 'ir-affiliate-table.css',
  scoped: true,
})
export class IrAffiliateTable {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
