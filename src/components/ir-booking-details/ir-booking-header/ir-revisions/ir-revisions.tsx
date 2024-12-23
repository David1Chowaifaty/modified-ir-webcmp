import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-revisions',
  styleUrl: 'ir-revisions.css',
  scoped: true,
})
export class IrRevisions {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
