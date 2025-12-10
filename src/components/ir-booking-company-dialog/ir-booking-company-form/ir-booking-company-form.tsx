import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
import { BookingService } from '@/services/booking-service/booking.service';
@Component({
  tag: 'ir-booking-company-form',
  styleUrl: 'ir-booking-company-form.css',
  scoped: true,
})
export class IrBookingCompanyForm {
  @Prop() booking: Booking;
  @Prop() formId: string;
  @State() open: boolean;
  @State() isLoading: boolean;
  @State() formData: Pick<Booking, 'company_name' | 'company_tax_nbr'>;

  @Event({ composed: true, bubbles: true }) resetBookingEvt: EventEmitter<Booking>;

  private bookingService = new BookingService();

  componentWillLoad() {
    this.formData = { company_name: this.booking.company_name, company_tax_nbr: this.booking.company_tax_nbr };
  }

  private updateGuest(params: Partial<Booking['guest']>) {
    this.formData = { ...this.formData, ...params };
  }

  private async saveCompany() {
    try {
      const booking = {
        assign_units: true,
        is_pms: true,
        is_direct: this.booking.is_direct,
        is_backend: true,
        is_in_loyalty_mode: this.booking.is_in_loyalty_mode,
        promo_key: this.booking.promo_key,
        extras: this.booking.extras,
        agent: this.booking.agent,
        booking: {
          ...this.formData,
          from_date: this.booking.from_date,
          to_date: this.booking.to_date,
          remark: this.booking.remark,
          booking_nbr: this.booking.booking_nbr,
          property: this.booking.property,
          booked_on: this.booking.booked_on,
          source: this.booking.source,
          rooms: this.booking.rooms,
          currency: this.booking.currency,
          arrival: this.booking.arrival,
          guest: this.booking.guest,
        },
        pickup_info: this.booking.pickup_info,
      };
      await this.bookingService.doReservation(booking);
      this.resetBookingEvt.emit({ ...this.booking, ...this.formData });
      this.open = false;
    } catch (error) {}
  }

  render() {
    return (
      <form
        id={this.formId}
        onSubmit={e => {
          e.preventDefault();
          this.saveCompany();
        }}
        class="booking-company__form"
      >
        <ir-custom-input
          value={this.formData.company_name}
          onText-change={e => this.updateGuest({ company_name: e.detail })}
          label="Name"
          autofocus
          placeholder="XYZ LTD"
        ></ir-custom-input>
        <ir-custom-input
          value={this.formData.company_tax_nbr}
          onText-change={e => this.updateGuest({ company_tax_nbr: e.detail })}
          label="Tax ID"
          placeholder="VAT 123456"
        ></ir-custom-input>
      </form>
    );
  }
}
