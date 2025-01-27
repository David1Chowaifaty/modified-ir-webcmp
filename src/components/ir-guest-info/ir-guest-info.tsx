import { Component, State, h, Prop, EventEmitter, Event, Watch } from '@stencil/core';
import { Guest } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import { ICountry } from '@/components';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import Token from '@/models/Token';

@Component({
  tag: 'ir-guest-info',
  styleUrl: 'ir-guest-info.css',
  scoped: true,
})
export class GuestInfo {
  @Prop() language: string;
  @Prop() headerShown: boolean;
  @Prop() email: string;
  @Prop() booking_nbr: string;
  @Prop() ticket: string;

  @State() countries: ICountry[];
  @State() submit: boolean = false;
  @State() guest: Guest | null = null;
  @State() isLoading: boolean = false;

  @Event() closeSideBar: EventEmitter<null>;
  @Event({ bubbles: true }) resetbooking: EventEmitter<null>;

  private bookingService = new BookingService();
  private roomService = new RoomService();
  private token: Token = new Token();

  async componentWillLoad() {
    if (this.ticket) {
      this.token.setToken(this.ticket);
    }
    if (!!this.token.getToken()) await this.init();
  }

  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    this.init();
  }
  // async init() {
  //   try {

  //     const [guest, countries] = await Promise.all([this.bookingService.fetchGuest(this.email), this.bookingService.getCountries(this.language)]);
  //     this.countries = countries;
  //     this.guest = guest;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  async init() {
    try {
      const [guest, countries, fetchedLocales] = await Promise.all([
        this.bookingService.fetchGuest(this.email),
        this.bookingService.getCountries(this.language),
        !locales || !locales.entries || Object.keys(locales.entries).length === 0 ? this.roomService.fetchLanguage(this.language) : Promise.resolve(null), // Skip fetching if locales are already set
      ]);

      // Set the fetched locales if they were fetched
      if (fetchedLocales) {
        locales.entries = fetchedLocales.entries;
        locales.direction = fetchedLocales.direction;
      }

      // Assign the fetched guest and countries
      this.countries = countries;
      this.guest = { ...guest, mobile: guest.mobile_without_prefix };
    } catch (error) {
      console.log(error);
    }
  }
  private handleInputChange(params: Partial<Guest>) {
    this.guest = { ...this.guest, ...params };
  }

  async editGuest() {
    try {
      this.isLoading = true;
      await this.bookingService.editExposedGuest(this.guest, this.booking_nbr ?? null);
      this.closeSideBar.emit(null);
      this.resetbooking.emit(null);
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
      console.log('done');
    }
  }
  render() {
    if (!this.guest) {
      return null;
    }
    return [
      <div class="p-0">
        {this.headerShown && (
          <div class="position-sticky mb-1 shadow-none p-0">
            <div class="d-flex align-items-center justify-content-between ir-card-header py-1 p-0">
              <h3 class="card-title text-left font-medium-2 px-1 my-0">{locales.entries.Lcz_GuestDetails}</h3>
              <ir-icon
                class="close close-icon px-1"
                onIconClickHandler={() => {
                  this.closeSideBar.emit(null);
                }}
              >
                <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height={20} width={20}>
                  <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                </svg>
              </ir-icon>
            </div>
          </div>
        )}
        <div class="card-content collapse show">
          <div class={this.headerShown ? 'card-body px-1' : 'pt-0'}>
            <ir-input-text
              placeholder=""
              label={locales.entries.Lcz_FirstName}
              name="firstName"
              submited={this.submit}
              value={this.guest?.first_name}
              required
              onTextChange={e => this.handleInputChange({ first_name: e.detail })}
            ></ir-input-text>
            <ir-input-text
              placeholder=""
              label={locales.entries.Lcz_LastName}
              name="lastName"
              submited={this.submit}
              value={this.guest?.last_name}
              required
              onTextChange={e => this.handleInputChange({ last_name: e.detail })}
            ></ir-input-text>
            <ir-input-text
              placeholder=""
              label={locales.entries.Lcz_Email}
              name="email"
              submited={this.submit}
              value={this.guest?.email}
              required
              onTextChange={e => this.handleInputChange({ email: e.detail })}
            ></ir-input-text>
            <ir-input-text
              placeholder=""
              label={locales.entries.Lcz_AlternativeEmail}
              name="altEmail"
              value={this.guest?.alternative_email}
              onTextChange={e => this.handleInputChange({ alternative_email: e.detail })}
            ></ir-input-text>
            {/* <ir-input-text label="Password" placeholder="" name="password" submited={this.submit} type="password" value={this.Model.password} required></ir-input-text> */}
            <ir-select
              selectContainerStyle="mb-1"
              required
              name="country"
              submited={this.submit}
              label={locales.entries.Lcz_Country}
              selectedValue={this.guest.country_id?.toString() ?? ''}
              data={this.countries.map(item => {
                return {
                  value: item.id.toString(),
                  text: item.name,
                };
              })}
              firstOption={'...'}
              onSelectChange={e => this.handleInputChange({ country_id: e.detail })}
            ></ir-select>
            {/* <div class="form-group mr-0">
              <div class="input-group row m-0 p-0">
                <div class={`input-group-prepend col-3 p-0 text-dark border-none`}>
                  <label class={`input-group-text  border-theme flex-grow-1 text-dark  `}>
                    {locales.entries.Lcz_MobilePhone}
                    {'*'}
                  </label>
                </div>
                <select
                  class={`form-control text-md  col-2 py-0 mobilePrefixSelect`}
                  onInput={e => this.handleInputChange('country_phone_prefix', (e.target as HTMLSelectElement).value)}
                  required
                >
                  <option value={null}>...</option>
                  {this.countries.map(item => (
                    <option selected={this.guest.country_phone_prefix?.toString() === item.phone_prefix.toString()} value={item.phone_prefix}>
                      {item.phone_prefix}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={this.guest.mobile}
                  class={'form-control flex-fill mobilePrefixInput'}
                  onInput={e => this.handleInputChange('mobile', (e.target as HTMLInputElement).value)}
                />
              </div>
            </div> */}

            <ir-phone-input
              onTextChange={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                const { mobile, phone_prefix } = e.detail;
                if (mobile !== this.guest.mobile) {
                  this.handleInputChange({ mobile });
                }
                if (phone_prefix !== this.guest.country_phone_prefix) this.handleInputChange({ country_phone_prefix: phone_prefix });
              }}
              phone_prefix={this.guest.country_phone_prefix}
              value={this.guest.mobile}
              language={this.language}
              label={locales.entries.Lcz_MobilePhone}
              countries={this.countries}
            />
            <div class="mb-2">
              <ir-textarea
                variant="prepend"
                onTextChange={e => this.handleInputChange({ notes: e.detail })}
                value={this.guest?.notes}
                label={locales.entries.Lcz_PrivateNote}
              ></ir-textarea>
            </div>
            <div class={'p-0 m-0'}>
              <label class={`check-container m-0 p-0`}>
                <input
                  class={'m-0 p-0'}
                  type="checkbox"
                  name="newsletter"
                  checked={this.guest.subscribe_to_news_letter}
                  onInput={e => this.handleInputChange({ subscribe_to_news_letter: (e.target as HTMLInputElement).checked })}
                />
                <span class="checkmark m-0 p-0"></span>
                <span class={'m-0 p-0  check-label'}>{locales.entries.Lcz_Newsletter}</span>
              </label>
            </div>

            <hr />
            <ir-button
              isLoading={this.isLoading}
              btn_disabled={this.isLoading}
              btn_styles="d-flex align-items-center justify-content-center"
              text={locales.entries.Lcz_Save}
              onClickHandler={this.editGuest.bind(this)}
              color="btn-primary"
            ></ir-button>
          </div>
        </div>
      </div>,
    ];
  }
}
