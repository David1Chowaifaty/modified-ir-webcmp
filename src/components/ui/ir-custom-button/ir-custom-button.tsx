import WaButton from '@awesome.me/webawesome/dist/components/button/button';
import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-custom-button',
  styleUrl: 'ir-custom-button.css',
  scoped: true,
})
export class IrCustomButton {
  @Prop() appearance: WaButton['appearance'];
  @Prop() loading: WaButton['loading'];
  @Prop() withCaret: WaButton['withCaret'];
  @Prop() variant: WaButton['variant'];
  @Prop() size: WaButton['size'] = 'small';
  @Prop() type: WaButton['type'] = 'button';
  @Prop() disabled: WaButton['disabled'];

  @Event() clickHandler: EventEmitter<MouseEvent>;
  private buttonEl: WaButton;

  componentDidLoad() {
    this.buttonEl.addEventListener('click', this.handleButtonClick);
  }
  disconnectedCallback() {
    this.buttonEl.removeEventListener('click', this.handleButtonClick);
  }
  private handleButtonClick = (e: MouseEvent) => {
    this.clickHandler.emit(e);
  };
  render() {
    return (
      <Host>
        <wa-button
          ref={el => (this.buttonEl = el)}
          type={this.type}
          size={this.size}
          disabled={this.disabled}
          appearance={this.appearance}
          loading={this.loading}
          with-caret={this.withCaret}
          variant={this.variant}
        >
          <slot></slot>
        </wa-button>
      </Host>
    );
  }
}
