import { Component, Prop, h, Event, EventEmitter, State, Watch, Element } from '@stencil/core';
import { v4 } from 'uuid';
import IMask, { FactoryArg, InputMask } from 'imask';
import { ZodType } from 'zod';

@Component({
  tag: 'ir-input-text',
  styleUrl: 'ir-input-text.css',
  scoped: true,
})
export class IrInputText {
  @Element() el: HTMLIrInputTextElement;
  /** Name attribute for the input field */
  @Prop() name: string;

  /** Value of the input field */
  @Prop() value: string;

  /** Label text for the input */
  @Prop() label = '';

  /** Placeholder text for the input */
  @Prop() placeholder = '';

  /** Additional inline styles for the input */
  @Prop() inputStyles = '';

  /** Whether the input field is required */
  @Prop() required: boolean;

  /** Determines if the label is displayed */
  @Prop() LabelAvailable: boolean = true;

  /** Whether the input field is read-only */
  @Prop() readonly: boolean = false;

  /** Input type (e.g., text, password, email) */
  @Prop() type:
    | 'text'
    | 'password'
    | 'email'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'datetime-local'
    | 'month'
    | 'week'
    | 'time'
    | 'color'
    | 'file'
    | 'hidden'
    | 'checkbox'
    | 'radio'
    | 'range'
    | 'button'
    | 'reset'
    | 'submit'
    | 'image' = 'text';

  /** Whether the form has been submitted */
  @Prop() submitted: boolean = false;

  /** Whether to apply default input styling */
  @Prop() inputStyle: boolean = true;

  /** Size of the input field: small (sm), medium (md), or large (lg) */
  @Prop() size: 'sm' | 'md' | 'lg' = 'md';

  /** Text size inside the input field */
  @Prop() textSize: 'sm' | 'md' | 'lg' = 'md';

  /** Position of the label: left, right, or center */
  @Prop() labelPosition: 'left' | 'right' | 'center' = 'left';

  /** Background color of the label */
  @Prop() labelBackground: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | null = null;

  /** Text color of the label */
  @Prop() labelColor: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'dark';

  /** Border color/style of the label */
  @Prop() labelBorder: 'theme' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'none' = 'theme';

  /** Label width as a fraction of 12 columns (1-11) */
  @Prop() labelWidth: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 = 3;

  /** Variant of the input: default or icon */
  @Prop() variant: 'default' | 'icon' = 'default';

  /** Whether the input is disabled */
  @Prop() disabled: boolean = false;

  /** Whether the input has an error */
  @Prop({ mutable: true }) error: boolean = false;

  /** Mask for the input field (optional) */
  @Prop() mask: FactoryArg;

  /** Whether the input should auto-validate */
  @Prop() autoValidate?: boolean = true;

  /** A Zod schema for validating the input */
  @Prop() zod?: ZodType<any, any>;

  /** Key to wrap the value (e.g., 'price' or 'cost') */
  @Prop() wrapKey?: string;

  /** Forcing css style to the input */
  @Prop() inputForcedStyle?: { [key: string]: string };

  /** Input id for testing purposes*/
  @Prop() testId: string;

  /** Input max character length*/
  @Prop() maxLength: number;

  /** To clear all the Input base styling*/
  @Prop() clearBaseStyles: boolean;

  @State() initial: boolean = true;
  @State() inputFocused: boolean = false;

  @State() isError: boolean = false;

  @Event({ bubbles: true, composed: true }) textChange: EventEmitter<any>;
  @Event() inputBlur: EventEmitter<FocusEvent>;
  @Event() inputFocus: EventEmitter<FocusEvent>;

  private inputRef: HTMLInputElement;
  private maskInstance: InputMask<FactoryArg>;
  /**Input Id */
  private id: string;
  componentWillLoad() {
    if (this.el.id) {
      this.id = this.el.id;
    } else {
      this.id = v4();
    }
  }
  componentDidLoad() {
    if (this.mask) this.initMask();
  }

  @Watch('mask')
  handleMaskChange() {
    this.initMask();
  }

  @Watch('submitted')
  watchHandler2(newValue: boolean) {
    if (newValue && this.required) {
      this.initial = false;
    }
  }

  @Watch('error')
  handleErrorChange(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue) {
      this.validateInput(this.value, true);
    }
  }

  @Watch('aria-invalid')
  handleAriaInvalidChange(newValue: string) {
    if (newValue === 'true') {
      this.isError = true;
    } else {
      this.isError = false;
    }
  }

  private validateInput(value: string, forceValidation: boolean = false): void {
    if (!this.autoValidate && !forceValidation) {
      return;
    }
    if (this.zod) {
      try {
        this.zod.parse(this.wrapKey ? { [this.wrapKey]: value } : value); // Validate the value using the Zod schema
        this.error = false; // Clear the error if valid
      } catch (error) {
        console.log(error);
        this.error = true; // Set the error message
      }
    }
  }

  private handleInputChange(event: InputEvent) {
    this.initial = false;
    const value = (event.target as HTMLInputElement).value;
    if (this.maskInstance) {
      this.maskInstance.value = value;
    }
    const maskedValue = this.maskInstance ? this.maskInstance.value : value;
    this.textChange.emit(maskedValue);
  }

  private initMask() {
    if (!this.mask || this.maskInstance) {
      return;
    }

    this.maskInstance = IMask(this.inputRef, this.mask);

    // Listen to mask changes to keep input value in sync
    this.maskInstance.on('accept', () => {
      this.inputRef.value = this.maskInstance.value; // Update the input field
      this.textChange.emit(this.maskInstance.value); // Emit the masked value
    });
  }
  // Function that handles the blur events
  // it validates the input and emits the blur event
  private handleBlur(e: FocusEvent) {
    this.validateInput(this.value, this.submitted);
    this.inputFocused = false;
    this.inputBlur.emit(e);
  }

  render() {
    if (this.variant === 'icon') {
      return (
        <fieldset class="position-relative has-icon-left input-container">
          <label htmlFor={this.id} class="input-group-prepend bg-white m-0">
            <span
              data-disabled={this.disabled}
              data-state={this.inputFocused ? 'focus' : ''}
              class={`input-group-text icon-container bg-white ${(this.error || this.isError) && 'danger-border'}`}
              id="basic-addon1"
            >
              <slot name="icon"></slot>
            </span>
          </label>
          <input
            maxLength={this.maxLength}
            aria-invalid={this.error ? 'true' : 'false'}
            data-testid={this.testId}
            data-state={!!this.value ? '' : this.mask ? 'empty' : ''}
            ref={el => (this.inputRef = el)}
            type={this.type}
            onFocus={e => {
              this.inputFocused = true;
              this.inputFocus.emit(e);
            }}
            required={this.required}
            onBlur={this.handleBlur.bind(this)}
            disabled={this.disabled}
            class={`ir-input form-control bg-white pl-0 input-sm rate-input py-0 m-0 rateInputBorder ${(this.error || this.isError) && 'danger-border'}`}
            id={this.id}
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
          htmlFor={this.id}
          class={` input-group-text ${this.labelPosition === 'right' ? 'justify-content-end' : this.labelPosition === 'center' ? 'justify-content-center' : ''} ${
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
    if (this.required && !this.initial) {
      className = `${className} border-danger`;
    }
    return (
      <div class="form-group">
        <div class="input-group row m-0">
          {label}
          <input
            aria-invalid={this.error ? 'true' : 'false'}
            maxLength={this.maxLength}
            data-testid={this.testId}
            style={this.inputForcedStyle}
            data-state={!!this.value ? '' : this.mask ? 'empty' : ''}
            id={this.id}
            ref={el => (this.inputRef = el)}
            readOnly={this.readonly}
            type={this.type}
            class={
              this.clearBaseStyles
                ? `${this.inputStyles}`
                : `ir-input ${className} ${this.error || this.isError ? 'border-danger' : ''} form-control-${this.size} text-${this.textSize} col-${
                    this.LabelAvailable ? 12 - this.labelWidth : 12
                  } ${this.readonly && 'bg-white'} ${this.inputStyles}`
            }
            onBlur={this.handleBlur.bind(this)}
            onFocus={e => {
              this.inputFocused = true;
              this.inputFocus.emit(e);
            }}
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
