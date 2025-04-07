import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-guests-management-table',
  styleUrl: 'ir-guests-management-table.css',
  scoped: true,
})
export class IrGuestsManagementTable {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
