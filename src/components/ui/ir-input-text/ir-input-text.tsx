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
  @Prop() label: string;

  /** Placeholder text for the input */
  @Prop() placeholder: string;

  /** Additional inline styles for the input */
  @Prop() inputStyles = '';

  /** Whether the input field is required */
  @Prop() required: boolean;

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

  /** Text size inside the input field */
  @Prop() textSize: 'sm' | 'md' | 'lg' = 'md';

  /** Position of the label: left, right, or center */
  @Prop() labelPosition: 'left' | 'right' | 'center' | 'top' = 'left';

  /** Background color of the label */
  @Prop() labelBackground: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | null = null;

  /** Text color of the label */
  @Prop() labelColor: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'dark';

  /** Border color/style of the label */
  @Prop() labelBorder: 'theme' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'none' = 'theme';

  /** Label width as a fraction of 12 columns (1-11) */
  @Prop() labelWidth: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 = 3;

  /** Variant of the input: default or icon or floating-label */
  @Prop() variant: 'default' | 'icon' | 'floating-label' = 'default';

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

  /** A Zod parse type for validating the input */
  @Prop() asyncParse?: boolean;

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

  /** To clear all the Input base styling*/
  @Prop() errorMessage: string;

  /** Autocomplete behavior for the input (e.g., 'on', 'off', 'email', etc.) */
  @Prop() autoComplete: string;

  /** Forcing css style to the input container */
  @Prop() inputContainerStyle: { [key: string]: string };
  /**
   * Extra class names applied to the label container (<div class="input-group-prepend">)
   * that wraps the <label>. Use this to control label width, alignment,
   * spacing, or visibility at different breakpoints.
   * Example: "min-w-120 text-nowrap pe-2"
   */
  @Prop() labelContainerClassname: string;

  @State() inputFocused: boolean = false;

  @Event({ bubbles: true, composed: true }) textChange: EventEmitter<any>;
  @Event() inputBlur: EventEmitter<FocusEvent>;
  @Event() inputFocus: EventEmitter<FocusEvent>;

  private inputRef: HTMLInputElement;
  private maskInstance: InputMask<FactoryArg>;

  private id: string;
  private hasPrefixSlot: boolean;
  private hasSuffixSlot: boolean;

  componentWillLoad() {
    if (this.el.id) {
      this.id = this.el.id;
    } else {
      this.id = v4();
    }
    this.hasPrefixSlot = this.haveSlotPresent('prefix');
    this.hasSuffixSlot = this.haveSlotPresent('suffix');
  }

  componentDidLoad() {
    if (this.mask) this.initMask();
  }

  @Watch('mask')
  handleMaskChange() {
    this.initMask();
  }
  // @Watch('autoValidate')
  // handleMaskChange1() {
  //   console.log(this.autoValidate);
  // }

  // @Watch('error')
  // handleErrorChange(newValue: boolean, oldValue: boolean) {
  //   if (newValue !== oldValue) {
  //     if (this.autoValidate) {
  //       this.validateInput(this.value, true);
  //     }
  //   }
  // }

  @Watch('value')
  handleValueChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.validateInput(this.value);
    }
  }

  private initMask() {
    if (!this.mask || this.maskInstance) {
      return;
    }

    this.maskInstance = IMask(this.inputRef, this.mask);
    this.maskInstance.on('accept', () => {
      const isEmpty = this.inputRef.value.trim() === '' || this.maskInstance.unmaskedValue === '';
      if (isEmpty) {
        this.inputRef.value = '';
        this.textChange.emit(null);
      } else {
        this.inputRef.value = this.maskInstance.value;
        this.textChange.emit(this.maskInstance.value);
      }
    });
  }

  private haveSlotPresent(name: string) {
    const slot = this.el.querySelector(`[slot="${name}"]`);
    return slot !== null;
  }

  private async validateInput(value: string, forceValidation: boolean = false) {
    if (!this.autoValidate && !forceValidation) {
      if (this.error) {
        this.updateErrorState(false);
      }
      return;
    }
    if (this.zod) {
      try {
        if (!this.asyncParse) {
          this.zod.parse(this.wrapKey ? { [this.wrapKey]: value } : value);
        } else {
          await this.zod.parseAsync(this.wrapKey ? { [this.wrapKey]: value } : value);
        }
        if (this.error) {
          this.updateErrorState(false);
        }
      } catch (error) {
        console.log(error);
        this.updateErrorState(true);
      }
    }
  }

  private handleInputChange(event: InputEvent) {
    const value = (event.target as HTMLInputElement).value;
    const isEmpty = value === '';
    if (this.maskInstance) {
      this.maskInstance.value = value;
    }
    const maskedValue = isEmpty ? null : this.maskInstance ? this.maskInstance.value : value;
    this.textChange.emit(maskedValue);
  }

  private updateErrorState(b: boolean) {
    this.error = b;
    this.inputRef.setAttribute('aria-invalid', b ? 'true' : 'false');
  }

  private handleBlur(e: FocusEvent) {
    this.validateInput(this.value, this.submitted);
    this.inputFocused = false;
    this.inputBlur.emit(e);
  }
  private renderFloatingLabel() {
    const labelText = this.label || this.placeholder || '';
    const hasValue = !!(this.value && String(this.value).length > 0);

    return (
      <div class="form-group" style={this.inputContainerStyle}>
        <div
          class={`ir-floating-group ${this.error ? 'has-error' : ''} ${this.disabled ? 'is-disabled' : ''} ${this.readonly ? 'is-readonly' : ''}`}
          data-has-value={String(hasValue)}
          data-focused={String(this.inputFocused)}
          data-have-prefix={String(this.hasPrefixSlot)}
          data-have-suffix={String(this.hasSuffixSlot)}
          part="form-group"
        >
          <span part="prefix-container" class={{ 'prefix-container': true, 'no-slot': !this.hasPrefixSlot }}>
            <slot name="prefix"></slot>
          </span>
          <input
            part="input"
            data-state={!!this.value ? undefined : this.mask ? 'empty' : undefined}
            maxLength={this.maxLength}
            data-testid={this.testId}
            style={this.inputForcedStyle}
            id={this.id}
            name={this.name}
            ref={el => (this.inputRef = el)}
            readOnly={this.readonly}
            type={this.type}
            class={`ir-input ir-floating-input ${this.inputStyles || ''} ${this.error ? 'danger-border' : ''} text-${this.textSize}`}
            onBlur={this.handleBlur.bind(this)}
            onFocus={e => {
              this.inputFocused = true;
              this.inputFocus.emit(e);
            }}
            placeholder=" "
            autoComplete={this.autoComplete}
            autocomplete={this.autoComplete}
            value={this.value}
            onInput={this.handleInputChange.bind(this)}
            required={this.required}
            disabled={this.disabled}
            aria-invalid={String(this.error)}
            aria-required={String(this.required)}
          />
          <label part="label" htmlFor={this.id} class="ir-floating-label">
            {labelText}
            {this.required ? ' *' : ''}
          </label>

          <span part="suffix-container" class={{ 'suffix-container': true, 'no-slot': !this.hasSuffixSlot }}>
            <slot name="suffix"></slot>
          </span>
        </div>

        {this.errorMessage && this.error && (
          <p part="error-message" class="error-message">
            {this.errorMessage}
          </p>
        )}
      </div>
    );
  }
  render() {
    if (this.variant === 'floating-label') {
      return this.renderFloatingLabel();
    }
    if (this.variant === 'icon') {
      return (
        <fieldset class="position-relative has-icon-left input-container">
          <label htmlFor={this.id} class="input-group-prepend bg-white m-0">
            <span
              data-disabled={this.disabled}
              data-state={this.inputFocused ? 'focus' : ''}
              class={`input-group-text icon-container bg-white ${this.error ? 'danger-border' : ''}`}
              id="basic-addon1"
            >
              <slot name="icon"></slot>
            </span>
          </label>
          <input
            maxLength={this.maxLength}
            data-testid={this.testId}
            style={this.inputForcedStyle}
            data-state={!!this.value ? undefined : this.mask ? 'empty' : undefined}
            id={this.id}
            ref={el => (this.inputRef = el)}
            readOnly={this.readonly}
            type={this.type}
            class={`ir-input form-control bg-white pl-0 input-sm rate-input py-0 m-0 rateInputBorder ${this.error ? 'danger-border' : ''}`}
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
            autoComplete={this.autoComplete}
          />
        </fieldset>
      );
    }
    return (
      <div class={'form-group'} style={this.inputContainerStyle}>
        <div class="input-group row m-0">
          {this.label && (
            <div class={`input-group-prepend col-${this.labelWidth} ${this.labelContainerClassname} p-0 text-${this.labelColor}`}>
              <label
                htmlFor={this.id}
                class={`input-group-text ${this.labelPosition === 'right' ? 'justify-content-end' : this.labelPosition === 'center' ? 'justify-content-center' : ''} ${
                  this.labelBackground ? 'bg-' + this.labelBackground : ''
                } flex-grow-1 text-${this.labelColor} border-${this.labelBorder === 'none' ? 0 : this.labelBorder} `}
              >
                {this.label}
                {this.required ? '*' : ''}
              </label>
            </div>
          )}
          <input
            maxLength={this.maxLength}
            data-testid={this.testId}
            style={this.inputForcedStyle}
            data-state={!!this.value ? undefined : this.mask ? 'empty' : undefined}
            id={this.id}
            ref={el => (this.inputRef = el)}
            readOnly={this.readonly}
            type={this.type}
            class={
              this.clearBaseStyles
                ? `${this.inputStyles}`
                : `${this.error ? 'border-danger' : ''} form-control text-${this.textSize} col-${this.label ? 12 - this.labelWidth : 12} ${this.readonly ? 'bg-white' : ''} ${
                    this.inputStyles
                  }`
            }
            onBlur={this.handleBlur.bind(this)}
            onFocus={e => {
              this.inputFocused = true;
              this.inputFocus.emit(e);
            }}
            placeholder={this.placeholder}
            autoComplete={this.autoComplete}
            autocomplete={this.autoComplete}
            value={this.value}
            onInput={this.handleInputChange.bind(this)}
            required={this.required}
            disabled={this.disabled}
          />
        </div>
        {this.errorMessage && this.error && <p class="error-message">{this.errorMessage}</p>}
      </div>
    );
  }
}
