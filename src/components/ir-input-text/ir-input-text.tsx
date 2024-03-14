import { Component, Prop, h, Event, EventEmitter, State, Watch } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-input-text',
  styleUrl: 'ir-input-text.css',
  scoped: true,
})
export class IrInputText {
  @Prop() name: string;
  @Prop() value;
  @Prop() label = '<label>';
  @Prop() placeholder = '<placeholder>';
  @Prop() inputStyles = '';
  @Prop() required: boolean;
  @Prop() LabelAvailable: boolean = true;
  @Prop() readonly: boolean = false;
  @Prop() type = 'text';
  @Prop() submited: boolean = false;
  @Prop() inputStyle: boolean = true;
  @Prop() size: 'sm' | 'md' | 'lg' = 'md';
  @Prop() textSize: 'sm' | 'md' | 'lg' = 'md';
  @Prop() labelPosition: 'left' | 'right' | 'center' = 'left';
  @Prop() labelBackground: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | null = null;
  @Prop() labelColor: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'dark';
  @Prop() labelBorder: 'theme' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'none' = 'theme';
  @Prop() labelWidth: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 = 3;
  @Prop() variant: 'default' | 'icon' = 'default';
  @Prop() disabled: boolean = false;
  @Prop() error: boolean = false;

  @State() valid: boolean;
  @State() initial: boolean = true;
  @State() inputFocused: boolean = false;

  @Event({ bubbles: true, composed: true }) textChange: EventEmitter<any>;
  @Event() inputBlur: EventEmitter<FocusEvent>;
  connectedCallback() {}
  disconnectedCallback() {}

  @Watch('value')
  watchHandler(newValue: string) {
    if (newValue !== '' && this.required) {
      this.valid = true;
    }
  }
  @Watch('submited')
  watchHandler2(newValue: boolean) {
    if (newValue && this.required) {
      this.initial = false;
    }
  }

  handleInputChange(event) {
    this.initial = false;
    if (this.required) {
      this.valid = event.target.checkValidity();
      const value = event.target.value;
      this.textChange.emit(value);
    } else {
      this.textChange.emit(event.target.value);
    }
  }

  render() {
    const id = v4();
    if (this.variant === 'icon') {
      return (
        <fieldset class="position-relative has-icon-left input-container">
          <label htmlFor={id} class="input-group-prepend bg-white m-0">
            <span
              data-disabled={this.disabled}
              data-state={this.inputFocused ? 'focus' : ''}
              class={`input-group-text icon-container bg-white ${this.error && 'danger-border'}`}
              id="basic-addon1"
            >
              <slot name="icon"></slot>
            </span>
          </label>
          <input
            type="text"
            onFocus={() => (this.inputFocused = true)}
            required={this.required}
            onBlur={e => {
              this.inputFocused = false;
              this.inputBlur.emit(e);
            }}
            disabled={this.disabled}
            class={`form-control bg-white pl-0 input-sm rate-input py-0 m-0 rateInputBorder ${this.error && 'danger-border'}`}
            id={id}
            value={this.value}
            placeholder={this.placeholder}
            onInput={this.handleInputChange.bind(this)}
          />
        </fieldset>
      );
    }
    let className = 'form-control';
    let label = (
      <div class={`input-group-prepend col-${this.labelWidth} p-0 text-${this.labelColor}`}>
        <label
          class={`input-group-text ${this.labelPosition === 'right' ? 'justify-content-end' : this.labelPosition === 'center' ? 'justify-content-center' : ''} ${
            this.labelBackground ? 'bg-' + this.labelBackground : ''
          } flex-grow-1 text-${this.labelColor} border-${this.labelBorder === 'none' ? 0 : this.labelBorder} `}
        >
          {this.label}
          {this.required ? '*' : ''}
        </label>
      </div>
    );
    if (!this.LabelAvailable) {
      label = '';
    }
    if (this.inputStyle === false) {
      className = '';
    }
    if (this.required && !this.valid && !this.initial) {
      className = `${className} border-danger`;
    }

    return (
      <div class="form-group">
        <div class="input-group row m-0">
          {label}
          <input
            readOnly={this.readonly}
            type={this.type}
            class={`${className} ${this.error ? 'border-danger' : ''} form-control-${this.size} text-${this.textSize} col-${this.LabelAvailable ? 12 - this.labelWidth : 12} ${
              this.readonly && 'bg-white'
            } ${this.inputStyles}`}
            onBlur={e => this.inputBlur.emit(e)}
            placeholder={this.placeholder}
            value={this.value}
            onInput={this.handleInputChange.bind(this)}
            required={this.required}
            disabled={this.disabled}
          />
        </div>
      </div>
    );
  }
}
