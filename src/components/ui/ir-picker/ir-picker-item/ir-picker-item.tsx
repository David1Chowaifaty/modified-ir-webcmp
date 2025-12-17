import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-picker-item',
  styleUrl: 'ir-picker-item.css',
  shadow: true,
})
export class IrPickerItem {
  @Prop({ reflect: true }) value: string;
  @Prop({ reflect: true }) label: string;
  @Prop({ reflect: true }) disabled: boolean = false;
  @Prop({ reflect: true, mutable: true }) active: boolean = false;
  @Prop({ reflect: true, mutable: true }) selected: boolean = false;

  render() {
    return (
      <Host role="option" aria-selected={this.selected ? 'true' : 'false'} aria-disabled={this.disabled ? 'true' : 'false'}>
        <button class={`picker-item__container`} type="button" tabindex="-1" disabled={this.disabled} part="base">
          <wa-icon class="picker-item__check" name="check"></wa-icon>
          <div class="picker-item__content" part="content">
            <slot></slot>
          </div>
        </button>
      </Host>
    );
  }
}
