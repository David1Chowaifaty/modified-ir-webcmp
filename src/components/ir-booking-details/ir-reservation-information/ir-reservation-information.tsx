import { colorVariants } from '@/components/ui/ir-icons/icons';
import { Booking } from '@/models/booking.dto';
import locales from '@/stores/locales.store';
import { getPrivateNote } from '@/utils/booking';
import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import { ICountry } from '@/models/IBooking';
import { _formatDate, _formatTime } from '../functions';
import { BookingDetailsSidebarEvents } from '../ir-booking-details';

@Component({
  tag: 'ir-reservation-information',
  styleUrl: 'ir-reservation-information.css',
  scoped: true,
})
export class IrReservationInformation {
  @Prop() booking: Booking;
  @Prop() countries: ICountry[];

  @Event() editBookingClick: EventEmitter<{ type: BookingDetailsSidebarEvents }>;

  private handleEditClick(e: CustomEvent, type: BookingDetailsSidebarEvents) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.editBookingClick.emit({ type });
  }

  private renderPhoneNumber() {
    const { mobile, country_phone_prefix, country_id } = this.booking.guest;
    if (!mobile) {
      return null;
    }
    if (this.booking.is_direct) {
      if (country_phone_prefix) {
        return country_phone_prefix + ' ' + mobile;
      }
      if (country_id) {
        const selectedCountry = this.countries.find(c => c.id === country_id);
        if (!selectedCountry) {
          throw new Error('Invalid country id');
        }
        return selectedCountry.phone_prefix + ' ' + mobile;
      }
    }
    return mobile;
  }
  render() {
    return (
      <div class="card">
        <div class="p-1">
          <p>{this.booking.property.name || ''}</p>
          <ir-label
            labelText={`${locales.entries.Lcz_Source}:`}
            content={this.booking.origin.Label}
            image={{ src: this.booking.origin.Icon, alt: this.booking.origin.Label }}
          ></ir-label>
          <ir-label
            renderContentAsHtml
            labelText={`Booked on:`}
            content={`${_formatDate(this.booking.booked_on.date)}&nbsp&nbsp&nbsp&nbsp${_formatTime(
              this.booking.booked_on.hour.toString(),
              this.booking.booked_on.minute.toString(),
            )}`}
          ></ir-label>
          <ir-label labelText={`${locales.entries.Lcz_BookedBy}:`} content={`${this.booking.guest.first_name} ${this.booking.guest.last_name}`}>
            <ir-button
              slot="suffix"
              variant="icon"
              icon_name={'edit'}
              style={{ ...colorVariants.secondary, '--icon-size': '1.1rem' }}
              onClickHanlder={e => this.handleEditClick(e, 'guest')}
            ></ir-button>
          </ir-label>
          {this.booking.guest.mobile && <ir-label labelText={`${locales.entries.Lcz_Phone}:`} content={this.renderPhoneNumber()}></ir-label>}
          <ir-label labelText={`${locales.entries.Lcz_Email}:`} content={this.booking.guest.email}></ir-label>
          {this.booking.guest.alternative_email && <ir-label labelText={`${locales.entries.Lcz_AlternativeEmail}:`} content={this.booking.guest.alternative_email}></ir-label>}
          {this.booking?.guest?.address && <ir-label labelText={`${locales.entries.Lcz_Address}:`} content={this.booking.guest.address}></ir-label>}
          {/* {this.userCountry && (
            <ir-label label={`${locales.entries.Lcz_Country}:`} content={this.userCountry.name} country image={{ src: this.userCountry.flag, alt: this.userCountry.name }}></ir-label>
          )} */}
          {this.booking.is_direct && <ir-label labelText={`${locales.entries.Lcz_ArrivalTime}:`} content={this.booking.arrival.description}></ir-label>}
          {this.booking.promo_key && <ir-label labelText={`${locales.entries.Lcz_Coupon}:`} content={this.booking.promo_key}></ir-label>}
          {this.booking.agent && <ir-label labelText={`${locales.entries.Lcz_AgentCode?.split(':')[0]}:`} content={this.booking.agent.name}></ir-label>}
          {this.booking.is_in_loyalty_mode && !this.booking.promo_key && (
            <div class="d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height={18} width={18}>
                <path
                  fill="#fc6c85"
                  d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"
                />
              </svg>
              <p class="m-0 p-0 ml-1">{locales.entries.Lcz_LoyaltyDiscountApplied}</p>
            </div>
          )}
          {this.booking.is_direct ? (
            <ir-label class={'m-0 p-0'} labelText={`${locales.entries.Lcz_Note}:`} content={this.booking.remark}></ir-label>
          ) : (
            <ota-label class={'m-0 p-0'} label={`${locales.entries.Lcz_Note}:`} remarks={this.booking.ota_notes} maxVisibleItems={this.booking.ota_notes?.length}></ota-label>
          )}
          <div class="d-flex align-items-center justify-content-between">
            <ir-label
              labelText={`${locales.entries.Lcz_PrivateNote}:`}
              placeholder={locales.entries.Lcz_VisibleToHotelOnly}
              content={getPrivateNote(this.booking.extras)}
              // ignore_content
            ></ir-label>
            <ir-button variant="icon" icon_name="edit" style={colorVariants.secondary} onClickHanlder={e => this.handleEditClick(e, 'extra_note')}></ir-button>
          </div>
        </div>
      </div>
    );
  }
}
