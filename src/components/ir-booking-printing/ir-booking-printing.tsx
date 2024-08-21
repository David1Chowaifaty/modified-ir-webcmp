import { Booking, Guest, Room } from '@/models/booking.dto';
import { Component, Fragment, Prop, State, h } from '@stencil/core';
import moment, { Moment } from 'moment';
import { _formatAmount, _formatTime } from '../ir-booking-details/functions';
import { IProperty } from '@/models/property';
import { calculateDaysBetweenDates } from '@/utils/booking';
import BeLogoFooter from '@/assets/be_logo_footer';
import { BookingService } from '@/services/booking.service';
import { RoomService } from '@/services/room.service';
import axios from 'axios';
// import locales from '@/stores/locales.store';

@Component({
  tag: 'ir-booking-printing',
  styleUrl: 'ir-booking-printing.css',
  shadow: true,
})
export class IrBookingPrinting {
  // @Prop() ticket: string = '';
  @Prop() bookingNumber: string = '';
  @Prop() baseurl: string = 'https://gateway.igloorooms.com/IR';
  @Prop() language: string = 'en';
  @Prop() propertyid: number;

  @Prop() mode: 'invoice' | 'default' = 'default';
  @Prop() property: any;
  @Prop() booking: any;
  @Prop() countries: any;

  @State() convertedBooking: Booking;
  @State() convertedProperty: IProperty;
  @State() guestCountryName: string;
  @State() isLoading: boolean;
  @State() token: string;

  private bookingService = new BookingService();
  private roomService = new RoomService();

  private currency: string;
  private totalNights: number;
  private totalPersons: number;

  componentWillLoad() {
    axios.defaults.baseURL = this.baseurl;
    document.body.style.background = 'white';
    // if (this.ticket) {
    this.init();
    // }
  }

  // @Watch('ticket')
  // async ticketChanged(newValue: string, oldValue: string) {
  //   if (newValue !== oldValue) {
  //     this.init();
  //   }
  // }

  private applyTokenToServices() {
    this.bookingService.setToken(this.token);
    this.roomService.setToken(this.token);
  }

  private init() {
    this.applyTokenToServices();
    this.initializeRequests();
  }

  async initializeRequests() {
    try {
      this.isLoading = true;
      if (!this.bookingNumber) {
        throw new Error('Missing booking number');
      }
      let countries: any;
      if (!this.countries || !this.property || !this.booking) {
        // const [property, languageTexts, booking, fetchedCountries] = await Promise.all([
        //   this.roomService.fetchData(this.propertyid, this.language),
        //   this.roomService.fetchLanguage(this.language),
        //   this.bookingService.getExposedBooking(this.bookingNumber, this.language),
        //   this.bookingService.getCountries(this.language),
        // ]);
        // if (!locales.entries) {
        //   locales.entries = languageTexts.entries;
        //   locales.direction = languageTexts.direction;
        // }
        // this.property = property;
        // this.booking = booking;
      }

      countries = this.countries;
      this.convertedProperty = this.property;
      this.convertedBooking = this.booking;
      console.log(countries, this.convertedBooking, this.convertedProperty, countries);
      this.setUserCountry(countries, this.convertedBooking.guest.country_id);
      this.currency = this.convertedBooking.currency.code;
      this.totalPersons = this.convertedBooking?.occupancy.adult_nbr + this.convertedBooking?.occupancy.children_nbr;
      this.totalNights = calculateDaysBetweenDates(this.convertedBooking.from_date, this.convertedBooking.to_date);
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
  private formatDate(date: Moment) {
    const dayMonth = date.format('DD/MM');
    let dayOfWeekAbbr = date.format('ddd');
    if (['Thu', 'Sun', 'Sat'].includes(dayOfWeekAbbr)) {
      dayOfWeekAbbr = dayOfWeekAbbr.slice(0, 2);
    } else {
      dayOfWeekAbbr = dayOfWeekAbbr.charAt(0);
    }
    return `${dayMonth} ${dayOfWeekAbbr}`;
  }
  private renderBookingDetails() {
    return (
      <Fragment>
        <p class="booking-number">Booking#{this.convertedBooking.booking_nbr}</p>
        <div class={'reservation-details'}>
          <p class="booked_on_date">
            {moment(this.convertedBooking.booked_on.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}{' '}
            {_formatTime(this.convertedBooking.booked_on.hour.toString(), this.convertedBooking.booked_on.minute.toString())} |
          </p>
          <img src={this.convertedBooking.origin.Icon} alt={this.convertedBooking.origin.Label} class="origin-icon" />
        </div>
      </Fragment>
    );
  }
  private renderPrintingHeader() {
    if (this.mode === 'invoice') {
      return (
        <Fragment>
          <div>
            <p>
              Address:
              <span> {this.convertedProperty?.address}</span>
            </p>
            <p>
              Phone:
              <span>
                {' '}
                +{this.convertedProperty?.country?.phone_prefix.replace('+', '') + '-' || ''}
                {this.convertedProperty?.phone}
              </span>
            </p>
            <p>
              Tax ID:<span>{this.convertedProperty.tax_nbr}</span>
            </p>
            <p class="property_name">{this.convertedProperty.name}</p>
          </div>
          <div>
            {this.renderBookingDetails()}
            <p class={'invoice_reference'}>Invoice Reference:{this.convertedBooking.financial.invoice_nbr}</p>
          </div>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <div>
          <BeLogoFooter width={120} height={30} />
          <p class="property_name">{this.convertedProperty.name}</p>
        </div>
        <div>{this.renderBookingDetails()}</div>
      </Fragment>
    );
  }
  private getTaxAmount(room: Room) {
    if (!this.convertedBooking.is_direct) {
      const filtered_data = room.ota_taxes.filter(tx => tx.amount > 0);
      return filtered_data.map((d, index) => {
        return (
          <Fragment>
            <p class="label-title">
              {d.is_exlusive ? 'Excluding' : 'Including'} {d.name}
            </p>
            <p>
              {d.currency.symbol}
              {d.amount}
            </p>
            {index < filtered_data.length - 1 && <span>-</span>}
          </Fragment>
        );
      });
    }
    const filtered_data = this.convertedProperty.taxes.filter(tx => tx.pct > 0);
    return filtered_data?.map((d, index) => {
      const amount = (room.total * d.pct) / 100;
      return (
        <Fragment>
          <p class="label-title">
            {d.is_exlusive ? 'Excluding' : 'Including'} {d.name}
          </p>
          <p>
            {d.pct}%: {_formatAmount(amount, this.currency)}
          </p>
          {/* {room.gross_cost > 0 && room.gross_cost !== null && <span>{_formatAmount((room.cost * d.pct) / 100, this.currency)}</span>} */}
          {index < filtered_data.length - 1 && <span>-</span>}
        </Fragment>
      );
    });
  }
  render() {
    if (this.isLoading || (!this.isLoading && (!this.convertedBooking || !this.convertedProperty))) {
      return null;
    }
    console.log(this.convertedBooking.pickup_info);

    return (
      <div class="main-container">
        <section class="header">{this.renderPrintingHeader()}</section>
        <section>
          <section class="booking-details">
            <p class="label-title">
              Booked by:
              <span class="label-value">
                {this.formatGuestName(this.convertedBooking?.guest)} - {this.totalPersons} {this.totalPersons > 1 ? 'persons' : 'person'}
              </span>
            </p>
            <p class="label-title">
              Phone:<span class="label-value">{this.formatPhoneNumber(this.convertedBooking?.guest, this.convertedBooking?.is_direct)}</span>
            </p>
            <p class="label-title">
              Email:<span class="label-value">{this.convertedBooking?.guest?.email}</span>
            </p>
            {this.guestCountryName && (
              <p class="label-title">
                Country:<span class="label-value">{this.guestCountryName}</span>
              </p>
            )}
            {this.convertedBooking.guest.city && (
              <p class="label-title">
                City:<span class="label-value">{this.convertedBooking?.guest?.city}</span>
              </p>
            )}
            <p class="label-title">
              Arrival Time:<span class="label-value">{this.convertedBooking?.arrival?.description}</span>
            </p>
          </section>
          <section>
            <div class="accommodation-summary">
              <p class="accommodation-title">ACCOMMODATION</p>
              <p class="booking-dates">{this.formatBookingDates(this.convertedBooking?.from_date)}</p>
              <p class="booking-dates">{this.formatBookingDates(this.convertedBooking?.to_date)}</p>
              <p class="number-of-nights">
                {this.totalNights} {this.totalNights === 1 ? 'night' : 'nights'}
              </p>
              <p class="vat-exclusion">
                <i>{this.convertedProperty.tax_statement}</i>
              </p>
            </div>
            <div>
              {this.convertedBooking?.rooms?.map(room => (
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
                        Total:<span class="label-value">{_formatAmount(room.total, this.currency)}</span>
                      </p>
                      <span>-</span>
                      {this.getTaxAmount(room)}
                    </div>
                    <p class="label-title">
                      Grand total:<span class="label-value">{_formatAmount(room.gross_total, this.currency)}</span>
                    </p>
                    <p class="label-title">
                      Due upon booking:<span class="label-value">{_formatAmount(room.gross_guarantee, this.currency)}</span>
                    </p>
                  </div>

                  {/* Rendering room dates */}
                  <div class={'room_amount_main_container'}>
                    {/* <div class={'room_amount_container'}>
                      <p class="room_amount room_amount_empty">Dates</p>
                      <p class="room_amount room_amount_rate">Rate</p>
                    </div> */}
                    {room.days?.map(d => (
                      <div class={'room_amount_container'}>
                        <p class="room_amount date">{this.formatDate(moment(d.date, 'YYYY-MM-DD'))}</p>
                        <p class="room_amount amount">{_formatAmount(d.amount, this.currency)}</p>
                      </div>
                    ))}
                  </div>
                </Fragment>
              ))}
            </div>
          </section>
        </section>
        {this.convertedBooking.pickup_info && (
          <section class="pickup-container">
            <p class="pickup_title">PICKUP Yes,from {this.convertedBooking.pickup_info.selected_option.location.description}</p>
            <div class={'pickup-details'}>
              <p class="label-title">
                Arrival date:<span class="label-value">{moment(this.convertedBooking?.pickup_info.date, 'YYYY-MM-DD').format('ddd, DD MMM YYYY')}</span>
              </p>
              <p class="label-title">
                Time:<span class="label-value">{_formatTime(this.convertedBooking.pickup_info.hour.toString(), this.convertedBooking.pickup_info.minute.toString())}</span>
              </p>
              <p class="label-title">
                Fight details:<span class="label-value">{this.convertedBooking?.pickup_info.details}</span>
              </p>

              <p class="car_name">
                {this.convertedBooking.pickup_info.selected_option.vehicle.description}
                <span> - </span>
                {_formatAmount(this.convertedBooking.pickup_info.selected_option.amount, this.convertedBooking.pickup_info.selected_option.currency.code)}
              </p>
              <p class="label-title">
                No. of Vehicles:<span class="label-value">{this.convertedBooking?.pickup_info.nbr_of_units}</span>
              </p>
              <p class="label-title">
                Due upon booking:<span class="label-value">{_formatAmount(this.convertedBooking?.pickup_info.total, this.convertedBooking.pickup_info.currency.code)}</span>
              </p>
            </div>
          </section>
        )}
        {this.convertedBooking.financial?.payments && (
          <section>
            <table class="billing_table">
              <caption>Billing</caption>
              <thead>
                <th class="billing_header">Date</th>
                <th class="billing_header">Amount</th>
                <th class="billing_header">Designation</th>
                {/* <th class="billing_header">Reference</th> */}
              </thead>
              <tbody>
                {this.convertedBooking.financial?.payments?.map(p => (
                  <Fragment>
                    <tr key={p.id}>
                      <td class="billing_cell">{moment(p.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</td>
                      <td class="billing_cell">{_formatAmount(p.amount, p.currency.code)}</td>
                      <td class="billing_cell">{p.designation || '_'}</td>
                      {/* <td class="billing_cell billing_reference">{p.reference || '_'}</td> */}
                    </tr>
                    {p.reference && (
                      <tr>
                        <td colSpan={3}>Ref:{p.reference}</td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    );
  }
}
