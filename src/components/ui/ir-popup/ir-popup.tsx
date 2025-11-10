import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-popup',
  styleUrl: 'ir-popup.css',
  shadow: true,
})
export class IrPopup {
  render() {
    return (
      <Host>
        <slot name="trigger"></slot>
        <slot></slot>
      </Host>
    );
  }
}
