import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-affiliate-form',
  styleUrl: 'ir-affiliate-form.css',
  scoped: true,
})
export class IrAffiliateForm {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
