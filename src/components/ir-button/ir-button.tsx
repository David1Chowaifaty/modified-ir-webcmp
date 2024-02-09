import { Component, Prop, Event, EventEmitter, h } from '@stencil/core';

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
    let blockClass = this.btn_block ? 'btn-block' : '';
    return (
      <button
        onClick={() => this.clickHanlder.emit()}
        class={`btn btn-${this.btn_color} ${this.btn_styles} d-flex align-items-center btn-${this.size} text-${this.textSize} ${blockClass}`}
        type={this.btn_type}
        disabled={this.btn_disabled}
      >
        <span class="button-icon" data-state={this.isLoading ? 'loading' : ''}>
          <slot name="icon"></slot>
        </span>
        {this.isLoading && <span class="loader m-0 p-0"></span>}
        {this.text && <span class="button-text m-0">{this.text}</span>}
      </button>
    );
  }
}
