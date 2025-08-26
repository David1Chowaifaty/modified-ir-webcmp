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
  @Prop() label: string;

  // Custom class for select
  @Prop() selectStyles: string;

  // Inline styles for the select
  @Prop() selectForcedStyles: { [key: string]: string };

  // Custom class for the outer container
  @Prop() selectContainerStyle: string;

  // Selected value of the select
  @Prop({ mutable: true }) selectedValue = null;

  // Marks the select as required
  @Prop() required: boolean;

  // Placeholder text for the first option
  @Prop() firstOption: string = 'Select';

  // Whether to show the first placeholder option
  @Prop() showFirstOption: boolean = true;

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
  @Prop({ attribute: 'select-id' }) selectId: string = v4();

  // Data-testid for testing
  @Prop() testId: string;

  // Whether the select is disabled
  @Prop() disabled: boolean;

  // Whether the select has an error state
  @Prop({ mutable: true }) error: boolean = false;

  /**
   * Floating label text that appears inside the input and “floats” above
   * when the field is focused or has a value.
   *
   * - If provided, a floating label will be rendered inside the input container.
   * - If you omit this prop but set `label`, the old left-side static label is used.
   * - If you provide both `label` and `floatingLabel`, only the floating label is shown.
   *
   *
   * Examples:
   * ```tsx
   * <ir-select floating-label label="Phone" />
   * ```
   */
  @Prop({ attribute: 'floating-label', reflect: true }) floatingLabel: boolean;

  // Tracks if the field has been touched
  @State() initial: boolean = true;

  // Tracks if the field is valid
  @State() valid: boolean = false;

  // Emits selected value changes
  @Event({ bubbles: true, composed: true }) selectChange: EventEmitter;

  private selectEl: HTMLSelectElement;

  /** Internal: id used by aria-labelledby for the floating label. */
  private labelId = `ir-select-label-${v4()}`;

  @Watch('selectedValue')
  watchHandler(newValue: string) {
    if (newValue !== null && this.required) {
      this.valid = true;
    }
  }

  @Listen('animateIrSelect', { target: 'body' })
  handleButtonAnimation(e: CustomEvent) {
    if (!this.selectEl || e.detail !== this.selectId) {
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
    let className = ['form-control'];
    if (this.floatingLabel) {
      className.push('floating-select');
    } else {
      className.push(`col-${this.label ? 12 - this.labelWidth : 12}`);
    }
    if (this.required && !this.valid && !this.initial) {
      className.push('border-danger');
    }

    let label = this.label ? (
      this.floatingLabel ? (
        <label id={this.labelId} class={`floating-label active`} htmlFor={this.selectId}>
          {this.label}
          {this.required ? '*' : ''}
        </label>
      ) : (
        <div class={`input-group-prepend col-${this.labelWidth} p-0 text-${this.labelColor}`}>
          <label
            htmlFor={this.selectId}
            class={`input-group-text ${this.labelPosition === 'right' ? 'justify-content-end' : this.labelPosition === 'center' ? 'justify-content-center' : ''} ${
              this.labelBackground ? 'bg-' + this.labelBackground : ''
            } flex-grow-1 text-${this.labelColor} border-${this.labelBorder === 'none' ? 0 : this.labelBorder} `}
          >
            {this.label}
            {this.required ? '*' : ''}
          </label>
        </div>
      )
    ) : null;
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
            id={this.selectId}
            class={`${this.selectStyles} ${this.error ? 'border-danger' : ''} ${className.join(' ')} form-control-${this.size} text-${this.textSize} `}
            onInput={this.handleSelectChange.bind(this)}
            required={this.required}
          >
            {this.showFirstOption && <option value={''}>{this.firstOption}</option>}
            {this.data.map(item => {
              return (
                <option selected={this.selectedValue === item.value} value={item.value}>
                  {item.text}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    );
  }
}
