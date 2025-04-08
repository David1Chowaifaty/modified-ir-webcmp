import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-user-management-user',
  styleUrl: 'ir-user-management-user.css',
  scoped: true,
})
export class IrUserManagementUser {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
