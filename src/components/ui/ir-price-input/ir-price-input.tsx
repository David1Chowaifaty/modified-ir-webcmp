import { Component, Element, Event, EventEmitter, Prop, h } from '@stencil/core';
import { v4 } from 'uuid';
import { ZodType } from 'zod';
import IMask, { InputMask } from 'imask';
@Component({
  tag: 'ir-price-input',
  styleUrl: 'ir-price-input.css',
  scoped: true,
})
export class IrPriceInput {
  @Element() el: HTMLIrPriceInputElement;

  /** The label for the input, optional */
  @Prop() label?: string;
  /** The readonly for the input, optional */
  @Prop() readOnly?: boolean;

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
  @Prop({ mutable: true }) error: boolean;

  /** Emits the current value on change */
  @Event() textChange: EventEmitter<string>;

  /** Emits the current value on blur */
  @Event() inputBlur: EventEmitter<string>;

  /** Emits the current value on focus */
  @Event() inputFocus: EventEmitter<void>;

  private id: string;

  private opts = {
    mask: Number,
    scale: 2,
    radix: '.',
    mapToRadix: [','],
    normalizeZeros: true,
    padFractionalZeros: true,
    thousandsSeparator: ',',
  };
  private mask: InputMask<any>;
  private inputRef: HTMLInputElement;

  componentWillLoad() {
    if (this.el.id) {
      this.id = this.el.id;
    } else {
      this.id = v4();
    }
  }

  componentDidLoad() {
    if (!this.mask) {
      this.initializeMask();
    }
  }

  private initializeMask() {
    // Create options object with min/max if provided
    const maskOpts = {
      ...this.opts,
    };

    if (this.minValue !== undefined) {
      maskOpts['min'] = this.minValue;
    }

    if (this.maxValue !== undefined) {
      maskOpts['max'] = this.maxValue;
    }

    this.mask = IMask(this.inputRef, maskOpts);

    // Set initial value if provided
    if (this.value) {
      this.mask.value = this.value;
    }

    this.mask.on('accept', () => {
      const isEmpty = this.inputRef.value.trim() === '' || this.mask.unmaskedValue === '';
      if (isEmpty) {
        this.value = '';
        this.textChange.emit(null);
      } else {
        this.value = this.mask.unmaskedValue;
        this.textChange.emit(this.value);
      }
    });
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

  private handleInputChange = (): void => {
    // The value is already being updated by the mask's 'accept' event
    // Just validate here if needed
    this.validateInput(this.value);
  };

  private handleBlur = (): void => {
    this.validateInput(this.value);

    // Format to 2 decimal places on blur
    if (this.value) {
      const numValue = parseFloat(this.value);
      this.value = numValue.toFixed(2);

      // Update the mask value to show the formatted value
      if (this.mask) {
        this.mask.value = this.value;
      }
    }

    // Emit the blur event
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
              <label class={'p-0 m-0'} htmlFor={this.id}>
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
            ref={el => (this.inputRef = el)}
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
            type="text"
            placeholder={this.placeholder}
            readOnly={this.readOnly}
            aria-label={this.el.ariaLabel ?? 'price-input'}
            aria-describedby={this.el.ariaDescription ?? 'price-input'}
          />
        </div>
      </fieldset>
    );
  }
}
