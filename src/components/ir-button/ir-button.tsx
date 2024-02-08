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
  @Prop() isLoading: boolean = false;
  @Prop() btn_styles: string;

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
        class={`m-0 btn btn-${this.btn_color} ${this.btn_styles} d-flex btn-${this.size} text-${this.textSize} ${block}`}
        type={this.btn_type}
      >
        {this.icon && !this.isLoading && (
          <span>
            <i class={`${this.icon} font-small-3`}></i>&nbsp;
          </span>
        )}
        {this.isLoading && (
          <Fragment>
            <span class={'m-0 p-0 loader'}></span>&nbsp;
          </Fragment>
        )}
        <span class={'m-0 p-0 button-text'}>{this.text}</span>
      </button>
    );
  }
}
