import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-departures',
  styleUrls: ['ir-departures.css', '../../global/app.css'],
  scoped: true,
})
export class IrDepartures {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
