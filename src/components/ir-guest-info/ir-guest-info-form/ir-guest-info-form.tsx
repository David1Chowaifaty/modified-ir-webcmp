import { Component, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';
import { Guest } from '@/models/booking.dto';
import locales from '@/stores/locales.store';
import { ICountry } from '@/models/IBooking';
import { guestInfoFormSchema } from './types';
import { IToast } from '@/components/ui/ir-toast/toast';
import Token from '@/models/Token';
import { BookingService } from '@/services/booking-service/booking.service';
import { RoomService } from '@/services/room.service';
import { z } from 'zod';
export type GuestChangedEvent = Partial<Guest>;
@Component({
  tag: 'ir-guest-info-form',
  styleUrl: 'ir-guest-info-form.css',
  scoped: true,
})
export class IrGuestInfoForm {
  @Prop() fromId: string;
  @Prop() language: string;
  @Prop() email: string;
  @Prop() booking_nbr: string;
  @Prop() ticket: string;

  @State() guest: Guest = null;
  @State() countries: ICountry[] = [];
  @State() isLoading: boolean = true;
  @State() autoValidate = false;

  @Event({ bubbles: true, composed: true }) guestInfoDrawerClosed: EventEmitter<{ source: Element }>;
  @Event({ bubbles: true, composed: true }) resetBookingEvt: EventEmitter<null>;
  @Event({ bubbles: true, composed: true }) toast: EventEmitter<IToast>;
  @Event({ bubbles: true, composed: true }) guestChanged: EventEmitter<GuestChangedEvent>;

  private bookingService = new BookingService();
  private roomService = new RoomService();
  private token: Token = new Token();

  componentWillLoad() {
    if (this.ticket) {
      this.token.setToken(this.ticket);
    }
    if (!!this.token.getToken()) {
      this.init();
    }
  }

  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
  }

  private handleInputChange(params: Partial<Guest>) {
    this.guest = { ...this.guest, ...params };
  }

  private async init() {
    try {
      this.isLoading = true;
      const [guest, countries, fetchedLocales] = await Promise.all([
        this.bookingService.fetchGuest(this.email),
        this.bookingService.getCountries(this.language),
        !locales || !locales.entries || Object.keys(locales.entries).length === 0 ? this.roomService.fetchLanguage(this.language) : Promise.resolve(null),
      ]);

      if (fetchedLocales) {
        locales.entries = fetchedLocales.entries;
        locales.direction = fetchedLocales.direction;
      }

      this.countries = countries;
      let _g = { ...guest };
      if (_g && !_g.country_phone_prefix) {
        const country = this.countries.find(c => c.id === _g.country_id);
        console.log({ country });
        if (country) {
          _g = { ..._g, country_phone_prefix: country?.phone_prefix };
        }
      }

      this.guest = guest ? { ..._g, mobile: guest.mobile_without_prefix } : null;
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  private async editGuest() {
    try {
      this.autoValidate = true;
      guestInfoFormSchema.parse(this.guest);
      await this.bookingService.editExposedGuest(this.guest, this.booking_nbr ?? null);
      this.toast.emit({
        type: 'success',
        description: '',
        title: 'Saved Successfully',
        position: 'top-right',
      });
      this.resetBookingEvt.emit(null);
      this.guestChanged.emit(this.guest);
      this.guestInfoDrawerClosed.emit({ source: null });
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    if (this.isLoading) {
      return (
        <div class={'drawer__loader-container'}>
          <ir-spinner></ir-spinner>
        </div>
      );
    }
    return (
      <form
        id={this.fromId}
        onSubmit={e => {
          e.preventDefault();
          this.editGuest();
        }}
        class="guest-form__container"
      >
        <ir-validator
          schema={guestInfoFormSchema.shape.first_name}
          value={this.guest?.first_name ?? ''}
          autovalidate={this.autoValidate}
          valueEvent="text-change input input-change"
          blurEvent="input-blur blur"
        >
          <ir-input
            id={'firstName'}
            value={this.guest?.first_name}
            required
            onText-change={e => this.handleInputChange({ first_name: e.detail.trim() })}
            label={locales.entries?.Lcz_FirstName}
          ></ir-input>
        </ir-validator>
        <ir-validator
          schema={guestInfoFormSchema.shape.last_name}
          value={this.guest?.last_name ?? ''}
          autovalidate={this.autoValidate}
          valueEvent="text-change input input-change"
          blurEvent="input-blur blur"
        >
          <ir-input
            value={this.guest?.last_name}
            required
            id="lastName"
            onText-change={e => this.handleInputChange({ last_name: e.detail.trim() })}
            label={locales.entries?.Lcz_LastName}
          ></ir-input>
        </ir-validator>
        <ir-validator
          schema={guestInfoFormSchema.shape.email}
          value={this.guest?.email ?? ''}
          autovalidate={this.autoValidate}
          valueEvent="text-change input input-change"
          blurEvent="input-blur blur"
        >
          <ir-input
            label={locales.entries?.Lcz_Email}
            id="email"
            value={this.guest?.email}
            required
            onText-change={e => {
              const email = e.detail.replace(/(?<=^[^@]*)\s+(?=[^@]*@noemail\.com$)/g, '').trim();
              this.handleInputChange({ email });
            }}
          ></ir-input>
        </ir-validator>
        <ir-validator
          schema={guestInfoFormSchema.shape.alternative_email}
          value={this.guest?.alternative_email ?? ''}
          autovalidate={this.autoValidate}
          valueEvent="text-change input input-change"
          blurEvent="input-blur blur"
        >
          <ir-input
            label={locales.entries?.Lcz_AlternativeEmail}
            id="altEmail"
            value={this.guest?.alternative_email}
            onText-change={e => {
              const email = e.detail.replace(/(?<=^[^@]*)\s+(?=[^@]*@noemail\.com$)/g, '').trim();
              this.handleInputChange({ alternative_email: email });
            }}
          ></ir-input>
        </ir-validator>

        <ir-validator schema={guestInfoFormSchema.shape.country_id} value={this.guest?.country_id ?? undefined} autovalidate={this.autoValidate} valueEvent="countryChange">
          <ir-country-picker
            size="small"
            variant="modern"
            country={this.countries.find(c => c.id === this.guest?.country_id)}
            label={locales.entries?.Lcz_Country}
            onCountryChange={e => {
              const country = e.detail;
              let params: any = { country_id: country.id };
              if (!this.guest.country_phone_prefix) {
                params = { ...params, country_phone_prefix: country.phone_prefix };
              }
              this.handleInputChange(params);
            }}
            countries={this.countries}
          ></ir-country-picker>
        </ir-validator>
        <ir-validator
          schema={z.object({ mobile: guestInfoFormSchema.shape.mobile, phone_prefix: guestInfoFormSchema.shape.country_phone_prefix })}
          value={{ mobile: this.guest?.mobile ?? '', phone_prefix: this.guest?.country_phone_prefix }}
          autovalidate={this.autoValidate}
          valueEvent="mobile-input-change"
        >
          <ir-mobile-input
            size="small"
            onMobile-input-change={e => {
              this.handleInputChange({ mobile: e.detail.formattedValue.trim() });
            }}
            aria-invalid={'true'}
            onMobile-input-country-change={e => this.handleInputChange({ country_phone_prefix: e.detail.phone_prefix })}
            value={this.guest?.mobile ?? ''}
            required
            countryCode={this.countries.find(c => c.phone_prefix?.toString() === this.guest?.country_phone_prefix?.toString())?.code}
            countries={this.countries}
          ></ir-mobile-input>
        </ir-validator>

        <ir-validator
          schema={guestInfoFormSchema.shape.notes}
          value={this.guest?.notes ?? ''}
          autovalidate={this.autoValidate}
          valueEvent="wa-change change input"
          blurEvent="wa-blur blur"
        >
          <wa-textarea
            size="small"
            onchange={e => this.handleInputChange({ notes: (e.target as any).value })}
            value={this.guest?.notes ?? ''}
            label={locales.entries?.Lcz_PrivateNote}
          ></wa-textarea>
        </ir-validator>
      </form>
    );
  }
}
