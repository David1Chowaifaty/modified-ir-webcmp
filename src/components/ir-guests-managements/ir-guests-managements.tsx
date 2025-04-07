import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-guests-managements',
  styleUrl: 'ir-guests-managements.css',
  scoped: true,
})
export class IrGuestsManagements {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
