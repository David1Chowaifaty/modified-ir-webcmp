import { Booking } from '@/models/booking.dto';
import Token from '@/models/Token';
import { departuresStore, initializeDeparturesStore, onDeparturesStoreChange, setDeparturesPage, setDeparturesPageSize, setDepartureTotal } from '@/stores/departures.store';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { Payment, PaymentEntries } from '../ir-booking-details/types';
import { RoomService } from '@/services/room.service';
import { BookingService } from '@/services/booking-service/booking.service';
import { PaginationChangeEvent } from '../ir-pagination/ir-pagination';
import { CheckoutDialogCloseEvent, CheckoutRoomEvent } from '@/components';

@Component({
  tag: 'ir-departures',
  styleUrls: ['ir-departures.css'],
  scoped: true,
})
export class IrDepartures {
  @Prop() ticket: string;
  @Prop() propertyid: number;
  @Prop() language: string = 'en';
  @Prop() p: string;

  @State() bookingNumber: number;
  @State() booking: Booking;
  @State() paymentEntries: PaymentEntries;
  @State() isPageLoading: boolean;
  @State() payment: Payment;
  @State() checkoutState: CheckoutRoomEvent = null;
  @State() invoiceState: CheckoutRoomEvent = null;

  private tokenService = new Token();
  private roomService = new RoomService();
  private bookingService = new BookingService();

  private paymentFolioRef: HTMLIrPaymentFolioElement;

  componentWillLoad() {
    if (this.ticket) {
      this.tokenService.setToken(this.ticket);
      this.init();
    }
    onDeparturesStoreChange('today', _ => {
      this.getBookings();
    });
  }

  @Watch('ticket')
  handleTicketChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue && newValue) {
      this.tokenService.setToken(this.ticket);
      this.init();
    }
  }

  @Listen('openBookingDetails')
  handleOpen(e: CustomEvent) {
    this.bookingNumber = e.detail;
  }

  @Listen('payBookingBalance')
  handleBookingPayment(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { booking_nbr, payment } = e.detail;
    this.booking = departuresStore.bookings.find(b => b.booking_nbr === booking_nbr);
    const paymentType = this.paymentEntries.types.find(p => p.CODE_NAME === payment.payment_type.code);
    this.payment = {
      ...payment,
      payment_type: {
        code: paymentType.CODE_NAME,
        description: paymentType.CODE_VALUE_EN,
        operation: paymentType.NOTES,
      },
    };
    this.paymentFolioRef.openFolio();
  }

  private async init() {
    try {
      this.isPageLoading = true;
      const [_, __, setupEntries] = await Promise.all([
        this.roomService.getExposedProperty({ id: this.propertyid || 0, language: this.language, aname: this.p }),
        this.roomService.fetchLanguage(this.language),
        this.bookingService.getSetupEntriesByTableNameMulti(['_BED_PREFERENCE_TYPE', '_DEPARTURE_TIME', '_PAY_TYPE', '_PAY_TYPE_GROUP', '_PAY_METHOD']),
        this.getBookings(),
      ]);

      const { pay_type, pay_type_group, pay_method } = this.bookingService.groupEntryTablesResult(setupEntries);

      this.paymentEntries = { types: pay_type, groups: pay_type_group, methods: pay_method };
    } catch (error) {
    } finally {
      this.isPageLoading = false;
    }
  }

  private async getBookings() {
    const { bookings, total_count } = await this.bookingService.getRoomsToCheckout({
      property_id: this.propertyid?.toString(),
      check_out_date: departuresStore.today,
      page_index: departuresStore.pagination.currentPage,
      page_size: departuresStore.pagination.pageSize,
    });
    setDepartureTotal(total_count ?? 0);
    initializeDeparturesStore(bookings);
  }
  private handleCheckoutRoom(event: CustomEvent<CheckoutRoomEvent>): void {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.checkoutState = event.detail;
  }
  private async handlePaginationChange(event: CustomEvent<PaginationChangeEvent>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const nextPage = event.detail?.currentPage ?? 1;
    if (nextPage === departuresStore.pagination.currentPage) {
      return;
    }
    setDeparturesPage(nextPage);
    await this.getBookings();
  }

  private async handleCheckoutDialogClosed(event: CustomEvent<CheckoutDialogCloseEvent>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const state = { ...this.checkoutState };
    this.checkoutState = null;
    switch (event.detail.reason) {
      case 'checkout':
        await this.getBookings();
        break;
      case 'openInvoice':
        this.invoiceState = { ...state };
        await this.getBookings();
        break;
    }
  }

  private async handlePaginationPageSizeChange(event: CustomEvent<PaginationChangeEvent>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const nextPageSize = event.detail?.pageSize;
    if (!Number.isFinite(nextPageSize)) {
      return;
    }
    const normalizedPageSize = Math.floor(Number(nextPageSize));
    if (normalizedPageSize === departuresStore.pagination.pageSize) {
      return;
    }
    setDeparturesPageSize(normalizedPageSize);
    await this.getBookings();
  }
  private handleInvoiceClose(event: CustomEvent<void>): void {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.invoiceState = null;
  }
  render() {
    if (this.isPageLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host>
        <ir-toast></ir-toast>
        <ir-interceptor handledEndpoints={['/Get_Rooms_To_Check_Out']}></ir-interceptor>
        <div class={'ir-page__container'}>
          <h3 class="page-title">Departures</h3>
          <ir-departures-filter></ir-departures-filter>
          <ir-departures-table
            onCheckoutRoom={event => this.handleCheckoutRoom(event as CustomEvent<CheckoutRoomEvent>)}
            onRequestPageChange={event => this.handlePaginationChange(event as CustomEvent<PaginationChangeEvent>)}
            onRequestPageSizeChange={event => this.handlePaginationPageSizeChange(event as CustomEvent<PaginationChangeEvent>)}
          ></ir-departures-table>
        </div>
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
        <ir-checkout-dialog
          booking={this.checkoutState?.booking}
          identifier={this.checkoutState?.identifier}
          open={this.checkoutState !== null}
          onCheckoutDialogClosed={event => this.handleCheckoutDialogClosed(event as CustomEvent<CheckoutDialogCloseEvent>)}
        ></ir-checkout-dialog>
        <ir-invoice
          onInvoiceClose={event => this.handleInvoiceClose(event as CustomEvent<void>)}
          booking={this.invoiceState?.booking}
          roomIdentifier={this.invoiceState?.identifier}
          open={this.invoiceState !== null}
        ></ir-invoice>
      </Host>
    );
  }
}
