import { Component, Element, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import { v4 } from 'uuid';
import { ZodType } from 'zod';

@Component({
  tag: 'ir-price-input',
  styleUrl: 'ir-price-input.css',
  scoped: true,
})
export class IrPriceInput {
  @Element() el: HTMLIrPriceInputElement;

  /** The label for the input, optional */
  @Prop() label?: string;

  /** Extra classnames for the input, optional */
  @Prop() inputStyle?: string;

  /** Extra classnames for the label, optional */
  @Prop() labelStyle?: string;

  /** The disabled for the input, optional */
  @Prop() disabled?: boolean;

  /** The Currency for the input, optional */
  @Prop() currency?: string;

  /** The AutoValidate for the input, optional */
  @Prop() autoValidate?: boolean = true;

  /** Indicates the key to wrap the value (e.g., 'price' or 'cost') */
  @Prop() wrapKey?: string;

  /**
   * A Zod schema for validating the input
   * Example: z.coerce.number()
   */
  @Prop() zod?: ZodType<any, any>;

  /** Placeholder text for the input */
  @Prop() placeholder: string = '';

  /** Initial value for the input */
  @Prop({ mutable: true }) value: string = '';

  /** Whether the input is required */
  @Prop() required: boolean = false;

  /** Minimum value for the price */
  @Prop() minValue?: number;

  /** Maximum value for the price */
  @Prop() maxValue?: number;

  /** Unique id for testing */
  @Prop() testId?: string;

  /** Error*/
  @State() error: boolean;

  /** Emits the current value on change */
  @Event() textChange: EventEmitter<string>;

  /** Emits the current value on blur */
  @Event() inputBlur: EventEmitter<string>;

  /** Emits the current value on focus */
  @Event() inputFocus: EventEmitter<void>;

  private id: string;

  componentWillLoad() {
    if (this.el.id) {
      this.id = this.el.id;
    } else {
      this.id = v4();
    }
  }

  private hasSpecialClass(className: string): boolean {
    return this.el.classList.contains(className);
  }

  private validateInput(value: string): void {
    if (!this.autoValidate) {
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

  private handleInputChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    // Emit the change event
    this.textChange.emit(this.value);
  };

  private handleBlur = (): void => {
    this.validateInput(this.value);
    // Emit the blur event
    if (this.value) {
      this.value = parseFloat(this.value).toFixed(2);
    }
    this.inputBlur.emit(this.value);
  };

  private handleFocus = (): void => {
    // Emit the focus event
    this.inputFocus.emit();
  };

  render() {
    return (
      <fieldset class="input-group price-input-group m-0 p-0">
        {this.label && (
          <div class="input-group-prepend">
            <span
              class={`input-group-text 
                ${this.labelStyle}
              ${this.hasSpecialClass('ir-bl-lbl-none') ? 'ir-bl-lbl-none' : ''}
              ${this.hasSpecialClass('ir-br-lbl-none') ? 'ir-br-lbl-none' : ''}
              ${this.hasSpecialClass('ir-br-none') ? 'ir-br-none' : ''} 
              ${this.hasSpecialClass('ir-bl-none') ? 'ir-bl-none' : ''} 
              `}
            >
              <label class={'p-0 m-0 '} htmlFor={this.id}>
                {this.label}
              </label>
            </span>
          </div>
        )}
        <div class="position-relative has-icon-left rate-input-container">
          {this.currency && (
            <div class={`input-group-prepend`}>
              <span class={`input-group-text ${this.disabled ? 'disabled' : ''} currency-label ${this.error ? 'error' : ''} ${this.label ? 'with-label' : ''}`}>
                {this.currency}
              </span>
            </div>
          )}
          <input
            data-testid={this.testId}
            disabled={this.disabled}
            id={this.id}
            class={`form-control input-sm rate-input 
              ${this.inputStyle}
              ${this.hasSpecialClass('ir-br-input-none') ? 'ir-br-input-none' : ''} 
              ${this.hasSpecialClass('ir-bl-input-none') ? 'ir-bl-input-none' : ''} 
              ${this.error ? 'error' : ''} py-0 m-0 ${this.currency ? 'ir-bl-none' : ''}`}
            onInput={this.handleInputChange}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
            type="number"
            step="0.01"
            aria-label={this.el.ariaLabel ?? 'price-input'}
            aria-describedby={this.el.ariaDescription ?? 'price-input'}
            value={this.value}
          />
        </div>
      </fieldset>
    );
  }
}
