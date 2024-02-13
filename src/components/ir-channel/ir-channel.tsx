import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-channel',
  styleUrl: 'ir-channel.css',
  scoped: true,
})
export class IrChannel {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
