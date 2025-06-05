import { ICountry } from '@/components';
import { BookingService } from '@/services/booking.service';
import locales from '@/stores/locales.store';
import { Component, Element, Event, EventEmitter, Host, Listen, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-phone-input',
  styleUrl: 'ir-phone-input.css',
  scoped: true,
})
export class IrPhoneInput {
  @Element() el: HTMLElement;
  /**
   * Label displayed next to the phone input.
   */
  @Prop() label: string;

  /**
   * Initial phone number value.
   */
  @Prop() value: string = '';

  /**
   * Disables the phone input when true.
   */
  @Prop() disabled: boolean = false;

  /**
   * If true, styles the input to indicate an error state.
   */
  @Prop() error: boolean = false;

  /**
   * Auth token used by the booking service (if needed).
   */
  @Prop() token: string;

  /**
   * Two-letter language code used for country fetching.
   */
  @Prop() language: string;

  /**
   * Default country ID used if no phone prefix is set.
   */
  @Prop() default_country: number = null;

  /**
   * If provided, sets the phone prefix and updates selected country.
   */
  @Prop() phone_prefix: string | null = null;

  /**
   * Placeholder text for the input.
   */
  @Prop() placeholder: string;

  /**
   * Country list, used to populate prefix and dropdown.
   * If not provided, fetched from the booking service.
   */
  @Prop({ mutable: true }) countries: ICountry[] = [];

  /**
   * Identifier for test automation.
   */
  @Prop() testId: string;

  /**
   * Emits when the user changes the phone number.
   * Emits `{ phone_prefix, mobile }` object.
   *
   * Example:
   * ```tsx
   * <ir-phone-input onTextChange={(e) => console.log(e.detail)} />
   * ```
   */
  @Event() textChange: EventEmitter<{ phone_prefix: string; mobile: string }>;

  /**
   * Tracks current user input value.
   */
  @State() inputValue: string = '';

  /**
   * Tracks visibility of the country dropdown.
   */
  @State() isDropdownVisible: boolean = false;

  /**
   * Currently selected country (based on prefix or ID).
   */
  @State() currentCountry: ICountry;

  // private cmp_countries: ICountry[] = [];

  private bookingService: BookingService = new BookingService();

  async componentWillLoad() {
    if (this.countries.length === 0) {
      const countries = await this.bookingService.getCountries(this.language);
      this.countries = countries;
    }
    if (this.phone_prefix) {
      this.setCountryFromPhonePrefix();
    } else {
      if (this.default_country) {
        this.setCurrentCountry(this.default_country);
      }
    }
    this.inputValue = this.value;
  }
  @Watch('value')
  handleValueChange(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.inputValue = newValue;
    }
  }
  @Watch('phone_prefix')
  handlePhoneChange(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.setCountryFromPhonePrefix();
    }
  }
  @Listen('click', { target: 'document' })
  handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.el.contains(target)) {
      this.isDropdownVisible = false;
    }
  }
  /**
   * Handles user input:
   * - Removes all characters except numbers and "+"
   * - Updates state and emits new phone number
   */
  private handleInputChange(e: InputEvent) {
    let inputElement = e.target as HTMLInputElement;
    let inputValue = inputElement.value;
    inputValue = inputValue.replace(/[^+\d]+/g, '');
    inputElement.value = inputValue;
    this.inputValue = inputValue;
    this.textChange.emit({ phone_prefix: this.currentCountry?.phone_prefix, mobile: this.inputValue });
  }
  /**
   * Sets the current country based on `phone_prefix` prop or country ID.
   * Emits current phone prefix and phone number.
   */
  private setCountryFromPhonePrefix() {
    let country = this.countries.find(country => country.phone_prefix === this.phone_prefix);
    if (!country) {
      country = this.countries.find(c => c.id.toString() === this.phone_prefix);
      if (!country) {
        return;
      }
    }
    this.currentCountry = { ...country };
    this.textChange.emit({ phone_prefix: this.currentCountry?.phone_prefix, mobile: this.value });
  }
  /**
   * Sets the current country by its ID.
   * Emits current phone prefix and phone number.
   */
  private setCurrentCountry(id: number) {
    const country = this.countries.find(country => country.id === id);
    if (!country) {
      throw new Error('Invalid country id');
    }
    this.currentCountry = { ...country };
    this.textChange.emit({ phone_prefix: this.currentCountry?.phone_prefix, mobile: this.value });
  }
  render() {
    return (
      <Host>
        <div class="form-group mr-0">
          {/* <p class="mb-0">Phone</p> */}
          <div class="input-group row m-0 p-0 position-relative">
            {this.label && (
              <div class={`input-group-prepend col-3 p-0 text-dark border-none`}>
                <label class={`input-group-text  border-theme flex-grow-1 text-dark  `}>{this.label}</label>
              </div>
            )}
            <div class={'form-control  input-container  flex-fill' + (this.error ? ' is-invalid' : '')}>
              <button type="button" onClick={() => (this.isDropdownVisible = !this.isDropdownVisible)} class="dropdown-trigger">
                {this.currentCountry ? <img src={this.currentCountry?.flag} class="flag" /> : <p class="p-0 m-0 ">{locales.entries.Lcz_Select}</p>}
                <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                  <path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
                </svg>
              </button>

              <p class={'phone_prefix_label'}>{this.currentCountry?.phone_prefix}</p>
              <input
                data-testid={this.testId}
                maxLength={14}
                type="text"
                placeholder={this.placeholder}
                required
                value={this.inputValue}
                disabled={this.disabled}
                onInput={e => this.handleInputChange(e)}
              />
            </div>
            {this.isDropdownVisible && (
              <div class="ir-dropdown-container">
                <ir-combobox
                  onComboboxValueChange={e => {
                    this.setCurrentCountry(+e.detail.data);
                    this.isDropdownVisible = false;
                  }}
                  class="bg-white"
                  autoFocus
                  placeholder="Search country"
                  data={this.countries.map(c => ({
                    id: c.id.toString(),
                    name: `${c.name} (${c.phone_prefix})`,
                    image: c.flag,
                  }))}
                ></ir-combobox>
              </div>
            )}
          </div>
          {/* {this.error && <div class="invalid-feedback">Please enter a valid phone number.</div>} */}
        </div>
      </Host>
    );
  }
}
