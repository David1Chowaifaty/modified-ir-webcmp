import { ICountry } from '@/components';
import { BookingService } from '@/services/booking.service';
import { Component, Element, Event, EventEmitter, Host, Listen, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'ir-phone-input',
  styleUrl: 'ir-phone-input.css',
  scoped: true,
})
export class IrPhoneInput {
  @Element() el: HTMLElement;
  @Prop() label: string;
  @Prop() value: string = '';
  @Prop() disabled: boolean = false;
  @Prop() error: boolean = false;
  @Prop() token: string;
  @Prop() language: string;
  @Prop() default_country: number = null;
  @Prop() phone_prefix: string | null = null;

  @Event() textChange: EventEmitter<{ phone_prefix: string; mobile: string }>;
  @State() inputValue: string = '';
  @State() isDropdownVisible: boolean = false;
  @State() currentCountry: ICountry;

  private countries: ICountry[] = [];

  private bookingService: BookingService = new BookingService();

  async componentWillLoad() {
    if (!this.token) {
      throw new Error('Missing token');
    }
    this.bookingService.setToken(this.token);
    const countries = await this.bookingService.getCountries(this.language);
    this.countries = countries;
    if (this.phone_prefix) {
      this.setCountryFromPhonePrefix();
    } else {
      if (this.default_country) {
        this.setCurrentCountry(this.default_country);
      }
    }
    this.inputValue = this.value;
  }
  @Listen('click', { target: 'document' })
  handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.el.contains(target)) {
      this.isDropdownVisible = false;
    }
  }
  handleInputChange(e: InputEvent) {
    let inputElement = e.target as HTMLInputElement;
    let inputValue = inputElement.value;
    inputValue = inputValue.replace(/[^+\d]+/g, '');
    inputElement.value = inputValue;
    this.inputValue = inputValue;
    this.textChange.emit({ phone_prefix: this.currentCountry?.phone_prefix, mobile: this.inputValue });
  }
  setCountryFromPhonePrefix() {
    const country = this.countries.find(country => country.phone_prefix === this.phone_prefix);
    if (!country) {
      throw new Error('Invalid country id');
    }
    this.currentCountry = { ...country };
    this.textChange.emit({ phone_prefix: this.currentCountry?.phone_prefix, mobile: this.value });
  }
  setCurrentCountry(id: number) {
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
              <button onClick={() => (this.isDropdownVisible = !this.isDropdownVisible)} class="dropdown-trigger">
                <img src={this.currentCountry?.flag} class="flag" />
                <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                  <path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
                </svg>
              </button>

              <label>{this.currentCountry?.phone_prefix}</label>
              <input type="text" required value={this.inputValue} disabled={this.disabled} onInput={e => this.handleInputChange(e)} />
            </div>{' '}
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
                  }))}
                ></ir-combobox>
              </div>
            )}
          </div>
          {this.error && <div class="invalid-feedback">Please enter a valid phone number.</div>}
        </div>
      </Host>
    );
  }
}
