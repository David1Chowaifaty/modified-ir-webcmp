import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-guests-management-user',
  styleUrl: 'ir-guests-management-user.css',
  scoped: true,
})
export class IrGuestsManagementUser {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
