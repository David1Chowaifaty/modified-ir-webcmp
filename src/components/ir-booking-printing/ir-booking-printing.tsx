import { Booking, Guest, Room } from '@/models/booking.dto';
import { Component, Fragment, Prop, State, Watch, h } from '@stencil/core';
import moment, { Moment } from 'moment';
import { _formatTime } from '../ir-booking-details/functions';
import { IProperty } from '@/models/property';
import { calculateDaysBetweenDates } from '@/utils/booking';
import BeLogoFooter from '@/assets/be_logo_footer';
import { BookingService } from '@/services/booking.service';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import { formatAmount } from '@/utils/utils';

@Component({
  tag: 'ir-booking-printing',
  styleUrl: 'ir-booking-printing.css',
  shadow: true,
})
export class IrBookingPrinting {
  @Prop() token: string = '';
  @Prop() bookingNumber: string = '';
  @Prop() language: string = 'en';
  @Prop() propertyid: number;

  @Prop() mode: 'invoice' | 'default' = 'default';

  @Prop() countries: any;

  @State() booking: Booking;
  @State() property: IProperty;
  @State() guestCountryName: string;
  @State() isLoading: boolean;
  // @State() token: string;

  private bookingService = new BookingService();
  private roomService = new RoomService();

  private currency: string;
  private totalNights: number;
  private totalPersons: number;

  componentWillLoad() {
    document.body.style.background = 'white';
    if (this.token) {
      this.init();
    }
  }

  @Watch('token')
  async ticketChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.init();
    }
  }

  private init() {
    this.initializeRequests();
  }

  async initializeRequests() {
    try {
      this.isLoading = true;
      // if (!this.bookingNumber) {
      //   throw new Error('Missing booking number');
      // }
      let countries: any;

      const [property, languageTexts, booking, fetchedCountries] = await Promise.all([
        this.roomService.getExposedProperty({ id: this.propertyid, language: this.language, is_backend: true }),
        this.roomService.fetchLanguage(this.language),
        this.bookingService.getExposedBooking(this.bookingNumber, this.language),
        this.bookingService.getCountries(this.language),
      ]);
      if (!locales.entries) {
        locales.entries = languageTexts.entries;
        locales.direction = languageTexts.direction;
      }

      this.property = property['My_Result'];
      // this.booking = booking;
      countries = fetchedCountries;
      this.booking = booking;
      this.setUserCountry(countries, this.booking.guest.country_id);
      this.currency = this.booking.currency.symbol;
      this.totalPersons = this.booking?.occupancy.adult_nbr + this.booking?.occupancy.children_nbr;
      this.totalNights = calculateDaysBetweenDates(this.booking.from_date, this.booking.to_date);
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
        <p class="booking-number">Booking#{this.booking.booking_nbr}</p>
        <div class={'reservation-details'}>
          <p class="booked_on_date">
            {moment(this.booking.booked_on.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}{' '}
            {_formatTime(this.booking.booked_on.hour.toString(), this.booking.booked_on.minute.toString())} |
          </p>
          <img src={this.booking.origin.Icon} alt={this.booking.origin.Label} class="origin-icon" />
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
            {this.renderBookingDetails()}
            <p class={'invoice_reference'}>Invoice Reference:{this.booking.financial.invoice_nbr}</p>
          </div>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <div>
          <BeLogoFooter width={120} height={30} />
          <p class="property_name">{this.property.name}</p>
        </div>
        <div>{this.renderBookingDetails()}</div>
      </Fragment>
    );
  }
  private getTaxAmount(room: Room) {
    if (!this.booking.is_direct) {
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
    const filtered_data = this.property?.taxes?.filter(tx => tx.pct > 0);
    return filtered_data?.map((d, index) => {
      const amount = (room.total * d.pct) / 100;
      return (
        <Fragment>
          <p class="label-title">
            {d.is_exlusive ? 'Excluding' : 'Including'} {d.name}
          </p>
          <p>
            {d.pct}%: {formatAmount(this.currency, amount)}
          </p>
          {/* {room.gross_cost > 0 && room.gross_cost !== null && <span>{_formatAmount((room.cost * d.pct) / 100, this.currency)}</span>} */}
          {index < filtered_data.length - 1 && <span>-</span>}
        </Fragment>
      );
    });
  }
  render() {
    if (this.isLoading || (!this.isLoading && (!this.booking || !this.property))) {
      return null;
    }
    console.log(this.booking.pickup_info);

    return (
      <div class="main-container">
        <section class="header">{this.renderPrintingHeader()}</section>
        <section>
          <section class="booking-details">
            <p class="label-title">
              Booked by:
              <span class="label-value">
                {this.formatGuestName(this.booking?.guest)} - {this.totalPersons} {this.totalPersons > 1 ? 'persons' : 'person'}
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
              <p class="number-of-nights">
                {this.totalNights} {this.totalNights === 1 ? 'night' : 'nights'}
              </p>
              <p class="vat-exclusion">
                <i>{this.property.tax_statement}</i>
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
                        Total:<span class="label-value">{formatAmount(this.currency, room.total)}</span>
                      </p>
                      <span>-</span>
                      {this.getTaxAmount(room)}
                    </div>
                    <p class="label-title">
                      Grand total:<span class="label-value">{formatAmount(this.currency, room.gross_total)}</span>
                    </p>
                    <p class="label-title">
                      Due upon booking:<span class="label-value">{formatAmount(this.currency, room.gross_guarantee)}</span>
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
                        <p class="room_amount amount">{formatAmount(this.currency, d.amount)}</p>
                      </div>
                    ))}
                  </div>
                </Fragment>
              ))}
            </div>
          </section>
        </section>
        {this.booking.pickup_info && (
          <section class="pickup-container">
            <p class="pickup_title">PICKUP Yes,from {this.booking.pickup_info.selected_option.location.description}</p>
            <div class={'pickup-details'}>
              <p class="label-title">
                Arrival date:<span class="label-value">{moment(this.booking?.pickup_info.date, 'YYYY-MM-DD').format('ddd, DD MMM YYYY')}</span>
              </p>
              <p class="label-title">
                Time:<span class="label-value">{_formatTime(this.booking.pickup_info.hour.toString(), this.booking.pickup_info.minute.toString())}</span>
              </p>
              <p class="label-title">
                Fight details:<span class="label-value">{this.booking?.pickup_info.details}</span>
              </p>

              <p class="car_name">
                {this.booking.pickup_info.selected_option.vehicle.description}
                <span> - </span>
                {formatAmount(this.booking.pickup_info.selected_option.currency.code, this.booking.pickup_info.selected_option.amount)}
              </p>
              <p class="label-title">
                No. of Vehicles:<span class="label-value">{this.booking?.pickup_info.nbr_of_units}</span>
              </p>
              <p class="label-title">
                Due upon booking:<span class="label-value">{formatAmount(this.booking.pickup_info.currency.code, this.booking?.pickup_info.total)}</span>
              </p>
            </div>
          </section>
        )}
        {this.booking.financial?.payments && (
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
                {this.booking.financial?.payments?.map(p => (
                  <Fragment>
                    <tr key={p.id}>
                      <td class="billing_cell">{moment(p.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</td>
                      <td class="billing_cell">{formatAmount(p.currency.code, p.amount)}</td>
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
