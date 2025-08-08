import { Component, Host, State, h } from '@stencil/core';
import { Moment } from 'moment';
import { ComboboxOption } from '../ir-m-combobox/ir-m-combobox';
import { ACPages } from '@/components';

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
    { value: 'option3', label: 'Option 3 ajnajanjanjna janajnjanjan najnajnajn ajnaj' },
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
  @State() notificationCount: number = 0;
  @State() isMobileMenuOpen: boolean = false;

  private toggleMobileMenu = () => {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  };
  private pages: ACPages[] = [
    {
      label: 'Dashboard',
      href: 'acdashboard.aspx',
      id: 'Li_AcDashboard',
      icon: 'la la-dashboard',
    },
    {
      label: 'Frontdesk',
      href: 'frontdesk.aspx',
      id: 'Li_FrontDesk',
      icon: 'la la-calendar',
    },
    {
      label: 'Inventory',
      href: 'acratesallotment.aspx',
      id: 'Li_AcRatesAllotment',
      icon: 'la la-list',
    },
    {
      label: 'Marketing',
      id: 'Li_AcPromotions',
      icon: 'la la-rocket',
      href: '#',
      subMenus: [
        {
          label: 'Discounts',
          href: 'acpromodiscounts.aspx',
        },
        {
          label: 'Automated Emails',
          href: 'acautomatedemails.aspx',
          id: 'Li_AutomatedEmails',
        },
      ],
    },
    {
      label: 'Bookings',
      href: 'acbookinglist.aspx',
      icon: 'la la-suitcase',
    },
    {
      href: '#',
      label: 'Settings',
      id: 'Li_AcSetup',
      icon: 'la la-building',
      isNew: true,
      subMenus: [
        {
          label: 'General Info',
          href: 'acgeneral.aspx',
        },
        {
          label: 'Facilities & Services',
          href: 'acamenities.aspx',
        },
        {
          label: 'Descriptions',
          href: 'acdescriptions.aspx',
          id: 'Li_AcDesc',
        },
        {
          label: 'Policies',
          href: 'acconcan.aspx',
        },
        {
          label: 'Money Matters',
          href: 'accommtax.aspx',
        },
        {
          label: 'Rooms & Rate Plans',
          href: 'acroomcategories.aspx',
          className: 'Li_AcRooming anchor_AcRooming',
        },
        {
          label: 'Housekeeping & Check-in Setup',
          href: 'ACHousekeeping.aspx',
          id: 'Li_Housekeeping',
          isNew: true,
        },
        {
          label: 'Agents and Groups',
          href: 'actravelagents.aspx',
        },
        {
          label: 'Image Gallery',
          href: 'acimagegallery.aspx',
          className: 'Li_AcRooming',
        },
        {
          label: 'Pickup Services',
          href: 'acpickups.aspx',
        },
        {
          label: 'Integrations',
          href: 'acintegrations.aspx',
        },
        {
          label: 'iSPACE',
          href: 'acthemingwebsite.aspx',
        },
        {
          label: 'iCHANNEL',
          href: 'acigloochannel.aspx',
        },
        {
          label: 'iSWITCH',
          href: 'iSwitch.aspx',
          id: 'Li_iSwitch',
        },
      ],
    },
    {
      href: '#',
      label: 'Reports',
      id: 'Li_AcAnalytics',
      icon: 'la la-bar-chart',
      isNew: true,
      subMenus: [
        {
          label: 'Housekeeping Tasks',
          href: 'ACHousekeepingTasks.aspx',
          id: 'Li_HousekeepingTasks',
        },
        {
          label: 'Guests',
          href: 'acmemberlist.aspx',
        },
        {
          label: 'Sales Statistics',
          href: 'acsalesstatistics.aspx',
        },
        {
          label: 'Sales by Channel',
          href: 'acsalesbychannel.aspx',
          isNew: true,
        },
        {
          label: 'Sales by Country',
          href: 'acsalesbycountry.aspx',
          isNew: true,
        },
        {
          label: 'Daily Occupancy',
          href: 'ACDailyOccupancy.aspx',
          id: 'Li_DailyOccupancy',
        },
        {
          label: 'Accounting Report',
          href: 'acaccountingreport.aspx',
        },
      ],
    },
  ];
  @State() showMegaMenu: boolean;

  render() {
    return (
      <Host>
        <nav class="modern-navbar">
          <span class="overdue-banner">Overdue $300</span>
          <div class="navbar-container">
            {/* Left section */}
            <div class="navbar-left">
              <button class="mobile-menu-toggle d-md-none" onClick={() => this.toggleMobileMenu()}>
                <span class="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
              <div class="navbar-brand">Logo</div>
              <div class="d-none d-md-flex ">
                <ir-m-combobox
                  style={{ '--ir-combobox-width': 'max-content' }}
                  placeholder="Find property"
                  dataMode="static"
                  options={this.staticOptions}
                  onOptionChange={this.handleStaticOptionChange}
                ></ir-m-combobox>
              </div>
              <div class="hotel-name d-none d-md-block">Hotel Name</div>
              <div class="ml-auto d-md-none">
                <ir-notifications notificationCount={this.notificationCount}></ir-notifications>
              </div>
            </div>

            {/* Center section - Search (desktop only) */}
            <div class="navbar-center d-none d-md-flex flex-fill mx-auto">
              <ir-m-combobox placeholder="Search..." dataMode="static" options={this.staticOptions} onOptionChange={this.handleStaticOptionChange}></ir-m-combobox>
            </div>

            {/* Right section - Navigation items */}
            <div class="navbar-right">
              {/* Desktop navigation */}
              <ul class="nav-items d-none d-md-flex">
                <li class="nav-item dropdown">
                  <a data-reference="parent" href="#" role="button" class="nav-link" data-toggle="dropdown" aria-expanded="false">
                    a
                  </a>
                  {/* Mega menu */}
                  <ul class={`ir-mega-menu mx-auto dropdown-menu-right dropdown-menu    w-100 shadow-sm`}>
                    <li>
                      <ul class="ir-mega-menu-column">
                        <li class="ir-mega-menu-row title">Parameters</li>
                        <li class="ir-mega-menu-row">
                          <a href="userinline.aspx">Users List</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="languageinline.aspx">System Languages</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="countryinline.aspx">Countries</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="level2inline.aspx">Country Level 2</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="cardinline.aspx">Credit Cards</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="hotel_chaininline.aspx">Hotel Chains</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="currencyinline.aspx">Currencies</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="amenityinline.aspx">Amenities</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="foodinline.aspx">Food</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="beddinginline.aspx">Bedding</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="setupinline.aspx">Setup Table</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="gwedit.aspx">Payment Gateways</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="channelmanager.aspx">Channel Manager</a>
                        </li>
                      </ul>
                    </li>

                    <li>
                      <ul class="ir-mega-menu-column">
                        <li class="ir-mega-menu-row title">Main</li>
                        <li class="ir-mega-menu-row">
                          <a href="mpolist.aspx">MPOs</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="aclist.aspx">Properties</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="acbookinglist.aspx?MODE=MPO">Bookings</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="mpoaffiliateproperties.aspx">MPO Affiliate Properties</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="acratesallotment.aspx?VIEW_MODE=CV">MPO Combined Inventory</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="acbookinglist.aspx?VIEW_MODE=CV">MPO Combined Bookings</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="Acmemberlist.aspx?VIEW_MODE=CV">MPO Combined Guests</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="mpobillingreport.aspx">MPO Billing Report</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="Acmemberlist.aspx">Guests</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="acbookinglist.aspx">Bookings</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="billing.aspx">Billing</a>
                        </li>
                      </ul>
                    </li>

                    <li>
                      <ul class="ir-mega-menu-column">
                        <li class="ir-mega-menu-row title">Locations</li>
                        <li class="ir-mega-menu-row">
                          <a href="poicategoriesinline.aspx">Types</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="poilist.aspx">List</a>
                        </li>
                      </ul>
                    </li>

                    <li>
                      <ul class="ir-mega-menu-column">
                        <li class="ir-mega-menu-row title">Referrers</li>
                        <li class="ir-mega-menu-row">
                          <a href="affiliatelist.aspx">Affiliates</a>
                        </li>
                        <li class="ir-mega-menu-row">
                          <a href="travelagentslist.aspx">Travel Agents ...NOT USED</a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li class="nav-item">
                  <a href="#" class="nav-link">
                    b
                  </a>
                </li>
                <li class="nav-item">
                  <a href="#" class="nav-link">
                    c
                  </a>
                </li>
                <li class="nav-item">
                  <a href="#" class="nav-link">
                    d
                  </a>
                </li>
                <li class="nav-item">
                  <div class="d-flex align-items-center justify-content-center" style={{ marginTop: '2px' }}>
                    <ir-notifications notificationCount={this.notificationCount}></ir-notifications>
                  </div>
                </li>
              </ul>
            </div>

            {/* Mobile menu overlay */}
            <div class={`mobile-menu ${this.isMobileMenuOpen ? 'active' : ''}`}>
              <div class="mobile-menu-header">
                <div class="hotel-name">Hotel Name</div>
                <button class="close-menu" onClick={() => this.toggleMobileMenu()}>
                  ×
                </button>
              </div>
              <div class="mobile-search">
                <ir-m-combobox placeholder="Search..." dataMode="static" options={this.staticOptions} onOptionChange={this.handleStaticOptionChange}></ir-m-combobox>
              </div>
              <ac-pages-menu location="sheet" pages={this.pages}></ac-pages-menu>
            </div>
          </div>

          <div class="submenus d-none d-md-block">
            <ac-pages-menu pages={this.pages}></ac-pages-menu>
          </div>
        </nav>
        <section class="p-2">
          <div class="row g-3">
            <div class="col-md-3">
              <h5>Static Options Example</h5>
              <ir-m-combobox placeholder="Select an option..." dataMode="static" options={this.staticOptions} onOptionChange={this.handleStaticOptionChange}></ir-m-combobox>
              {this.selectedStaticOption && <p class="mt-2 text-muted">Selected: {this.selectedStaticOption.label}</p>}
            </div>

            <div class="col-md-3">
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

            <div class="col-md-3">
              <h5>Custom Dropdown Content</h5>
              <ir-m-combobox
                class="custom-width"
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
          <div class={'d-flex align-items-center my-1'} style={{ gap: '1rem' }}>
            <button class="btn btn-primary" onClick={() => (this.notificationCount += 1)}>
              +
            </button>
            <button class="btn btn-primary" onClick={() => (this.notificationCount -= 1)}>
              -
            </button>
          </div>
        </section>
      </Host>
    );
  }
}
