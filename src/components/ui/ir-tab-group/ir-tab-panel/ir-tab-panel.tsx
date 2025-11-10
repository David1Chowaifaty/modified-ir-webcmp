import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-tab-panel',
  styleUrl: 'ir-tab-panel.css',
  shadow: true,
})
export class IrTabPanel {
  render() {
    return (
      <Host role="tabpanel" tabindex="0">
        <slot></slot>
      </Host>
    );
  }
}
