import { Component, Event, EventEmitter, h, Host, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'ir-otp',
  styleUrl: 'ir-otp.css',
  scoped: true,
})
export class IrOtp {
  /**
   * The length of the OTP code
   */
  @Prop() length: number = 6;

  /**
   * Whether the input is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Placeholder character to display
   */
  @Prop() placeholder: string = '';

  /**
   * Input type - can be 'text', 'password', 'number', or 'tel'
   */
  @Prop() type: 'text' | 'password' | 'number' | 'tel' = 'number';

  /**
   * Auto focus on the first input when component loads
   */
  @Prop() autoFocus: boolean = true;

  /**
   * Whether to mask the input (show dots instead of text)
   */
  @Prop() secure: boolean = false;

  /**
   * Allow only numbers (0-9) as input
   */
  @Prop() numbersOnly: boolean = false;

  /**
   * Event emitted when the OTP value changes
   */
  @Event() otpChange: EventEmitter<string>;

  /**
   * Event emitted when the OTP is complete
   */
  @Event() otpComplete: EventEmitter<string>;

  /**
   * Current OTP value as an array of characters
   */
  @State() otpValues: string[] = [];

  /**
   * Reference to input elements
   */
  private inputRefs: HTMLInputElement[] = [];

  /**
   * Initialize the component
   */
  componentWillLoad() {
    this.otpValues = Array(this.length).fill('');
  }

  /**
   * Focus the first input after component renders
   */
  componentDidLoad() {
    if (this.autoFocus && this.inputRefs[0]) {
      setTimeout(() => {
        this.inputRefs[0].focus();
      }, 0);
    }
  }

  /**
   * Watch for length changes and update the OTP values array
   */
  @Watch('length')
  handleLengthChange(newLength: number) {
    if (newLength < 1) return;

    const oldLength = this.otpValues.length;

    if (newLength > oldLength) {
      // Add empty slots
      this.otpValues = [...this.otpValues, ...Array(newLength - oldLength).fill('')];
    } else if (newLength < oldLength) {
      // Remove extra slots
      this.otpValues = this.otpValues.slice(0, newLength);
    }

    this.emitChanges();
  }

  /**
   * Update the current OTP value at the specified index
   */
  handleInput = (event: Event, index: number) => {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // For number input type, restrict to digits only
    if (this.numbersOnly) {
      value = value.replace(/[^0-9]/g, '');
    }

    // Take only the last character if someone enters multiple
    if (value.length > 1) {
      value = value.slice(-1);
      input.value = value;
    }

    this.otpValues[index] = value;
    this.emitChanges();

    // Move to next input if this one is filled
    if (value && index < this.length - 1) {
      this.inputRefs[index + 1].focus();
    }
  };

  /**
   * Handle keyboard navigation
   */
  handleKeyDown = (event: KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'Backspace':
        if (!this.otpValues[index] && index > 0) {
          // If current field is empty and backspace is pressed, go to previous field
          this.inputRefs[index - 1].focus();
          // Prevent default to avoid browser navigation
          event.preventDefault();
        }
        break;
      case 'Delete':
        // Clear current input on delete
        this.otpValues[index] = '';
        this.emitChanges();
        break;
      case 'ArrowLeft':
        // Move to previous input on left arrow
        if (index > 0) {
          this.inputRefs[index - 1].focus();
          event.preventDefault();
        }
        break;
      case 'ArrowRight':
        // Move to next input on right arrow
        if (index < this.length - 1) {
          this.inputRefs[index + 1].focus();
          event.preventDefault();
        }
        break;
      case 'Home':
        // Move to first input
        this.inputRefs[0].focus();
        event.preventDefault();
        break;
      case 'End':
        // Move to last input
        this.inputRefs[this.length - 1].focus();
        event.preventDefault();
        break;
    }
  };

  /**
   * Handle paste event to populate the OTP fields
   */
  handlePaste = (event: ClipboardEvent, index: number) => {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';

    // If numbersOnly is enabled, filter non-number characters
    const filteredData = this.numbersOnly ? pastedData.replace(/[^0-9]/g, '') : pastedData;

    // Fill OTP values with pasted data
    for (let i = 0; i < Math.min(filteredData.length, this.length - index); i++) {
      this.otpValues[index + i] = filteredData[i];
    }

    // Update inputs with new values
    this.inputRefs.forEach((input, idx) => {
      input.value = this.otpValues[idx] || '';
    });

    // Focus on the next empty input or the last one
    const nextEmptyIndex = this.otpValues.findIndex(val => !val);
    if (nextEmptyIndex !== -1 && nextEmptyIndex < this.length) {
      this.inputRefs[nextEmptyIndex].focus();
    } else {
      this.inputRefs[this.length - 1].focus();
    }

    this.emitChanges();
  };

  /**
   * Focus handler to select all text when focused
   */
  handleFocus = (event: FocusEvent) => {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      setTimeout(() => input.select(), 0);
    }
  };

  /**
   * Helper method to emit change events
   */
  private emitChanges() {
    const otpValue = this.otpValues.join('');
    this.otpChange.emit(otpValue);

    // If all fields are filled, trigger the complete event
    if (this.otpValues.every(val => val !== '') && this.otpValues.length === this.length) {
      this.otpComplete.emit(otpValue);
    }
  }

  /**
   * Manually clear all inputs
   */
  public clear() {
    this.otpValues = Array(this.length).fill('');
    this.inputRefs.forEach(input => {
      input.value = '';
    });
    this.emitChanges();

    // Focus the first input after clearing
    if (this.inputRefs[0]) {
      this.inputRefs[0].focus();
    }
  }

  /**
   * Set OTP values programmatically
   */
  public setValue(value: string) {
    const valueArray = value.split('');

    for (let i = 0; i < this.length; i++) {
      this.otpValues[i] = i < valueArray.length ? valueArray[i] : '';
    }

    // Update the actual input elements
    this.inputRefs.forEach((input, idx) => {
      input.value = this.otpValues[idx] || '';
    });

    this.emitChanges();
  }

  render() {
    return (
      <Host class="otp-input-container">
        <div class="otp-input-wrapper">
          {Array(this.length)
            .fill(null)
            .map((_, index) => (
              <input
                ref={el => (this.inputRefs[index] = el as HTMLInputElement)}
                type={this.type}
                inputmode={this.numbersOnly ? 'numeric' : 'text'}
                class="otp-digit form-control input-sm"
                maxlength="1"
                placeholder={this.placeholder}
                disabled={this.disabled}
                autocomplete="one-time-code"
                value={this.otpValues[index]}
                onInput={e => this.handleInput(e, index)}
                onKeyDown={e => this.handleKeyDown(e, index)}
                onPaste={e => this.handlePaste(e, index)}
                onFocus={this.handleFocus}
                aria-label={`Digit ${index + 1} of ${this.length}`}
              />
            ))}
        </div>
      </Host>
    );
  }
}
