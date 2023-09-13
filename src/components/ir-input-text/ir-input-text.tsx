import { Component, Prop, h, Event, EventEmitter, State, Watch } from '@stencil/core';

@Component({
  tag: 'ir-input-text',
})
export class IrInputText {
  @Prop() name: string;
  @Prop() value;
  @Prop() label = '<label>';
  @Prop() placeholder = '<placeholder>';
  @Prop() required: boolean;
  @Prop() LabelAvailable: boolean = true;
  @Prop() type = 'text';
  @Prop() submited: boolean = false;
  @Prop() inputStyle: boolean = true;
  @Prop() size: 'sm' | 'md' | 'lg' = 'md';
  @Prop() textSize: 'sm' | 'md' | 'lg' = 'md';
  @Prop() labelPosition: 'left' | 'right' | 'center' = 'left';
  @Prop() labelBackground: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'light';
  @Prop() labelColor: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'dark';
  @Prop() labelBorder: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'none' = 'none';
  @Prop() labelWidth: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 = 3;

  @State() valid: boolean;
  @State() initial: boolean = true;

  @Event({ bubbles: true, composed: true }) textChange: EventEmitter<any>;
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
    let className = 'form-control';
    let label = (
      <div class={`input-group-prepend col-${this.labelWidth} p-0 text-${this.labelColor} border-${this.labelBorder}`}>
        <label
          class={`input-group-text ${this.labelPosition === 'right' ? 'justify-content-end' : this.labelPosition === 'center' ? 'justify-content-center' : ''} bg-${
            this.labelBackground
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
            type={this.type}
            class={`${className} form-control-${this.size} text-${this.textSize} col-${12 - this.labelWidth}`}
            placeholder={this.placeholder}
            value={this.value}
            onInput={this.handleInputChange.bind(this)}
            required={this.required}
          />
        </div>
      </div>
    );
  }
}
