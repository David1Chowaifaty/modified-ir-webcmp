import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-housekeeping',
  styleUrl: 'ir-housekeeping.css',
  scoped: true,
})
export class IrHousekeeping {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
