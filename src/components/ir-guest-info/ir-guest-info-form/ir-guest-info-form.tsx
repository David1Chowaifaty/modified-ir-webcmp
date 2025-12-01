import { Component, Host, Prop, h } from '@stencil/core';
import { Guest } from '@/models/booking.dto';
import locales from '@/stores/locales.store';
import { ICountry } from '@/models/IBooking';

@Component({
  tag: 'ir-guest-info-form',
  styleUrl: 'ir-guest-info-form.css',
  scoped: true,
})
export class IrGuestInfoForm {
  @Prop() guest: Guest;
  @Prop() language: string;
  @Prop() countries: ICountry[];
  autoValidate: boolean;

  private handleInputChange(params: Partial<Guest>) {
    this.guest = { ...this.guest, ...params };
  }
  render() {
    return (
      <Host>
        <ir-custom-input
          id={'firstName'}
          value={this.guest?.first_name}
          required
          onText-change={e => this.handleInputChange({ first_name: e.detail })}
          label={locales.entries?.Lcz_FirstName}
        ></ir-custom-input>
        <ir-custom-input
          value={this.guest?.last_name}
          required
          id="lastName"
          onText-change={e => this.handleInputChange({ last_name: e.detail })}
          label={locales.entries?.Lcz_LastName}
        ></ir-custom-input>
        <ir-custom-input
          label={locales.entries?.Lcz_Email}
          id="email"
          // submitted={this.submit}
          value={this.guest?.email}
          required
          onText-change={e => this.handleInputChange({ email: e.detail })}
        ></ir-custom-input>
        <ir-custom-input
          label={locales.entries?.Lcz_AlternativeEmail}
          id="altEmail"
          value={this.guest?.alternative_email}
          onText-change={e => this.handleInputChange({ alternative_email: e.detail })}
        ></ir-custom-input>

        <ir-country-picker
          variant="modern"
          // error={this.submit && !this.guest.country_id}
          country={this.countries.find(c => c.id === this.guest.country_id)}
          label={locales.entries?.Lcz_Country}
          onCountryChange={e => this.handleInputChange({ country_id: e.detail.id })}
          countries={this.countries}
        ></ir-country-picker>
        {/*

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
        /> */}

        <wa-textarea onchange={e => this.handleInputChange({ notes: (e.target as any).value })} value={this.guest?.notes} label={locales.entries?.Lcz_PrivateNote}></wa-textarea>
      </Host>
    );
  }
}
