import { Component, Host, State, h } from '@stencil/core';
import { Moment } from 'moment';
import { ComboboxOption } from '../ir-m-combobox/ir-m-combobox';

@Component({
  tag: 'ir-test-cmp',
  styleUrl: 'ir-test-cmp.css',
  scoped: true,
})
export class IrTestCmp {
  @State() dates: { fromDate: Moment; toDate: Moment };
  @State() selectedStaticOption: ComboboxOption;
  @State() selectedCountry: ComboboxOption;
  @State() selectedCustomOption: ComboboxOption;
  @State() countryOptions: ComboboxOption[] = [];
  @State() customOptions: ComboboxOption[] = [];
  @State() isLoadingCountries: boolean = false;
  @State() isLoadingCustom: boolean = false;

  private customComboboxRef: HTMLIrMComboboxElement;

  private staticOptions: ComboboxOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
    { value: 'option5', label: 'Option 5' },
  ];

  private handleStaticOptionChange = (event: CustomEvent<ComboboxOption>) => {
    this.selectedStaticOption = event.detail;
  };

  private handleCountryChange = (event: CustomEvent<ComboboxOption>) => {
    this.selectedCountry = event.detail;
  };

  private handleCustomOptionChange = (event: CustomEvent<ComboboxOption>) => {
    this.selectedCustomOption = event.detail;
  };

  private handleCountrySearch = async (event: CustomEvent<string>) => {
    const query = event.detail;
    if (!query || query.length < 2) {
      this.countryOptions = [];
      return;
    }

    this.isLoadingCountries = true;
    try {
      const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}`);
      if (response.ok) {
        const countries = await response.json();
        this.countryOptions = countries
          .map(country => ({
            value: country.cca2,
            label: country.name.common,
          }))
          .slice(0, 10); // Limit to 10 results
      } else {
        this.countryOptions = [];
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      this.countryOptions = [];
    } finally {
      this.isLoadingCountries = false;
    }
  };

  private handleCustomSearch = async (event: CustomEvent<string>) => {
    const query = event.detail;
    if (!query || query.length < 2) {
      this.customOptions = [];
      return;
    }

    this.isLoadingCustom = true;
    // Simulate API call with timeout
    setTimeout(() => {
      this.customOptions = [
        { value: `custom-${query}-1`, label: `Custom Result 1 for "${query}"` },
        { value: `custom-${query}-2`, label: `Custom Result 2 for "${query}"` },
        { value: `custom-${query}-3`, label: `Custom Result 3 for "${query}"` },
      ];
      this.isLoadingCustom = false;
    }, 500);
  };

  private handleCustomOptionClick = (option: ComboboxOption) => {
    if (this.customComboboxRef) {
      this.customComboboxRef.selectOptionFromSlot(option);
    }
  };

  render() {
    return (
      <Host class="card p-4">
        <div class="row g-3">
          <div class="col-md-4">
            <h5>Static Options Example</h5>
            <ir-m-combobox placeholder="Select an option..." dataMode="static" options={this.staticOptions} onOptionChange={this.handleStaticOptionChange}></ir-m-combobox>
            {this.selectedStaticOption && <p class="mt-2 text-muted">Selected: {this.selectedStaticOption.label}</p>}
          </div>

          <div class="col-md-4">
            <h5>External API - Countries</h5>
            <ir-m-combobox
              placeholder="Search countries..."
              dataMode="external"
              options={this.countryOptions}
              loading={this.isLoadingCountries}
              debounceDelay={300}
              onSearchQuery={this.handleCountrySearch}
              onOptionChange={this.handleCountryChange}
            ></ir-m-combobox>
            {this.selectedCountry && <p class="mt-2 text-muted">Selected: {this.selectedCountry.label}</p>}
          </div>

          <div class="col-md-4">
            <h5>Custom Dropdown Content</h5>
            <ir-m-combobox
              ref={el => (this.customComboboxRef = el)}
              placeholder="Search with custom dropdown..."
              dataMode="external"
              options={this.customOptions}
              loading={this.isLoadingCustom}
              useSlot={true}
              debounceDelay={500}
              onSearchQuery={this.handleCustomSearch}
              onOptionChange={this.handleCustomOptionChange}
            >
              <div slot="dropdown-content">
                {this.isLoadingCustom && <div class="dropdown-item">🔄 Loading custom results...</div>}
                {!this.isLoadingCustom && this.customOptions.length === 0 && <div class="dropdown-item">🔍 Type to search...</div>}
                {!this.isLoadingCustom &&
                  this.customOptions.map((option, index) => (
                    <div
                      key={index}
                      class="dropdown-item d-flex align-items-center"
                      data-option={option.value}
                      data-label={option.label}
                      onClick={() => this.handleCustomOptionClick(option)}
                      onMouseEnter={e => {
                        const element = e.target as HTMLElement;
                        const slotIndex = element.getAttribute('data-slot-index');
                        if (slotIndex && this.customComboboxRef) {
                          (this.customComboboxRef as any).focusedIndex = parseInt(slotIndex);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <span class="me-2">⭐</span>
                      <div>
                        <div class="fw-bold">{option.label}</div>
                        <small class="text-muted">Custom option with ID: {option.value}</small>
                      </div>
                    </div>
                  ))}
              </div>
            </ir-m-combobox>
            {this.selectedCustomOption && <p class="mt-2 text-muted">Selected: {this.selectedCustomOption.label}</p>}
          </div>
        </div>
      </Host>
    );
  }
}
