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
        <ir-range-picker onDateRangeChanged={e => (this.dates = e.detail)} fromDate={this.dates?.fromDate} toDate={this.dates?.toDate}></ir-range-picker>
      </Host>
    );
  }
}
