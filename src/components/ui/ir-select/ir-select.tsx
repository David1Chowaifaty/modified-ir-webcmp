import { Component, Prop, h, Event, EventEmitter, State, Watch, Listen } from '@stencil/core';
import { selectOption } from '@/common/models';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-select',
  styleUrl: 'ir-select.css',
  scoped: true,
})
export class IrSelect {
  // Name of the select input
  @Prop() name: string;

  // Options to populate the select
  @Prop() data: selectOption[];

  // Text shown in the label
  @Prop() label = '<label>';

  // Custom class for select
  @Prop() selectStyles: string;

  // Inline styles for the select
  @Prop() selectForcedStyles: { [key: string]: string };

  // Custom class for the outer container
  @Prop() selectContainerStyle: string;

  // Selected value of the select
  @Prop({ reflect: true, mutable: true }) selectedValue = null;

  // Marks the select as required
  @Prop() required: boolean;

  // Whether to render the label
  @Prop() LabelAvailable: boolean = true;

  // Placeholder text for the first option
  @Prop() firstOption: string = 'Select';

  // Enable/disable default form styling
  @Prop() selectStyle: boolean = true;

  // Whether to show the first placeholder option
  @Prop() showFirstOption: boolean = true;

  // Set to true when the form is submitted
  @Prop() submited: boolean = false;

  // Size of the select: 'sm' | 'md' | 'lg'
  @Prop() size: 'sm' | 'md' | 'lg' = 'md';

  // Size of the text: 'sm' | 'md' | 'lg'
  @Prop() textSize: 'sm' | 'md' | 'lg' = 'md';

  // Position of the label
  @Prop() labelPosition: 'left' | 'right' | 'center' = 'left';

  // Background color of the label
  @Prop() labelBackground: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | null = null;

  // Text color of the label
  @Prop() labelColor: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'dark';

  // Border color of the label
  @Prop() labelBorder: 'theme' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'none' = 'theme';

  // Width of the label (Bootstrap cols)
  @Prop() labelWidth: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 = 3;

  // Unique ID for the select element
  @Prop() select_id: string = v4();

  // Data-testid for testing
  @Prop() testId: string;

  // Whether the select is disabled
  @Prop() disabled: boolean;

  // Whether the select has an error state
  @Prop({ mutable: true }) error: boolean = false;

  // Tracks if the field has been touched
  @State() initial: boolean = true;

  // Tracks if the field is valid
  @State() valid: boolean = false;

  // Emits selected value changes
  @Event({ bubbles: true, composed: true }) selectChange: EventEmitter;

  private selectEl: HTMLSelectElement;

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
  @Listen('animateIrSelect', { target: 'body' })
  handleButtonAnimation(e: CustomEvent) {
    if (!this.selectEl || e.detail !== this.select_id) {
      return;
    }
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.selectEl.classList.add('border-danger');
  }

  // Handle select change event
  // Example: onInput={this.handleSelectChange.bind(this)}
  private handleSelectChange(event) {
    this.selectEl.classList.remove('border-danger');
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
          htmlFor={this.select_id}
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
            disabled={this.disabled}
            aria-invalid={this.error ? 'true' : 'false'}
            data-testid={this.testId}
            style={this.selectForcedStyles}
            ref={el => (this.selectEl = el)}
            id={this.select_id}
            class={`${this.selectStyles} ${this.error ? 'border-danger' : ''} ${className} form-control-${this.size} text-${this.textSize} col-${
              this.LabelAvailable ? 12 - this.labelWidth : 12
            }`}
            onInput={this.handleSelectChange.bind(this)}
            required={this.required}
          >
            {this.showFirstOption && <option value={''}>{this.firstOption}</option>}
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
