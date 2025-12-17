import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import IMask, { FactoryArg, InputMask } from 'imask';
import { masks } from './countries_masks';
import { ICountry } from '@/models/IBooking';
import { NativeWaInput } from '../ir-input/ir-input';

export interface IrMobileInputChangeDetail {
  country: ICountry;
  value: string;
  formattedValue: string;
}

@Component({
  tag: 'ir-mobile-input',
  styleUrls: ['ir-mobile-input.css'],
  shadow: true,
})
export class IrMobileInput {
  private static idCounter = 0;
  private readonly componentId = ++IrMobileInput.idCounter;
  private readonly inputId = `ir-mobile-input-${this.componentId}`;
  private readonly labelId = `${this.inputId}-label`;
  private readonly descriptionId = `${this.inputId}-description`;
  private readonly errorId = `${this.inputId}-error`;
  private readonly countryStatusId = `${this.inputId}-country-status`;

  private inputRef?: HTMLInputElement;
  private mask?: InputMask<any>;

  /** The input's size. */
  @Prop({ reflect: true }) size: NativeWaInput['size'] = 'small';
  /** Visible label for the phone input */
  @Prop() label: string = 'Phone number';
  /** Name attribute passed to the native input */
  @Prop() name: string = 'phone';
  /** Placeholder shown when the input is empty */
  @Prop() placeholder: string = 'Enter phone number';
  /** Help text rendered under the label */
  @Prop() description?: string;
  /** Error message announced to screen readers */
  @Prop() error?: string;
  /** Native required attribute */
  @Prop({ reflect: true }) required: boolean = false;
  /** Whether the control is disabled */
  @Prop({ reflect: true }) disabled: boolean = false;
  /** Selected country ISO code. Component updates this prop when a new country is chosen */
  @Prop({ mutable: true, reflect: true }) countryCode?: string;
  /** Input value without formatting. Component keeps this prop in sync */
  @Prop({ mutable: true, reflect: true }) value: string = '';
  /**
   * Country list, used to populate prefix and dropdown.
   * If not provided, fetched from the booking service.
   */
  @Prop({ mutable: true }) countries: ICountry[] = [];

  @Event({ eventName: 'mobile-input-change' }) mobileInputChange!: EventEmitter<IrMobileInputChangeDetail>;
  @Event({ eventName: 'mobile-input-country-change' }) mobileInputCountryChange!: EventEmitter<ICountry>;

  @State() selectedCountry?: ICountry;
  @State() displayValue: string = '';

  componentWillLoad() {
    const resolvedCountry: ICountry | null = this.resolveCountry(this.countryCode) ?? null;
    if (!resolvedCountry) {
      return;
    }
    this.selectedCountry = resolvedCountry;
    this.countryCode = resolvedCountry?.code;
    this.displayValue = this.value ?? '';
  }

  componentDidLoad() {
    requestAnimationFrame(() => this.initializeMask());
  }

  disconnectedCallback() {
    this.destroyMask();
  }

  @Watch('countryCode')
  protected handleCountryCodeChange(nextCode?: string) {
    const resolvedCountry = this.resolveCountry(nextCode);
    if (resolvedCountry && resolvedCountry !== this.selectedCountry) {
      this.selectedCountry = resolvedCountry;
    }
  }

  @Watch('selectedCountry')
  protected handleSelectedCountryChange(next?: ICountry, previous?: ICountry) {
    if (!next) return;
    if (!previous || next.code !== previous.code) {
      if (this.countryCode !== next.code) {
        this.countryCode = next.code;
      }
      this.rebuildMask();
      this.mobileInputCountryChange.emit(next);
    }
  }

  @Watch('value')
  protected handleValueChange(newValue: string, oldValue: string) {
    // if (newValue === oldValue) return;
    // if (this.mask) {
    //   if (this.mask.unmaskedValue !== (newValue ?? '')) {
    //     this.mask.unmaskedValue = newValue ?? '';
    //   }
    //   this.displayValue = this.mask.value;
    // } else {
    //   this.displayValue = newValue ?? '';
    //   if (this.inputRef && this.inputRef.value !== this.displayValue) {
    //     this.inputRef.value = this.displayValue;
    //   }
    // }
    if (newValue !== oldValue) {
      if (this.mask) {
        this.mask.value = newValue;
      }
    }
  }

  private resolveCountry(code?: string) {
    if (!code) return undefined;
    return this.countries.find(country => country.code.toUpperCase() === code.toUpperCase());
  }

  private initializeMask() {
    if (!this.inputRef) return;
    const maskConfig = this.buildMaskOptions(this.selectedCountry);
    if (!maskConfig) {
      this.destroyMask();
      return;
    }
    this.mask = IMask(this.inputRef, maskConfig as FactoryArg);
    if (this.value) {
      this.mask.unmaskedValue = this.value;
    }
    this.displayValue = this.mask.value;
    this.mask.on('accept', () => {
      if (!this.mask) return;
      const nextValue = this.mask.unmaskedValue ?? '';
      if (nextValue !== this.value) {
        this.value = nextValue;
      }
      this.displayValue = this.mask.value;
      this.emitChange();
    });
  }

  private rebuildMask() {
    this.destroyMask();
    this.initializeMask();
  }

  private destroyMask() {
    if (this.mask) {
      this.mask.destroy();
      this.mask = undefined;
    }
    this.displayValue = this.value ?? '';
  }

  private buildMaskOptions(country?: ICountry) {
    if (!country) return undefined;
    const iso = country.code?.toUpperCase();
    if (!iso) return undefined;
    const rawMask = masks[iso];
    if (!rawMask) return undefined;

    const normalizePattern = (pattern: string) => pattern.replace(/#/g, '0');

    if (Array.isArray(rawMask)) {
      return {
        mask: rawMask.map(pattern => ({ mask: this.selectedCountry.phone_prefix + ' ' + normalizePattern(pattern) })),
        lazy: false,
        placeholderChar: '_',
      };
    }

    return {
      mask: this.selectedCountry.phone_prefix + ' ' + normalizePattern(rawMask),
      lazy: false,
      placeholderChar: '_',
    };
  }

  private emitChange() {
    if (!this.selectedCountry) return;
    this.mobileInputChange.emit({
      country: this.selectedCountry,
      value: this.value ?? '',
      formattedValue: this.displayValue ?? '',
    });
  }

  private handleCountrySelect = (event: CustomEvent) => {
    if (this.disabled) return;
    event.stopPropagation();
    event.stopImmediatePropagation();
    const value = (event.detail as any)?.item?.value;
    const selected = this.countries.find(country => country.id.toString() === `${value}`);
    if (selected) {
      this.selectedCountry = selected;
    }
    requestAnimationFrame(() => {
      this.inputRef?.focus();
    });
  };

  private handlePlainInput = (event: Event) => {
    if (this.mask) return;
    const nextValue = (event.target as HTMLInputElement)?.value ?? '';
    if (nextValue !== this.value) {
      this.value = nextValue;
      this.displayValue = nextValue;
      this.emitChange();
    }
  };

  render() {
    const describedByIds = [this.description ? this.descriptionId : null, this.error ? this.errorId : null].filter(Boolean).join(' ') || undefined;

    return (
      <Host size={'small'} role="group" aria-labelledby={this.labelId} aria-describedby={describedByIds}>
        <label class="mobile-input__label" id={this.labelId} htmlFor={this.inputId}>
          {this.label}
          {this.required ? (
            <span class="mobile-input__required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {this.description ? (
          <p id={this.descriptionId} class="mobile-input__description">
            {this.description}
          </p>
        ) : null}
        <div class={{ 'mobile-input__container': true, 'mobile-input__container--disabled': this.disabled }}>
          <wa-dropdown
            onwa-show={e => {
              e.stopPropagation();
              e.stopImmediatePropagation();
            }}
            onwa-hide={e => {
              e.stopPropagation();
              e.stopImmediatePropagation();
            }}
            onwa-select={this.handleCountrySelect}
            class="mobile-input__prefix-dropdown"
          >
            <button slot="trigger" type="button" class="mobile-input__trigger" disabled={this.disabled} aria-haspopup="listbox" aria-label="Change country calling code">
              <div class="mobile-input__phone-country" style={{ marginRight: '1rem' }}>
                {this.selectedCountry ? <img src={this.selectedCountry?.flag} alt={this.selectedCountry?.name} class="mobile-input__logo" /> : <span>Select</span>}
                {/* <span aria-hidden="true">{this.selectedCountry?.phone_prefix}</span> */}
              </div>
              <wa-icon class="mobile-input__phone-country-caret" name="chevron-down" aria-hidden="true"></wa-icon>
            </button>
            <span class="sr-only" id={this.countryStatusId} aria-live="polite">
              {this.selectedCountry ? `Selected country ${this.selectedCountry.name} ${this.selectedCountry.phone_prefix}` : 'Select a country'}
            </span>
            {this.countries.map(country => (
              <wa-dropdown-item value={country.id.toString()}>
                <div class="mobile-input__phone-country" role="option" aria-selected={this.selectedCountry?.id === country.id ? 'true' : 'false'}>
                  <img src={country.flag} alt={country.name} class="mobile-input__logo" />
                  <span class="mobile-input__country-name">{country.name}</span>
                  <span class="mobile-input__country-prefix">{country.phone_prefix}</span>
                </div>
              </wa-dropdown-item>
            ))}
          </wa-dropdown>
          <input
            ref={el => (this.inputRef = el)}
            id={this.inputId}
            class={{
              'mobile-input__phone': true,
              'mobile-input__phone--invalid': Boolean(this.error),
            }}
            name={this.name}
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            aria-required={this.required ? 'true' : undefined}
            aria-invalid={this.error ? 'true' : 'false'}
            aria-describedby={describedByIds}
            disabled={this.disabled}
            placeholder={this.placeholder}
            value={this.displayValue}
            onInput={this.handlePlainInput}
          />
        </div>
        {this.error ? (
          <p id={this.errorId} class="mobile-input__error" role="alert">
            {this.error}
          </p>
        ) : null}
      </Host>
    );
  }
}
