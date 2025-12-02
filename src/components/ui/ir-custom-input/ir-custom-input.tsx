import WaInput from '@awesome.me/webawesome/dist/components/input/input';
import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { masks } from './masks';
import IMask, { FactoryArg, InputMask } from 'imask';

export type MaskName = keyof typeof masks;
export type MaskConfig<N extends MaskName = MaskName> = (typeof masks)[N];
export type MaskProp = MaskName | MaskConfig | FactoryArg;
export type NativeWaInput = WaInput;

@Component({
  tag: 'ir-custom-input',
  styleUrls: ['ir-custom-input.css', '../../../global/app.css'],
  shadow: false,
})
export class IrCustomInput {
  /** The value of the input. */
  @Prop({ reflect: true, mutable: true }) value: string = '';

  /**
   * The type of input. Works the same as a native `<input>` element, but only a subset of types are supported. Defaults
   * to `text`.
   */
  @Prop({ reflect: true }) type: NativeWaInput['type'] = 'text';

  /** The default value of the form control. Primarily used for resetting the form control. */
  @Prop({ reflect: true }) defaultValue: NativeWaInput['defaultValue'];

  /** The input's size. */
  @Prop({ reflect: true }) size: NativeWaInput['size'];

  /** The input's visual appearance. */
  @Prop({ reflect: true }) appearance: NativeWaInput['appearance'];

  /** Draws a pill-style input with rounded edges. */
  @Prop({ reflect: true }) pill: NativeWaInput['pill'];

  /** The input's label. If you need to display HTML, use the `label` slot instead. */
  @Prop({ reflect: true }) label: NativeWaInput['label'];

  /** The input's hint. If you need to display HTML, use the `hint` slot instead. */
  @Prop({ reflect: true }) hint: NativeWaInput['hint'];

  /** Adds a clear button when the input is not empty. */
  @Prop({ reflect: true }) withClear: NativeWaInput['withClear'];

  /** Placeholder text to show as a hint when the input is empty. */
  @Prop({ reflect: true }) placeholder: NativeWaInput['placeholder'];

  /** Makes the input readonly. */
  @Prop({ reflect: true }) readonly: NativeWaInput['readonly'];

  /** Adds a button to toggle the password's visibility. Only applies to password types. */
  @Prop({ reflect: true }) passwordToggle: NativeWaInput['passwordToggle'];

  /** Determines whether or not the password is currently visible. Only applies to password input types. */
  @Prop({ reflect: true }) passwordVisible: NativeWaInput['passwordVisible'];

  /** Hides the browser's built-in increment/decrement spin buttons for number inputs. */
  @Prop({ reflect: true }) withoutSpinButtons: NativeWaInput['withoutSpinButtons'];

  /**
   * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
   * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
   * the same document or shadow root for this to work.
   */
  @Prop({ reflect: true }) form: NativeWaInput['form'];

  /** Makes the input a required field. */
  @Prop({ reflect: true }) required: NativeWaInput['required'];

  /** A regular expression pattern to validate input against. */
  @Prop() pattern: NativeWaInput['pattern'];

  /** The minimum length of input that will be considered valid. */
  @Prop() minlength: NativeWaInput['minlength'];

  /** The maximum length of input that will be considered valid. */
  @Prop() maxlength: NativeWaInput['maxlength'];

  /** The input's minimum value. Only applies to date and number input types. */
  @Prop() min: NativeWaInput['min'];

  /** The input's maximum value. Only applies to date and number input types. */
  @Prop() max: NativeWaInput['max'];

  /**
   * Specifies the granularity that the value must adhere to, or the special value `any` which means no stepping is
   * implied, allowing any numeric value. Only applies to date and number input types.
   */
  @Prop() step: NativeWaInput['step'];

  /** Controls whether and how text input is automatically capitalized as it is entered by the user. */
  @Prop() autocapitalize: NativeWaInput['autocapitalize'];

  /** Indicates whether the browser's autocorrect feature is on or off. */
  @Prop() autocorrect: NativeWaInput['autocorrect'];

  /**
   * Specifies what permission the browser has to provide assistance in filling out form field values. Refer to
   * [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for available values.
   */
  @Prop() autocomplete: NativeWaInput['autocomplete'];

  /** Indicates that the input should receive focus on page load. */
  @Prop() autofocus: NativeWaInput['autofocus'];

  /** Used to customize the label or icon of the Enter key on virtual keyboards. */
  @Prop() enterkeyhint: NativeWaInput['enterkeyhint'];

  /** Enables spell checking on the input. */
  @Prop() spellcheck: NativeWaInput['spellcheck'];

  /**
   * Tells the browser what type of data will be entered by the user, allowing it to display the appropriate virtual
   * keyboard on supportive devices.
   */
  @Prop() inputmode: NativeWaInput['inputmode'];

  /**
   * Used for SSR. Will determine if the SSRed component will have the label slot rendered on initial paint.
   */
  @Prop() withLabel: NativeWaInput['withLabel'];

  /**
   * Used for SSR. Will determine if the SSRed component will have the hint slot rendered on initial paint.
   */
  @Prop() withHint: NativeWaInput['withHint'];

  /** Mask for the input field (optional) */
  @Prop() mask: MaskProp;

  @Event({ bubbles: true, composed: true, eventName: 'text-change' }) textChange: EventEmitter<string>;
  @Event({ bubbles: true, composed: true, eventName: 'input-blur' }) inputBlur: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) inputFocus: EventEmitter<void>;

  @State() private isValid: boolean = true;

  private _mask?: InputMask<any>;
  private inputRef: WaInput;
  private animationFrame: number;

  componentDidLoad() {
    // Find the closest form element (if any)
    // track slotted prefix to compute width
    this.initializeMask();
  }
  disconnectedCallback() {
    this.destroyMask();
  }

  @Watch('mask')
  @Watch('min')
  @Watch('max')
  protected handleMaskPropsChange() {
    if (!this.inputRef) return;
    const hasMask = Boolean(this.resolveMask());
    if (!hasMask) {
      this.destroyMask();
      return;
    }
    this.rebuildMask();
  }

  @Watch('value')
  protected handleValueChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      if (this._mask) {
        this._mask.value = newValue;
      }
    }
  }

  @Watch('aria-invalid')
  handleAriaInvalidChange(e) {
    this.isValid = !JSON.parse(e);
  }
  private handleInput = (nextValue: string) => {
    this.value = nextValue ?? '';
    this.textChange.emit(this.value);
  };

  // private initializeMask() {
  //   if (!this.inputRef) return;
  //   const maskOpts = this.buildMaskOptions();
  //   if (!maskOpts) return;
  //   this.animationFrame = requestAnimationFrame(() => {
  //     this._mask = IMask(this.inputRef.input, maskOpts);

  //     if (this.value) {
  //       this._mask.unmaskedValue = this.value;
  //     }

  //     this._mask.on('accept', () => {
  //       if (!this._mask) return;
  //       const isEmpty = this.inputRef.value.trim() === '' || this._mask.unmaskedValue === '';
  //       this.handleInput(isEmpty ? '' : this._mask.unmaskedValue);
  //     });
  //   });
  // }
  private async initializeMask() {
    if (!this.inputRef) return;

    const maskOpts = this.buildMaskOptions();
    if (!maskOpts) return;

    await customElements.whenDefined('wa-input'); // optional, but explicit
    await (this.inputRef as WaInput & { updateComplete: Promise<WaInput> }).updateComplete;

    const nativeInput = this.inputRef.input;
    if (!nativeInput) return;

    this._mask = IMask(nativeInput, maskOpts);
    if (this.value) {
      this._mask.unmaskedValue = this.value;
    }
    this._mask.on('accept', () => {
      if (!this._mask) return;
      const isEmpty = this.inputRef.value.trim() === '' || this._mask.unmaskedValue === '';
      console.log(this._mask.unmaskedValue);
      this.handleInput(isEmpty ? '' : this._mask.unmaskedValue);
    });
  }

  private rebuildMask() {
    this.destroyMask();
    this.initializeMask();
  }

  private destroyMask() {
    this._mask?.destroy();
    this._mask = undefined;
    this.clearAnimationFrame();
  }
  private clearAnimationFrame() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = undefined;
    }
  }
  private buildMaskOptions() {
    const resolvedMask = this.resolveMask();
    if (!resolvedMask) return;

    const maskOpts: Record<string, any> = typeof resolvedMask === 'object' && resolvedMask !== null && !Array.isArray(resolvedMask) ? { ...resolvedMask } : { mask: resolvedMask };

    if (this.min !== undefined) {
      maskOpts.min = this.min;
    }
    if (this.max !== undefined) {
      maskOpts.max = this.max;
    }

    return maskOpts;
  }

  private resolveMask() {
    if (!this.mask) return;
    if (typeof this.mask === 'string') return masks[this.mask];
    return this.mask;
  }

  private handleChange = (e: CustomEvent) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (!this.mask) this.handleInput((e.target as any).value);
  };
  private handleClear = (e: CustomEvent) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (this._mask) {
      this._mask.value = '';
    }
    this.handleInput('');
  };
  private handleBlur = (e: CustomEvent) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.inputBlur.emit();
  };
  private handleFocus = (e: CustomEvent) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.inputFocus.emit();
  };

  render() {
    return (
      <Host>
        <wa-input
          type={this.type}
          value={this.value}
          ref={el => (this.inputRef = el)}
          defaultValue={this.defaultValue}
          size={this.size}
          appearance={this.appearance}
          pill={this.pill}
          aria-invalid={String(!this.isValid)}
          label={this.label}
          hint={this.hint}
          withClear={this.withClear}
          placeholder={this.placeholder}
          readonly={this.readonly}
          passwordToggle={this.passwordToggle}
          passwordVisible={this.passwordVisible}
          withoutSpinButtons={this.withoutSpinButtons}
          form={this.form}
          required={this.required}
          pattern={this.pattern}
          minlength={this.minlength}
          maxlength={this.maxlength}
          min={this.min}
          max={this.max}
          step={this.step}
          autocapitalize={this.autocapitalize}
          autocorrect={this.autocorrect}
          autocomplete={this.autocomplete}
          autofocus={this.autofocus}
          enterkeyhint={this.enterkeyhint}
          spellcheck={this.spellcheck}
          inputmode={this.inputmode}
          withLabel={this.withLabel}
          withHint={this.withHint}
          onchange={this.handleChange}
          onwa-clear={this.handleClear}
          onblur={this.handleBlur}
          onfocus={this.handleFocus}
        >
          <slot name="label" slot="label"></slot>
          <slot name="start" slot="start"></slot>
          <slot name="end" slot="end"></slot>
          <slot name="clear-icon" slot="clear-icon"></slot>
          <slot name="hide-password-icon" slot="hide-password-icon"></slot>
          <slot name="show-password-icon" slot="show-password-icon"></slot>
          <slot name="hint" slot="hint"></slot>
        </wa-input>
      </Host>
    );
  }
}
