import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-test-cmp',
  styleUrl: 'ir-test-cmp.css',
  scoped: true,
})
export class IrTestCmp {
  render() {
    return (
      <Host class="card p-4">
        <ir-input-text label="Password"></ir-input-text>
      </Host>
    );
  }
}
