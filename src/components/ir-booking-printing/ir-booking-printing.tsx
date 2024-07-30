import { Booking, Guest } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import { Component, Fragment, Prop, State, Watch, h } from '@stencil/core';
import axios from 'axios';
import moment from 'moment';
import { _formatAmount } from '../ir-booking-details/functions';
import { IProperty } from '@/models/property';

@Component({
  tag: 'ir-booking-printing',
  styleUrl: 'ir-booking-printing.css',
  shadow: true,
})
export class IrBookingPrinting {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() bookingNumber: string = '';
  @Prop() baseurl: string = '';
  @Prop() propertyid: number;
  @Prop() mode: 'invoice' | 'default' = 'default';

  @State() booking: Booking;
  @State() property: IProperty;
  @State() guestCountryName: string;
  @State() isLoading: boolean;

  private bookingService = new BookingService();
  private roomService = new RoomService();

  componentWillLoad() {
    axios.defaults.baseURL = this.baseurl;
    if (this.ticket) {
      this.init();
    }
  }

  @Watch('ticket')
  async ticketChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.init();
    }
  }
  private init() {
    this.bookingService.setToken(this.ticket);
    this.roomService.setToken(this.ticket);
    this.initializeRequests();
  }
  async initializeRequests() {
    try {
      this.isLoading = true;
      if (!this.bookingNumber) {
        throw new Error('Missing booking number');
      }
      const [property, languageTexts, booking, countries] = await Promise.all([
        this.roomService.fetchData(this.propertyid, this.language),
        this.roomService.fetchLanguage(this.language),
        this.bookingService.getExposedBooking(this.bookingNumber, this.language),
        this.bookingService.getCountries(this.language),
      ]);
      if (!locales.entries) {
        locales.entries = languageTexts.entries;
        locales.direction = languageTexts.direction;
      }
      this.setUserCountry(countries, booking.guest.country_id);
      this.property = property.My_Result;
      this.booking = booking;
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  private formatGuestName({ first_name, last_name }: Guest) {
    if (!last_name) {
      return first_name;
    }
    return `${first_name} ${last_name}`;
  }
  private formatPhoneNumber({ mobile, country_phone_prefix }: Guest, is_direct: boolean) {
    if (!is_direct) {
      return mobile;
    }
    if (!country_phone_prefix) {
      return mobile;
    }
    return `+${country_phone_prefix.replace('+', '')}-${mobile}`;
  }
  private formatBookingDates(date: string) {
    return moment(date, 'YYYY-MM-DD').format('DD-MMM-YYYY');
  }
  private setUserCountry(countries: any, country_id: number) {
    const country = countries.find(country => country.id === country_id);
    this.guestCountryName = country?.name;
  }
  private formatDate(date) {
    const dayMonth = date.format('DD/MM');
    const dayOfWeekAbbr = date.format('ddd').charAt(0).toUpperCase();
    return `${dayMonth} ${dayOfWeekAbbr}`;
  }
  private renderPrintingHeader() {
    if (this.mode === 'default') {
      return (
        <section class="header">
          <div>
            <p>
              Address:
              <span> {this.property?.address}</span>
            </p>
            <p>
              Phone:
              <span>
                {' '}
                +{this.property?.country?.phone_prefix.replace('+', '') + '-' || ''}
                {this.property?.phone}
              </span>
            </p>
            <p>
              Tax ID:<span>{this.property.tax_nbr}</span>
            </p>
            <p class="property_name">{this.property.name}</p>
          </div>
          <div>
            <p class="booking-number">Booking#{this.bookingNumber}</p>
            <div class={'reservation-details'}>
              <p class="booked_on_date">
                {moment(this.booking.booked_on.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')} {this.booking.booked_on.hour}:{this.booking.booked_on.minute} |
              </p>
              <img src={this.booking.origin.Icon} alt={this.booking.origin.Label} class="origin-icon" />
            </div>
            <p class={'invoice_reference'}>Invoice Reference:{this.booking.financial.invoice_nbr}</p>
          </div>
        </section>
      );
    }
    return <div></div>;
  }
  render() {
    if (this.isLoading || (!this.isLoading && (!this.booking || !this.property))) {
      return null;
    }

    return (
      <div class="main-container">
        {this.renderPrintingHeader()}
        <section>
          <section class="booking-details">
            <p class="label-title">
              Booked by:
              <span class="label-value">
                {this.formatGuestName(this.booking?.guest)} - {this.booking?.occupancy.adult_nbr + this.booking?.occupancy.children_nbr} person(s)
              </span>
            </p>
            <p class="label-title">
              Phone:<span class="label-value">{this.formatPhoneNumber(this.booking?.guest, this.booking?.is_direct)}</span>
            </p>
            <p class="label-title">
              Email:<span class="label-value">{this.booking?.guest?.email}</span>
            </p>
            {this.guestCountryName && (
              <p class="label-title">
                Country:<span class="label-value">{this.guestCountryName}</span>
              </p>
            )}
            {this.booking.guest.city && (
              <p class="label-title">
                City:<span class="label-value">{this.booking?.guest?.city}</span>
              </p>
            )}
            <p class="label-title">
              Arrival Time:<span class="label-value">{this.booking?.arrival?.description}</span>
            </p>
          </section>
          <section>
            <div class="accommodation-summary">
              <p class="accommodation-title">ACCOMMODATION</p>
              <p class="booking-dates">{this.formatBookingDates(this.booking?.from_date)}</p>
              <p class="booking-dates">{this.formatBookingDates(this.booking?.to_date)}</p>
              <p class="number-of-nights">1 night(s)</p>
              <p class="vat-exclusion">
                <i>Excluding 11% VAT</i>
              </p>
            </div>
            <div>
              {this.booking?.rooms?.map(room => (
                <Fragment>
                  <table>
                    <tr class={'roomtype-title'}>
                      <td>{room.roomtype.name}</td>
                      <td>{room.rateplan.name}</td>
                    </tr>
                    <tr>
                      <td colSpan={12}>
                        <p class="label-title">
                          Guest name:<span class="label-value">{this.formatGuestName(room?.guest)}</span>
                        </p>
                      </td>
                    </tr>
                  </table>
                  <div class="policies-container">
                    <p class="policies" innerHTML={room.rateplan.cancelation}></p>
                    <p class="policies" innerHTML={room.rateplan.guarantee}></p>
                  </div>
                  <div class="pricing-summary">
                    <div class={'pricing-breakdown'}>
                      <p class="label-title">
                        Total:<span class="label-value">{_formatAmount(room.total, this.booking.currency.code)}</span>
                      </p>
                      <span>-</span>
                      <p class="label-title">
                        Including: City Tax:<span class="label-value">{this.booking?.arrival?.description}</span>
                      </p>
                      <span>-</span>
                      <p class="label-title">
                        Excluding: VAT<span class="label-value">{this.booking?.arrival?.description}</span>
                      </p>
                    </div>
                    <p class="label-title">
                      Grand total:<span class="label-value">{_formatAmount(room.total, this.booking.currency.code)}</span>
                    </p>
                    <p class="label-title">
                      Due upon booking:<span class="label-value">{this.booking?.arrival?.description}</span>
                    </p>
                  </div>

                  <table>
                    <tr>
                      <td class="room_amount_day"></td>
                      {room.days.map(d => (
                        <Fragment>
                          <td class="room_amount_day amount">{this.formatDate(moment(d.date, 'YYYY-MM-DD'))}</td>
                        </Fragment>
                      ))}
                    </tr>
                    <tr>
                      <td class="room_amount_day rate">Rate</td>
                      {room.days.map(d => (
                        <Fragment>
                          <td class="room_amount_day">{_formatAmount(d.amount, this.booking.currency.code)}</td>
                        </Fragment>
                      ))}
                    </tr>
                  </table>
                </Fragment>
              ))}
            </div>
          </section>
        </section>
      </div>
    );
  }
}
