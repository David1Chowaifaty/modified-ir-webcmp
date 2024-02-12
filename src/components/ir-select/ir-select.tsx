import { Component, Prop, h, Event, EventEmitter, State, Watch } from '@stencil/core';
import { selectOption } from '../../common/models';

@Component({
  tag: 'ir-select',
  scoped: true,
})
export class IrSelect {
  @Prop() name: string;
  @Prop() data: selectOption[];
  @Prop() label = '<label>';
  @Prop() selectStyles: string;
  @Prop() selectContainerStyle: string;
  @Prop({ reflect: true, mutable: true }) selectedValue = null;
  @Prop() required: boolean;
  @Prop() LabelAvailable: boolean = true;
  @Prop() firstOption: string = 'Select';
  @Prop() selectStyle: boolean = true;
  @Prop() submited: boolean = false;
  @Prop() size: 'sm' | 'md' | 'lg' = 'md';
  @Prop() textSize: 'sm' | 'md' | 'lg' = 'md';
  @Prop() labelPosition: 'left' | 'right' | 'center' = 'left';
  @Prop() labelBackground: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | null = null;
  @Prop() labelColor: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'dark';
  @Prop() labelBorder: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'none' = 'light';
  @Prop() labelWidth: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 = 3;

  @State() initial: boolean = true;
  @State() valid: boolean = false;
  @Event({ bubbles: true, composed: true }) selectChange: EventEmitter;

  @Watch('selectedValue')
  watchHandler(newValue: string) {
    if (newValue !== null && this.required) {
      this.valid = true;
    }
  }
  @Watch('submited')
  watchHandler2(newValue: boolean) {
    if (newValue && this.required) {
      this.initial = false;
    }
  }

  componentwillload() {}
  disconnectedCallback() {}
  handleSelectChange(event) {
    if (this.required) {
      this.initial = false;
      this.valid = event.target.checkValidity();
      this.selectedValue = event.target.value;
      this.selectChange.emit(this.selectedValue);
    } else {
      this.selectedValue = event.target.value;
      this.selectChange.emit(this.selectedValue);
    }
  }
  count = 0;

  render() {
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
    if (this.selectStyle === false) {
      className = '';
    }
    if (this.required && !this.valid && !this.initial) {
      className = `${className} border-danger`;
    }

    if (!this.LabelAvailable) {
      label = '';
    }

    return (
      <div class={`form-group m-0 ${this.selectContainerStyle}`}>
        <div class="input-group row m-0">
          {label}
          <select
            class={`${this.selectStyles} ${className} form-control-${this.size} text-${this.textSize} col-${this.LabelAvailable ? 12 - this.labelWidth : 12}`}
            onInput={this.handleSelectChange.bind(this)}
            required={this.required}
          >
            <option value={''}>{this.firstOption}</option>
            {this.data.map(item => {
              if (this.selectedValue === item.value) {
                return (
                  <option selected value={item.value}>
                    {item.text}
                  </option>
                );
              } else {
                return <option value={item.value}>{item.text}</option>;
              }
            })}
          </select>
        </div>
      </div>
    );
  }
}
