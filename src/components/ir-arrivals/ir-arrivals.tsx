import { Booking } from '@/models/booking.dto';
import Token from '@/models/Token';
import { BookingService } from '@/services/booking.service';
import { RoomService } from '@/services/room.service';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { Payment, PaymentEntries } from '../ir-booking-details/types';
import { arrivalsStore } from '@/stores/arrivals.store';

@Component({
  tag: 'ir-arrivals',
  styleUrls: ['../../assets/webawesome/component/host.css', 'ir-arrivals.css'],
  scoped: true,
})
export class IrArrivals {
  @Prop() ticket: string;
  @Prop() propertyid: number;
  @Prop() language: string = 'en';
  @Prop() p: string;

  @State() bookingNumber: number;
  @State() booking: Booking;
  @State() paymentEntries: PaymentEntries;
  @State() isPageLoading: boolean;
  @State() payment: Payment;

  private tokenService = new Token();
  private roomService = new RoomService();
  private bookingService = new BookingService();

  private paymentFolioRef: HTMLIrPaymentFolioElement;

  componentWillLoad() {
    if (this.ticket) {
      this.tokenService.setToken(this.ticket);
      this.init();
    }
  }

  @Watch('ticket')
  handleTicketChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue && newValue) {
      this.tokenService.setToken(this.ticket);
      this.init();
    }
  }

  @Listen('payBookingBalance')
  handleBookingPayment(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { booking_nbr, payment } = e.detail;
    this.booking = arrivalsStore.bookings.find(b => b.booking_nbr === booking_nbr);
    this.payment = payment;
    this.paymentFolioRef.openFolio();
  }

  @Listen('openBookingDetails')
  handleOpen(e: CustomEvent) {
    this.bookingNumber = e.detail;
  }

  private async init() {
    try {
      this.isPageLoading = true;
      const [_, __, setupEntries] = await Promise.all([
        this.roomService.getExposedProperty({ id: this.propertyid || 0, language: this.language, aname: this.p }),
        this.roomService.fetchLanguage(this.language),
        this.bookingService.getSetupEntriesByTableNameMulti(['_BED_PREFERENCE_TYPE', '_DEPARTURE_TIME', '_PAY_TYPE', '_PAY_TYPE_GROUP', '_PAY_METHOD']),
      ]);

      const { pay_type, pay_type_group, pay_method } = this.bookingService.groupEntryTablesResult(setupEntries);

      this.paymentEntries = { types: pay_type, groups: pay_type_group, methods: pay_method };
    } catch (error) {
    } finally {
      this.isPageLoading = false;
    }
  }

  render() {
    if (this.isPageLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host>
        <ir-toast style={{ display: 'none' }}></ir-toast>
        <ir-interceptor style={{ display: 'none' }}></ir-interceptor>
        <h3 class="page-title">Arrivals</h3>
        <ir-arrivals-filters></ir-arrivals-filters>
        <ir-arrivals-table></ir-arrivals-table>
        <ir-drawer
          onDrawerHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.bookingNumber = null;
          }}
          withoutHeader
          open={!!this.bookingNumber}
          style={{
            '--ir-drawer-width': '80rem',
            '--ir-drawer-background-color': '#F2F3F8',
            '--ir-drawer-padding-left': '0',
            '--ir-drawer-padding-right': '0',
            '--ir-drawer-padding-top': '0',
            '--ir-drawer-padding-bottom': '0',
          }}
        >
          {this.bookingNumber && (
            <ir-booking-details
              hasPrint
              hasReceipt
              hasCloseButton
              onCloseSidebar={() => (this.bookingNumber = null)}
              is_from_front_desk
              propertyid={this.propertyid as any}
              hasRoomEdit
              hasRoomDelete
              bookingNumber={this.bookingNumber.toString()}
              ticket={this.ticket}
              language={this.language}
              hasRoomAdd
            ></ir-booking-details>
          )}
        </ir-drawer>
        <ir-payment-folio
          style={{ height: 'auto' }}
          bookingNumber={this.booking?.booking_nbr}
          paymentEntries={this.paymentEntries}
          payment={this.payment}
          mode={'payment-action'}
          ref={el => (this.paymentFolioRef = el)}
          onCloseModal={() => {
            this.booking = null;
            this.payment = null;
          }}
        ></ir-payment-folio>
      </Host>
    );
  }
}
