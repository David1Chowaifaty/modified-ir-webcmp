import { Component, State, h, Prop, EventEmitter, Event, Watch, Fragment } from '@stencil/core';
import { Guest } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import { ICountry } from '@/components';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import Token from '@/models/Token';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { IToast } from '@components/ui/ir-toast/toast';

@Component({
  tag: 'ir-guest-info',
  styleUrls: ['ir-guest-info.css', '../../common/sheet.css'],
  scoped: true,
})
export class GuestInfo {
  @Prop() language: string;
  @Prop() headerShown: boolean;
  @Prop() email: string;
  @Prop() booking_nbr: string;
  @Prop() ticket: string;
  @Prop() isInSideBar: boolean;

  @State() countries: ICountry[];
  // @State() submit: boolean = false;
  @State() guest: Guest | null = null;
  @State() isLoading: boolean = true;
  @State() autoValidate = false;

  @Event() closeSideBar: EventEmitter<null>;
  @Event({ bubbles: true }) resetBookingEvt: EventEmitter<null>;
  @Event() toast: EventEmitter<IToast>;

  private bookingService = new BookingService();
  private roomService = new RoomService();
  private token: Token = new Token();

  async componentWillLoad() {
    if (this.ticket) {
      this.token.setToken(this.ticket);
    }
    if (!!this.token.getToken()) this.init();
  }

  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    this.init();
  }

  async init() {
    try {
      console.log('first');
      this.isLoading = true;
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
    } finally {
      this.isLoading = false;
    }
  }
  private handleInputChange(params: Partial<Guest>) {
    this.guest = { ...this.guest, ...params };
  }

  private async editGuest() {
    try {
      this.autoValidate = true;

      await this.bookingService.editExposedGuest(this.guest, this.booking_nbr ?? null);
      this.toast.emit({
        type: 'success',
        description: '',
        title: 'Saved Successfully',
        position: 'top-right',
      });
      this.closeSideBar.emit(null);
      this.resetBookingEvt.emit(null);
    } catch (error) {
      console.log(error);
    }
  }
  render() {
    if (this.isLoading && this.isInSideBar) {
      <div class={'loading-container'}>
        <ir-spinner></ir-spinner>
      </div>;
    }
    if (this.isLoading) {
      return null;
    }
    return (
      <form
        class={'p-0 sheet-container'}
        onSubmit={async e => {
          e.preventDefault();
          await this.editGuest();
        }}
      >
        {!this.isInSideBar && [<ir-toast></ir-toast>, <ir-interceptor></ir-interceptor>]}
        {this.headerShown && <ir-title class="px-1 sheet-header" displayContext="sidebar" label={locales.entries.Lcz_GuestDetails}></ir-title>}
        <div class={this.isInSideBar ? 'sheet-body' : 'card-content collapse show '}>
          <div class={this.headerShown ? 'card-body px-1 pt-0' : 'pt-0'}>
            <ir-input-text
              autoValidate={this.autoValidate}
              label={locales.entries?.Lcz_FirstName}
              name="firstName"
              // submitted={this.submit}
              value={this.guest?.first_name}
              required
              onTextChange={e => this.handleInputChange({ first_name: e.detail })}
            ></ir-input-text>
            <ir-input-text
              autoValidate={this.autoValidate}
              label={locales.entries?.Lcz_LastName}
              name="lastName"
              // submitted={this.submit}
              value={this.guest?.last_name}
              required
              onTextChange={e => this.handleInputChange({ last_name: e.detail })}
            ></ir-input-text>
            <ir-input-text
              label={locales.entries?.Lcz_Email}
              name="email"
              // submitted={this.submit}
              value={this.guest?.email}
              required
              onTextChange={e => this.handleInputChange({ email: e.detail })}
            ></ir-input-text>
            <ir-input-text
              label={locales.entries?.Lcz_AlternativeEmail}
              name="altEmail"
              value={this.guest?.alternative_email}
              onTextChange={e => this.handleInputChange({ alternative_email: e.detail })}
            ></ir-input-text>
            {/* <ir-input-text label="Password" placeholder="" name="password" submited={this.submit} type="password" value={this.Model.password} required></ir-input-text> */}
            {/* <ir-select
              selectContainerStyle="mb-1"
              required
              name="country"
              submited={this.submit}
              label={locales.entries.Lcz_Country}
              selectedValue={this.guest?.country_id?.toString() ?? ''}
              data={this.countries?.map(item => {
                return {
                  value: item.id.toString(),
                  text: item.name,
                };
              })}
              firstOption={'...'}
              onSelectChange={e => this.handleInputChange({ country_id: e.detail })}
            ></ir-select> */}
            <ir-country-picker
              // error={this.submit && !this.guest.country_id}
              country={this.countries.find(c => c.id === this.guest.country_id)}
              label={locales.entries?.Lcz_Country}
              onCountryChange={e => this.handleInputChange({ country_id: e.detail.id })}
              countries={this.countries}
            ></ir-country-picker>

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
              label={locales.entries?.Lcz_MobilePhone}
              countries={this.countries}
            />
            <div class="mb-2">
              <ir-textarea
                variant="prepend"
                onTextChange={e => this.handleInputChange({ notes: e.detail })}
                value={this.guest?.notes}
                label={locales.entries?.Lcz_PrivateNote}
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
              {!this.isInSideBar && (
                <Fragment>
                  <hr />
                  <ir-button
                    btn_styles="d-flex align-items-center justify-content-center"
                    text={locales.entries.Lcz_Save}
                    onClickHandler={this.editGuest.bind(this)}
                    isLoading={isRequestPending('/Edit_Exposed_Guest')}
                    color="btn-primary"
                  ></ir-button>
                </Fragment>
              )}
            </div>
          </div>
        </div>
        {this.isInSideBar && (
          <div class={'sheet-footer'}>
            <ir-button
              data-testid="cancel"
              onClickHandler={() => this.closeSideBar.emit(null)}
              class="flex-fill m-0 p-0"
              btn_styles="w-100 m-0  justify-content-center align-items-center"
              btn_color="secondary"
              text={locales.entries.Lcz_Cancel}
            ></ir-button>
            <ir-button
              data-testid="save"
              isLoading={isRequestPending('/Edit_Exposed_Guest')}
              btn_disabled={this.isLoading}
              class="flex-fill m-0"
              btn_type="submit"
              btn_styles="w-100 m-0  justify-content-center align-items-center"
              text={locales.entries.Lcz_Save}
            ></ir-button>
          </div>
        )}
      </form>
    );
  }
}
