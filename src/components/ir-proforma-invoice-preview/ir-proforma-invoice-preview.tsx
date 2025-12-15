import { Booking } from '@/models/booking.dto';
import { BookingInvoiceInfo } from '../ir-invoice/types';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { IssueInvoiceProps } from '@/services/booking-service/types';
import { data } from './data.demo';
import moment from 'moment';

type InvoicePayload = IssueInvoiceProps['invoice'];

export interface NightlyRate {
  date: string;
  amount: number;
}

@Component({
  tag: 'ir-proforma-invoice-preview',
  styleUrl: 'ir-proforma-invoice-preview.css',
  shadow: true,
})
export class IrProformaInvoicePreview {
  /**
   * Booking context used to display property, guest, and folio details.
   */
  @Prop() booking: Booking = data.booking as any;

  /**
   * Invoice payload emitted by `ir-invoice-form`.
   * Totals will fall back to booking data when omitted.
   */
  @Prop() invoice?: InvoicePayload = data.invoice as any;

  /**
   * Property associated with the booking.
   */
  @Prop() property: Booking['property'] = data.property as any;

  /**
   * Optional metadata fetched via `getBookingInvoiceInfo`.
   * Used to display reference numbers (invoice/credit note/etc.).
   */
  @Prop() invoiceInfo?: BookingInvoiceInfo;

  /**
   * Locale used for date formatting.
   */
  @Prop() locale: string = 'en';

  /**
   * Optional footer text shown at the end of the preview.
   */
  @Prop() footerNote?: string;
  @State() invocableKeys: Set<string | number>;
  componentWillLoad() {
    this.invocableKeys = new Set(this.invoice?.items?.map(i => i.key));
  }
  @Watch('invoice')
  handleInvoiceChange() {
    this.invocableKeys = new Set(this.invoice?.items?.map(i => i.key));
  }

  private get bookingNumber() {
    if (!this.booking.is_direct) {
      return `${this.booking.booking_nbr} | ${this.booking.channel_booking_nbr}`;
    }
    return this.booking.booking_nbr;
  }

  private get CompanyLocation() {
    const { company } = this.property;
    const { postal, city, country } = company;
    if (!postal && !city && !country) return null;
    const location = [];
    if (postal) {
      location.push(postal);
    }
    if (city) {
      location.push(city);
    }
    if (country) {
      if (postal || city) {
        location.push(`,${country.name}`);
      } else {
        location.push(company.name);
      }
    }
    if (location.length === 0) {
      return null;
    }
    return <p class="invoice-company__location">{location.join(' ')}</p>;
  }
  private get guestPhoneNumber() {
    const { country_phone_prefix, mobile_without_prefix } = this.booking.guest;
    // if (!is_direct) {
    //     return mobile;
    // }
    if (!country_phone_prefix) {
      return mobile_without_prefix;
    }
    return `+${country_phone_prefix?.replace('+', '')}-${mobile_without_prefix}`;
  }
  private formatDisplayDate(value?: string) {
    if (!value) {
      return null;
    }
    const parsedDate = moment(value, ['YYYY-MM-DD', moment.ISO_8601], true);
    if (!parsedDate.isValid()) {
      return null;
    }
    return parsedDate.format('MMMM DD, YYYY');
  }

  private get issueDate() {
    return this.formatDisplayDate(this.invoice?.Date) ?? '—';
  }

  private renderPropertyCompanyHeader() {
    const { company } = this.property;
    if (!company) {
      return null;
    }
    return (
      <div class="invoice-company" aria-label="Issuing company details">
        {company.name && <p class="invoice-company__name">{company.name}</p>}
        {company.address && <p class="invoice-company__address">{company.address}</p>}
        {this.CompanyLocation}
        {company.phone && (
          <ir-printing-label class="proforma-invoice__company-details" label={'Phone:'} content={`${company.country?.phone_prefix ?? ''} ${company.phone}`.trim()} />
        )}
        {company.tax_nbr && <ir-printing-label class="proforma-invoice__company-details" label={'Tax ID:'} content={company.tax_nbr} />}
      </div>
    );
  }
  private renderPropertyInfo() {
    const propertyLocation = [this.property?.city?.name ?? null, this.property?.country?.name ?? null].filter(f => f !== null).join(', ');
    const propertyLogo = this.property?.space_theme?.logo;
    return (
      <section class="property-overview" aria-label="Property overview">
        <div class="property-overview__text">
          <p class="property-overview__name">{this.property.name}</p>
          <p class="property-overview__location">{propertyLocation}</p>
        </div>
        {propertyLogo && <img src={propertyLogo} alt={`${this.property.name} logo`} class="property-logo" />}
      </section>
    );
  }
  private renderBillToSection() {
    const { guest, company_name, company_tax_nbr } = this.booking;
    const target = this.invoice?.target;
    if (target?.code === '002') {
      return (
        <div class="bill-to" aria-label="Bill to company">
          {company_name && <p class="bill-to__name">{company_name}</p>}
          {company_tax_nbr && <p class="bill-to__id">{company_tax_nbr}</p>}
        </div>
      );
    }
    return (
      <div class="bill-to" aria-label="Bill to guest">
        <p class="bill-to__name">{[guest.first_name ?? '', guest.last_name ?? ''].join(' ').trim()}</p>
        {guest.email && <p class="bill-to__contact">{guest.email}</p>}
        {this.guestPhoneNumber && <p class="bill-to__contact">{this.guestPhoneNumber}</p>}
      </div>
    );
  }

  render() {
    const billToContent = this.renderBillToSection();
    const companyDetails = this.renderPropertyCompanyHeader();
    const propertyOverview = this.renderPropertyInfo();
    return (
      <Host>
        <article class="invoice" aria-label="Pro-forma invoice">
          <header class="invoice__header">
            <h3 class="invoice__title">Pro-forma Invoice</h3>
            <section class="invoice__layout" aria-label="Invoice summary">
              <div class="invoice__column invoice__column--details">
                <div class="invoice__details">
                  <ir-printing-label label="Date of issue:" content={this.issueDate}></ir-printing-label>
                  <ir-printing-label label="Booking no:" content={this.bookingNumber}></ir-printing-label>
                </div>
                {billToContent && (
                  <section class="bill-to-section" aria-label="Bill to">
                    <h4 class="section-heading">Bill To</h4>
                    {billToContent}
                  </section>
                )}
              </div>
              <div class="invoice__column invoice__column--property">
                {companyDetails && (
                  <section class="issuer-section" aria-label="Issuer">
                    {companyDetails}
                  </section>
                )}
                {propertyOverview}
              </div>
            </section>
          </header>
          <main>
            <div style={{ marginTop: '2.5rem' }}>
              {this.booking.rooms.map((room, idx) => {
                if (!this.invocableKeys.has(room.system_id)) {
                  return null;
                }
                return (
                  <ir-print-room
                    room={room}
                    idx={idx}
                    booking={this.booking}
                    key={room.identifier}
                    currency={this.booking.currency.symbol}
                    property={this.property as any}
                  ></ir-print-room>
                );
              })}
            </div>
          </main>
          {this.footerNote && (
            <footer class="invoice__footer">
              <p class="invoice__footer-note">{this.footerNote}</p>
            </footer>
          )}
        </article>
      </Host>
    );
  }
}
