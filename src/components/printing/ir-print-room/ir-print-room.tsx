import { Booking, Property } from '@/models/booking.dto';
import { formatAmount } from '@/utils/utils';
import { Component, Prop, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-print-room',
  styleUrl: 'ir-print-room.css',
  shadow: true,
})
export class IrPrintRoom {
  /** Room data */
  @Prop() room: Booking['rooms'][0];

  /** Booking context */
  @Prop() booking: Booking;

  /** Property context */
  @Prop() property: Property;

  /** Currency code (e.g. USD, EUR) */
  @Prop() currency: string;

  /** Room index */
  @Prop() idx: number;

  private getSmokingLabel() {
    const { booking, room, property } = this;

    if (booking?.is_direct) {
      if (!room?.smoking_option) return null;

      const currRT = property?.roomtypes?.find(rt => rt.id === room?.roomtype?.id);

      const smokingOptions = currRT?.smoking_option?.allowed_smoking_options;

      return smokingOptions?.find(s => s.code === room.smoking_option)?.description ?? null;
    }

    return room?.ota_meta?.smoking_preferences ?? null;
  }

  private formatDate(date: string | Date) {
    const m = moment(date, 'YYYY-MM-DD');

    const dayMonth = m.format('DD/MM');
    let dayOfWeekAbbr = m.format('ddd'); // Mon, Tue, Wed, Thu, Fri, Sat, Sun

    if (['Thu', 'Sun', 'Sat'].includes(dayOfWeekAbbr)) {
      dayOfWeekAbbr = dayOfWeekAbbr.slice(0, 2);
    } else {
      dayOfWeekAbbr = dayOfWeekAbbr.charAt(0);
    }

    return `${dayMonth} ${dayOfWeekAbbr}`;
  }
  private formatGuestName({ first_name, last_name }) {
    if (!last_name) {
      return first_name;
    }
    return `${first_name} ${last_name}`;
  }
  private formatGuestAvailability({ adult_nbr, children_nbr, infant_nbr }) {
    // Adjust child number based on infants
    const adultCount = adult_nbr > 0 ? adult_nbr : 0;
    const childCount = children_nbr > 0 ? children_nbr : 0;
    const infantCount = infant_nbr > 0 ? infant_nbr : 0;

    // Define labels based on singular/plural rules
    const adultLabel = adultCount > 1 ? 'adults' : 'adult';
    const childLabel = childCount > 1 ? 'children' : 'child';
    const infantLabel = infantCount > 1 ? 'infants' : 'infant';

    // Construct parts with the updated child number
    const parts = [];
    if (adultCount > 0) {
      parts.push(`${adultCount} ${adultLabel}`);
    }
    if (childCount > 0) {
      parts.push(`${childCount} ${childLabel}`);
    }
    if (infantCount > 0) {
      parts.push(`${infantCount} ${infantLabel}`);
    }
    return parts.join('&nbsp&nbsp&nbsp&nbsp');
  }
  private formatBookingDates(date: string) {
    return moment(date, 'YYYY-MM-DD').format('DD-MMM-YYYY');
  }
  private renderTaxSection() {
    // OTA booking taxes
    if (!this.booking?.is_direct) {
      const filteredData = this.room.ota_taxes.filter(tx => tx.amount > 0);

      return filteredData.map((d, index) => (
        <div key={`room_${d.name}_${index}`} class="ir-print-room__tax-row">
          <p class="ir-print-room__tax-label">
            {d.is_exlusive ? 'Excluding' : 'Including'} {d.name}
          </p>
          <p class="ir-print-room__tax-amount">
            {d.currency.symbol}
            {d.amount}
          </p>
        </div>
      ));
    }

    // Direct booking taxes
    const filteredData = this.property?.taxes?.filter(tx => tx.pct > 0);

    return filteredData?.map((d, index) => {
      const amount = (this.room.total * d.pct) / 100;

      return (
        <div key={`direct_room_${d.name}_${index}`} class="ir-print-room__tax-row">
          <p class="ir-print-room__tax-label">
            {d.is_exlusive ? 'Excluding' : 'Including'} {d.name}
          </p>
          <p class="ir-print-room__tax-amount">
            {d.pct}%: {formatAmount(this.currency, amount)}
          </p>
        </div>
      );
    });
  }
  render() {
    const { room, booking, property, currency, idx } = this;

    const haveMultipleRooms = property.roomtypes?.find(rt => rt.id === room?.roomtype?.id)?.physicalrooms?.length > 1;

    return (
      <section class="ir-print-room">
        {/* Header */}
        <header class="ir-print-room__header">
          <p class="ir-print-room__room-type">{room?.roomtype?.name}</p>

          {haveMultipleRooms && room?.unit && <p class="ir-print-room__unit">(unit {room.roomtype.id})</p>}

          <p class="ir-print-room__rate-plan">{room?.rateplan?.short_name || room?.rateplan?.name}</p>
        </header>

        {/* Main content */}
        <div class="ir-print-room__body">
          <div class="ir-print-room__details">
            <div class="ir-print-room__row">
              <ir-printing-label label="Guest Name:" content={this.formatGuestName(room?.sharing_persons?.find(p => p.is_main) ?? room?.guest)} />
              <ir-printing-label as-html content={this.formatGuestAvailability(room?.occupancy)} />
            </div>

            <div class="ir-print-room__row">
              <div class="ir-print-room__dates">
                {this.formatBookingDates(room?.from_date)}
                <span class="ir-print-room__date-separator">→</span>
                {this.formatBookingDates(room?.to_date)}
              </div>

              {room?.departure_time?.description && <p class="ir-print-room__departure-time">(Expected departure time: {room.departure_time.description})</p>}
            </div>

            <ir-printing-label label="Smoking options:" display="inline" content={this.getSmokingLabel()} />

            {booking?.is_direct && (
              <div class="ir-print-room__policies">
                <ir-printing-label
                  label="Cancellation:"
                  display="inline"
                  asHtml
                  content={room?.rateplan?.cancelation?.replace('<u>', '')?.replace('</u>', '')?.replace('<b>', '<b style="font-weight:bold">')}
                />

                <ir-printing-label
                  label="Guarantee:"
                  display="inline"
                  asHtml
                  content={(room?.rateplan?.guarantee ?? '')?.replace('<u>', '')?.replace('</u>', '')?.replace('<b>', '<b style="font-weight:bold">')}
                />
              </div>
            )}
          </div>

          {/* Totals */}
          <aside class="ir-print-room__totals">
            <ir-printing-label label="Total:" content={formatAmount(currency, room?.total)} />

            {this.renderTaxSection()}

            <ir-printing-label label="Grand total:" content={formatAmount(currency, room?.gross_total)} />

            {booking?.is_direct && <ir-printing-label label="Due upon booking:" content={formatAmount(currency, Number(room?.gross_guarantee))} />}
          </aside>
        </div>

        {/* Daily amounts */}
        <div
          class={{
            'ir-print-room__daily-amounts': true,
            'ir-print-room__daily-amounts--with-divider': idx < booking?.rooms?.length - 1,
          }}
        >
          {room?.days?.map(d => (
            <div class="room_amount_container" key={d.date}>
              <p class="room_amount date">{this.formatDate(d.date)}</p>
              <p class="room_amount amount" style={{ paddingRight: '0.375rem' }}>
                {formatAmount(currency, d.amount)}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }
}
