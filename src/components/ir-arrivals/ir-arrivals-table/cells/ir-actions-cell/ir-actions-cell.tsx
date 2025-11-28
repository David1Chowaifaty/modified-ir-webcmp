import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-actions-cell',
  styleUrl: 'ir-actions-cell.css',
  scoped: true,
})
export class IrActionsCell {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
