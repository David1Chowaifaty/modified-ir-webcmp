import { ICountry } from '@/models/IBooking';
import { Component, Event, EventEmitter, Fragment, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-country-picker',
  styleUrl: 'ir-country-picker.css',
  scoped: true,
})
export class IrCountryPicker {
  @Prop() countries: ICountry[] = [];
  @Prop() country: ICountry;
  @Prop({ mutable: true }) error: boolean;
  @Prop() propertyCountry: ICountry;

  @State() inputValue: string;
  @State() selectedCountry: ICountry;
  @State() filteredCountries: ICountry[] = [];
  @State() searching: boolean = false;

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
      this.inputValue = this.country.name;
      this.selectedCountry = newCountry;
    }
  }

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

  private selectCountry(c: ICountry | null) {
    this.selectedCountry = c;
    this.inputValue = c.name;
    this.filteredCountries = [...this.countries];
    this.countryChange.emit(c);
  }
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
          error={this.error}
          placeholder=""
          class="m-0 p-0"
          value={this.inputValue}
          id="dropdownMenuCombobox"
          LabelAvailable={false}
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          onInputFocus={() => this.scrollToSelected()}
          onInputBlur={() => (this.searching = false)}
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
