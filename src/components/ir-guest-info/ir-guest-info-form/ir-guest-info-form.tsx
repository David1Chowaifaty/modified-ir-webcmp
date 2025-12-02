import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { Guest } from '@/models/booking.dto';
import locales from '@/stores/locales.store';
import { ICountry } from '@/models/IBooking';
import { guestInfoFormSchema } from './types';

@Component({
  tag: 'ir-guest-info-form',
  styleUrl: 'ir-guest-info-form.css',
  scoped: true,
})
export class IrGuestInfoForm {
  @Prop({ mutable: true }) guest: Guest;
  @Prop() language: string;
  @Prop() countries: ICountry[];
  @Prop() autoValidate: boolean = false;

  @Event() guestChanged: EventEmitter<Partial<Guest>>;

  private handleInputChange(params: Partial<Guest>) {
    this.guestChanged.emit(params);
  }

  render() {
    return (
      <Host>
        <ir-validator
          schema={guestInfoFormSchema.shape.first_name}
          value={this.guest?.first_name ?? ''}
          autovalidate={this.autoValidate}
          valueEvent="text-change input input-change"
          blurEvent="input-blur blur"
        >
          <ir-custom-input
            id={'firstName'}
            value={this.guest?.first_name}
            required
            onText-change={e => this.handleInputChange({ first_name: e.detail })}
            label={locales.entries?.Lcz_FirstName}
          ></ir-custom-input>
        </ir-validator>
        <ir-validator
          schema={guestInfoFormSchema.shape.last_name}
          value={this.guest?.last_name ?? ''}
          autovalidate={this.autoValidate}
          valueEvent="text-change input input-change"
          blurEvent="input-blur blur"
        >
          <ir-custom-input
            value={this.guest?.last_name}
            required
            id="lastName"
            onText-change={e => this.handleInputChange({ last_name: e.detail })}
            label={locales.entries?.Lcz_LastName}
          ></ir-custom-input>
        </ir-validator>
        <ir-validator
          schema={guestInfoFormSchema.shape.email}
          value={this.guest?.email ?? ''}
          autovalidate={this.autoValidate}
          valueEvent="text-change input input-change"
          blurEvent="input-blur blur"
        >
          <ir-custom-input
            label={locales.entries?.Lcz_Email}
            id="email"
            value={this.guest?.email}
            required
            onText-change={e => this.handleInputChange({ email: e.detail })}
          ></ir-custom-input>
        </ir-validator>
        <ir-validator
          schema={guestInfoFormSchema.shape.alternative_email}
          value={this.guest?.alternative_email ?? ''}
          autovalidate={this.autoValidate}
          valueEvent="text-change input input-change"
          blurEvent="input-blur blur"
        >
          <ir-custom-input
            label={locales.entries?.Lcz_AlternativeEmail}
            id="altEmail"
            value={this.guest?.alternative_email}
            onText-change={e => this.handleInputChange({ alternative_email: e.detail })}
          ></ir-custom-input>
        </ir-validator>

        <ir-validator schema={guestInfoFormSchema.shape.country_id} value={this.guest?.country_id ?? undefined} autovalidate={this.autoValidate} valueEvent="countryChange">
          <ir-country-picker
            variant="modern"
            country={this.countries.find(c => c.id === this.guest?.country_id)}
            label={locales.entries?.Lcz_Country}
            onCountryChange={e => this.handleInputChange({ country_id: e.detail.id })}
            countries={this.countries}
          ></ir-country-picker>
        </ir-validator>

        {/* <ir-phone-input
          mode="modern"
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
        /> */}
        <ir-validator schema={guestInfoFormSchema.shape.mobile} value={this.guest?.mobile ?? ''} autovalidate={this.autoValidate} valueEvent="mobile-input-change">
          <ir-mobile-input
            onMobile-input-change={e => {
              this.handleInputChange({ mobile: e.detail.formattedValue });
            }}
            onMobile-input-country-change={e => this.handleInputChange({ country_phone_prefix: e.detail.phone_prefix })}
            value={this.guest?.mobile ?? ''}
            required
            countryCode={this.countries.find(c => c.phone_prefix === this.guest?.country_phone_prefix)?.code}
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
            onchange={e => this.handleInputChange({ notes: (e.target as any).value })}
            value={this.guest?.notes ?? ''}
            label={locales.entries?.Lcz_PrivateNote}
          ></wa-textarea>
        </ir-validator>
      </Host>
    );
  }
}
