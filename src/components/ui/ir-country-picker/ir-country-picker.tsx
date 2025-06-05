import { ICountry } from '@/models/IBooking';
import { Component, Event, EventEmitter, Fragment, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-country-picker',
  styleUrl: 'ir-country-picker.css',
  scoped: true,
})
export class IrCountryPicker {
  /**
   * List of countries to display in the dropdown.
   */
  @Prop() countries: ICountry[] = [];

  /**
   * Currently selected country.
   */
  @Prop() country: ICountry;

  /**
   * Whether to show an error state on the input.
   */
  @Prop({ mutable: true }) error: boolean;

  /**
   * The property-associated country, shown separately if relevant.
   */
  @Prop() propertyCountry: ICountry;

  /**
   * The label to display for the input.
   */
  @Prop() label: string;

  /**
   * Test ID for automated testing.
   */
  @Prop() testId: string;

  /**
   * Whether to automatically validate the input.
   */
  @Prop() autoValidate: boolean = false;

  /**
   * The current input value typed by the user.
   */
  @State() inputValue: string;

  /**
   * The currently selected country object.
   */
  @State() selectedCountry: ICountry;

  /**
   * Filtered list of countries based on the user's input.
   */
  @State() filteredCountries: ICountry[] = [];

  /**
   * Whether the input is currently being used for searching.
   */
  @State() searching: boolean = false;

  /**
   * Event emitted when a country is selected.
   */
  @Event() countryChange: EventEmitter<ICountry>;

  private debounceTimeout: NodeJS.Timeout;

  componentWillLoad() {
    this.filteredCountries = [...this.countries];
    if (this.country) {
      this.inputValue = this.country.name;
      this.selectedCountry = this.country;
    }
  }

  @Watch('country')
  handleCountryChange(newCountry: ICountry, oldCountry: ICountry) {
    if (newCountry?.id !== oldCountry?.id) {
      this.inputValue = this.country?.name;
      this.selectedCountry = newCountry;
    }
  }
  /**
   * Filters the list of countries based on the current input.
   */
  private filterCountries() {
    if (this.inputValue === '' && this.country) {
      this.selectCountry(null);
    }
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      if (!this.inputValue) {
        this.filteredCountries = [...this.countries];
      } else {
        this.filteredCountries = this.countries.filter(c => c.name.toLowerCase().includes(this.inputValue.toLowerCase()));
      }
    }, 300);
  }
  /**
   * Selects a country and emits the change event.
   */
  private selectCountry(c: ICountry | null) {
    this.selectedCountry = c;
    this.inputValue = c?.name;
    this.filteredCountries = [...this.countries];
    this.countryChange.emit(c);
  }
  /**
   * Scrolls to the selected country in the dropdown for accessibility.
   */
  private scrollToSelected() {
    setTimeout(() => {
      const dropdownItem = document.querySelector(`.dropdown-item.active`);
      if (dropdownItem) {
        dropdownItem.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    }, 100);
  }
  render() {
    const shouldShowPropertyCountry = this.filteredCountries.length > 0 && this.propertyCountry && (!this.searching || (this.searching && this.inputValue === ''));
    return (
      <form class="dropdown m-0 p-0">
        <ir-input-text
          onTextChange={e => {
            if (!this.searching) {
              this.searching = true;
            }
            this.inputValue = e.detail;
            this.filterCountries();
          }}
          testId={this.testId}
          autoValidate={this.autoValidate}
          label={this.label}
          error={this.error}
          placeholder=""
          class="m-0 p-0"
          value={this.inputValue}
          id="dropdownMenuCombobox"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          onInputFocus={() => this.scrollToSelected()}
          onInputBlur={() => {
            this.searching = false;
            if (this.filteredCountries.length > 0 && this.inputValue && this.inputValue.trim() !== '') {
              this.selectCountry(this.filteredCountries[0]);
            }
          }}
        ></ir-input-text>

        <div class="dropdown-menu combobox-menu" aria-labelledby="dropdownMenuCombobox">
          {shouldShowPropertyCountry && (
            <Fragment>
              <button
                type="button"
                class={`dropdown-item d-flex align-items-center ${this.selectedCountry?.id === this.propertyCountry.id ? 'active' : ''}`}
                onClick={() => {
                  this.selectCountry(this.propertyCountry);
                }}
              >
                <img src={this.propertyCountry.flag} alt={this.propertyCountry.name} style={{ aspectRatio: '1', height: '15px', borderRadius: '4px' }} />
                <p class="pl-1 m-0">{this.propertyCountry.name}</p>
              </button>
              <div class="dropdown-divider"></div>
            </Fragment>
          )}
          {this.filteredCountries?.map(c => (
            <button
              key={c.id}
              type="button"
              class={`dropdown-item d-flex align-items-center ${this.selectedCountry?.id === c.id ? 'active' : ''}`}
              onClick={() => {
                this.selectCountry(c);
              }}
            >
              <img src={c.flag} alt={c.name} style={{ aspectRatio: '1', height: '15px', borderRadius: '4px' }} />
              <p class="pl-1 m-0">{c.name}</p>
            </button>
          ))}
          {this.filteredCountries?.length === 0 && <p class="dropdown-item-text">Invalid Country</p>}
        </div>
      </form>
    );
  }
}
