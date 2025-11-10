import { Component, Element, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-tab',
  styleUrl: 'ir-tab.css',
  shadow: true,
})
export class IrTab {
  @Element() el: HTMLIrTabElement;

  @Prop() panel!: string;
  @Prop({ reflect: true }) disabled: boolean;
  @Prop({ reflect: true }) selected: boolean = false;

  @Event({ eventName: 'ir-tab-click' }) irTabClick: EventEmitter<string>;

  render() {
    return (
      <Host role="tab" tabindex={this.selected ? 0 : -1} aria-selected={String(this.selected)} aria-controls={this.panel}>
        <button
          disabled={this.disabled}
          tabIndex={-1}
          class={{ 'tab-item': true, 'selected': this.selected }}
          onClick={() => {
            this.irTabClick.emit(this.panel);
          }}
        >
          <slot></slot>
        </button>
      </Host>
    );
  }
}
