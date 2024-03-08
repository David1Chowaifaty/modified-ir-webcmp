import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-room-rateplan-manager',
  styleUrl: 'ir-room-rateplan-manager.css',
  scoped: true,
})
export class IrRoomRateplanManager {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
