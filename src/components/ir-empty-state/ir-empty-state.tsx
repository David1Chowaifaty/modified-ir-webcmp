import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-empty-state',
  styleUrl: 'ir-empty-state.css',
  shadow: true,
})
export class IrEmptyState {
  @Prop() message: string = 'No records found';
  render() {
    return (
      <Host>
        <slot name="icon">
          <wa-icon name="ban" style={{ transform: 'rotate(90deg)', fontSize: '2rem' }}></wa-icon>
        </slot>
        <p part="message" class="message">
          {this.message}
        </p>
        <slot></slot>
      </Host>
    );
  }
}
