import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-date-range',
  styleUrl: 'ir-date-range.css',
  shadow: true,
})
export class IrDateRange {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
