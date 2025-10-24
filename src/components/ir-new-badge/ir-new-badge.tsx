import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-new-badge',
  styleUrl: 'ir-new-badge.css',
  shadow: true,
})
export class IrNewBadge {
  render() {
    return (
      <Host>
        <span class="new-badge">new</span>
      </Host>
    );
  }
}
