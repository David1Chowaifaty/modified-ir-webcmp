import { Component, Host, State, h } from '@stencil/core';
import { Moment } from 'moment';

@Component({
  tag: 'ir-test-cmp',
  styleUrl: 'ir-test-cmp.css',
  scoped: true,
})
export class IrTestCmp {
  @State() dates: { fromDate: Moment; toDate: Moment };
  render() {
    return (
      <Host class="card p-4">
        <ir-m-combobox></ir-m-combobox>
      </Host>
    );
  }
}
