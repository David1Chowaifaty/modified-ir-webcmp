import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-marketplace',
  styleUrls: ['ir-marketplace.css', '../../../common/table.css'],
  scoped: true,
})
export class IrMarketplace {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
