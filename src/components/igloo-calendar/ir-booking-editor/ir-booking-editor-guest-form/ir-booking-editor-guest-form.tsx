import { ICountry } from '@/models/IBooking';
import booking_store, { BookedByGuest, modifyBookingStore, updateBookedByGuest } from '@/stores/booking.store';
import calendar_data from '@/stores/calendar-data';
import locales from '@/stores/locales.store';
import { Component, Fragment, Host, h } from '@stencil/core';
import { v4 } from 'uuid';
import { AllowedPaymentMethod } from '@/models/booking.dto';
import IMask from 'imask';

@Component({
  tag: 'ir-booking-editor-guest-form',
  styleUrl: 'ir-booking-editor-guest-form.css',
  scoped: true,
})
export class IrBookingEditorGuestForm {
  private paymentMethods: AllowedPaymentMethod[] = [];

  private expiryDateMask = {
    mask: 'MM/YY',
    placeholderChar: '_',
    blocks: {
      MM: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 12,
        maxLength: 2,
      },
      YY: {
        mask: IMask.MaskedRange,
        from: new Date().getFullYear() % 100,
        to: (new Date().getFullYear() % 100) + 20,
        maxLength: 2,
      },
    },
  };

  componentWillLoad() {
    this.paymentMethods = calendar_data.property.allowed_payment_methods.filter(p => p.is_active && !p.is_payment_gateway);
    if (this.paymentMethods.length > 0) {
      modifyBookingStore('selectedPaymentMethod', { code: this.paymentMethods[0].code });
    }
  }

  private updateCountry(event: CustomEvent<ICountry>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const country = event.detail;
    let payload: Partial<BookedByGuest> = { countryId: country.id.toString() };
    if (!booking_store.bookedByGuest.mobile) {
      payload = { ...payload, phone_prefix: country.phone_prefix };
    }
    updateBookedByGuest(payload);
  }

  private get expiryDate(): string {
    const { expiryMonth, expiryYear } = booking_store.bookedByGuest;

    if (!expiryMonth || !expiryYear) {
      return '';
    }

    // Normalize year to YY
    const year = expiryYear.toString().length === 4 ? expiryYear.toString().slice(-2) : expiryYear.toString();

    return `${expiryMonth}/${year}`;
  }

  render() {
    const { bookedByGuest, selects } = booking_store;
    return (
      <Host>
        <section class="booking-editor__form-control">
          <ir-input
            label="Email address"
            onText-change={e => updateBookedByGuest({ email: e.detail })}
            type="email"
            value={bookedByGuest.email}
            defaultValue={bookedByGuest.email}
            placeholder="Email (leave empty if not available)"
          ></ir-input>
          <div class="booking-editor__guest-name-group" id="booking-editor-guest-name-group">
            <ir-input
              id="booking-editor-guest-first-name"
              class="booking-editor__guest-input --first-name"
              label="First name"
              value={bookedByGuest.firstName}
              defaultValue={bookedByGuest.firstName}
              placeholder="First name"
              autocomplete="off"
              onText-change={e => updateBookedByGuest({ firstName: e.detail })}
            ></ir-input>

            <ir-input
              id="booking-editor-guest-last-name"
              class="booking-editor__guest-input --last-name"
              label="Last name"
              onText-change={e => updateBookedByGuest({ lastName: e.detail })}
              value={bookedByGuest.lastName}
              defaultValue={bookedByGuest.lastName}
              placeholder="Last name"
              autocomplete="off"
            ></ir-input>
          </div>
          <ir-input label="Company name" placeholder="Company name"></ir-input>
          <ir-country-picker
            label={locales.entries.Lcz_Country}
            variant="modern"
            testId="main_guest_country"
            class="flex-grow-1 m-0"
            onCountryChange={e => this.updateCountry(e)}
            countries={selects.countries}
            country={selects.countries.find(c => c.id.toString() === bookedByGuest.countryId?.toString())}
          ></ir-country-picker>
          <ir-mobile-input
            size="small"
            onMobile-input-change={e => {
              updateBookedByGuest({ mobile: e.detail.formattedValue });
            }}
            onMobile-input-country-change={e => updateBookedByGuest({ phone_prefix: e.detail.phone_prefix })}
            value={bookedByGuest.mobile}
            countryCode={selects.countries.find(c => c.phone_prefix === bookedByGuest.phone_prefix)?.code}
            countries={selects.countries}
          ></ir-mobile-input>
          <wa-select
            size="small"
            label={locales.entries.Lcz_YourArrivalTime}
            data-testid="arrival_time"
            id={v4()}
            defaultValue={selects.arrivalTime[0].CODE_NAME}
            value={bookedByGuest.selectedArrivalTime}
            onchange={event => updateBookedByGuest({ selectedArrivalTime: (event.target as HTMLSelectElement).value })}
          >
            {selects.arrivalTime.map(time => (
              <wa-option value={time.CODE_NAME} selected={bookedByGuest.selectedArrivalTime === time.CODE_NAME}>
                {time.CODE_VALUE_EN}
              </wa-option>
            ))}
          </wa-select>
        </section>
        <section class={'booking-editor__form-control'}>
          <wa-textarea
            onchange={event => updateBookedByGuest({ note: (event.target as HTMLTextAreaElement).value })}
            size="small"
            value={bookedByGuest.note}
            defaultValue={bookedByGuest.note}
            label={locales.entries.Lcz_AnyMessageForUs}
            rows={4}
          ></wa-textarea>
          {this.paymentMethods.length > 1 && (
            <wa-select
              label={'Payment Method'}
              size="small"
              value={booking_store?.selectedPaymentMethod?.code}
              onchange={e =>
                modifyBookingStore('selectedPaymentMethod', {
                  code: (e.target as HTMLSelectElement).value,
                })
              }
            >
              {this.paymentMethods.map(p => (
                <wa-option value={p.code}>{p.description}</wa-option>
              ))}
            </wa-select>
          )}
          {booking_store.selectedPaymentMethod?.code === '001' && (
            <Fragment>
              <ir-input
                value={bookedByGuest.cardNumber}
                defaultValue={bookedByGuest.cardNumber}
                onText-change={e => updateBookedByGuest({ cardNumber: e.detail.trim() })}
                label={locales.entries.Lcz_CardNumber}
              ></ir-input>
              <ir-input
                value={bookedByGuest.cardHolderName}
                defaultValue={bookedByGuest.cardHolderName}
                onText-change={e => updateBookedByGuest({ cardHolderName: e.detail.trim() })}
                label={locales.entries.Lcz_CardHolderName}
              ></ir-input>
              <ir-input
                onText-change={e => {
                  const [month, year] = e.detail.split('/');
                  updateBookedByGuest({
                    expiryMonth: month,
                    expiryYear: year,
                  });
                }}
                value={this.expiryDate}
                mask={this.expiryDateMask}
                label={locales.entries.Lcz_ExpiryDate}
              ></ir-input>
            </Fragment>
          )}
          {booking_store.selectedPaymentMethod?.code === '005' && (
            <div class="form-group mt-md-1 mt-1 p-0 d-flex flex-column flex-md-row align-items-md-center">
              <label class="p-0 m-0 margin3"></label>
              <div class="p-0 m-0  controlContainer flex-fill">
                <div
                  class="property-booked-by__money-transfer-description"
                  innerHTML={this.paymentMethods.find(p => p.code === '005')?.localizables.find(l => l.language.code.toLowerCase() === 'en')?.description}
                ></div>
              </div>
            </div>
          )}
          <wa-checkbox checked={bookedByGuest.emailGuest} onchange={event => updateBookedByGuest({ emailGuest: (event.target as HTMLInputElement).checked })}>
            {locales.entries.Lcz_EmailTheGuest}
          </wa-checkbox>
        </section>
      </Host>
    );
  }
}
