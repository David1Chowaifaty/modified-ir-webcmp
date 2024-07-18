import { Component, Prop, Event, EventEmitter, h, Listen } from '@stencil/core';
import { v4 } from 'uuid';
import { TIcons } from '../ui/ir-icons/icons';

@Component({
  tag: 'ir-button',
  styleUrl: 'ir-button.css',
  scoped: true,
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
  @Prop() btn_id: string = v4();
  @Prop() variant: 'default' | 'icon' = 'default';
  @Prop() icon_name: TIcons;
  @Prop() visibleBackgroundOnHover: boolean = false;

  @Event({ bubbles: true, composed: true }) clickHanlder: EventEmitter<any>;

  private buttonEl: HTMLButtonElement;
  @Listen('animateIrButton', { target: 'body' })
  handleButtonAnimation(e: CustomEvent) {
    if (!this.buttonEl || e.detail !== this.btn_id) {
      return;
    }
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.buttonEl.classList.remove('bounce-3');
    void this.buttonEl.offsetWidth;
    this.buttonEl.classList.add('bounce-3');
  }
  render() {
    if (this.variant === 'icon') {
      return (
        <button
          id={this.btn_id}
          class={`icon-button ${this.visibleBackgroundOnHover ? 'hovered_bg' : ''}`}
          ref={el => (this.buttonEl = el)}
          onClick={() => this.clickHanlder.emit()}
          type={this.btn_type}
          disabled={this.btn_disabled}
        >
          {this.isLoading ? <span class="icon-loader"></span> : <ir-icons name={this.icon_name}></ir-icons>}
        </button>
      );
    }
    let blockClass = this.btn_block ? 'btn-block' : '';
    return (
      <button
        id={this.btn_id}
        ref={el => (this.buttonEl = el)}
        onClick={() => this.clickHanlder.emit()}
        class={`btn btn-${this.btn_color} ${this.btn_styles} d-flex align-items-center btn-${this.size} text-${this.textSize} ${blockClass}`}
        type={this.btn_type}
        disabled={this.btn_disabled}
      >
        <span class="button-icon" data-state={this.isLoading ? 'loading' : ''}>
          <slot name="icon"></slot>
        </span>
        {this.text && <span class="button-text m-0">{this.text}</span>}
        {this.isLoading && <div class="loader m-0 p-0"></div>}
      </button>
    );
  }
}
