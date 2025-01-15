import { ICountry } from '@/models/IBooking';
import { Component, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-country-picker',
  styleUrl: 'ir-country-picker.css',
  scoped: true,
})
export class IrCountryPicker {
  @Prop() countries: ICountry[] = [];
  @Prop() country: ICountry;
  @Prop({ mutable: true }) error: boolean;

  @State() inputValue: string;
  @State() selectedCountry: ICountry;
  @State() filteredCountries: ICountry[] = [];

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
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      if (!this.inputValue) {
        this.filteredCountries = [...this.countries];
      } else {
        this.filteredCountries = this.countries.filter(c => c.name.toLowerCase().includes(this.inputValue.toLowerCase()));
      }
    }, 300);
  }

  private selectCountry(c: ICountry) {
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
    return (
      <form class="dropdown">
        <ir-input-text
          onTextChange={e => {
            this.inputValue = e.detail;
            this.filterCountries();
          }}
          error={this.error}
          placeholder=""
          value={this.inputValue}
          id="dropdownMenuCombobox"
          LabelAvailable={false}
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          onInputFocus={() => this.scrollToSelected()}
        ></ir-input-text>
        <div class="dropdown-menu combobox-menu" aria-labelledby="dropdownMenuCombobox">
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
