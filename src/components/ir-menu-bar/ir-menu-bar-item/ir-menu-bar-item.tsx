import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-menu-bar-item',
  styleUrl: 'ir-menu-bar-item.css',
  shadow: true,
})
export class IrMenuBarItem {
  render() {
    return (
      <Host role="menuitem" tabindex="-1" part="item">
        <slot></slot>
      </Host>
    );
  }
}
