import { IOtaNotes } from '@/models/booking.dto';
import { Component, Host, Prop, h } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ota-label',
  styleUrl: 'ota-label.css',
  scoped: true,
})
export class OtaLabel {
  @Prop() label: string;
  @Prop() remarks: IOtaNotes[];
  render() {
    if (!this.remarks) {
      return null;
    }
    return (
      <Host>
        <strong>{this.label}</strong>
        <ul>
          {this.remarks?.map(remark => (
            <li key={v4()}>- {remark.statement}</li>
          ))}
        </ul>
      </Host>
    );
  }
}
