import { Component, Prop, Event, EventEmitter, h, Fragment } from '@stencil/core';

@Component({
  tag: 'ir-button',
  styleUrl: 'ir-button.css',
})
export class IrButton {
  @Prop() name: string;
  @Prop() text;
  @Prop() icon = 'ft-save';
  @Prop() btn_color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'primary';
  @Prop() size: 'sm' | 'md' | 'lg' = 'md';
  @Prop() textSize: 'sm' | 'md' | 'lg' = 'md';
  @Prop() btn_block = true;
  @Prop() btn_disabled = false;
  @Prop() btn_type = 'button';

  connectedCallback() {}
  disconnectedCallback() {}
  @Event({ bubbles: true, composed: true }) clickHanlder: EventEmitter<any>;

  render() {
    let block = '';
    if (this.btn_block) {
      block = 'btn-block';
    }
    return (
      <button
        onClick={() => {
          this.clickHanlder.emit();
        }}
        class={`m-0 btn btn-${this.btn_color} btn-${this.size} text-${this.textSize} ${block}`}
        type={this.btn_type}
      >
        {this.icon && (
          <Fragment>
            <i class={this.icon}></i>&nbsp;
          </Fragment>
        )}
        {this.text}
      </button>
    );
  }
}
