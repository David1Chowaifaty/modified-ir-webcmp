import type { PaginationChangeEvent } from '@/components/ir-pagination/ir-pagination';
import { Booking } from '@/models/booking.dto';
import Token from '@/models/Token';
import { BookingService } from '@/services/booking-service/booking.service';
import { RoomService } from '@/services/room.service';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { Payment, PaymentEntries, RoomGuestsPayload } from '../ir-booking-details/types';
import { arrivalsStore, initializeArrivalsStore, onArrivalsStoreChange, setArrivalsPage, setArrivalsPageSize, setArrivalsTotal } from '@/stores/arrivals.store';
import { ICountry } from '@/models/IBooking';

@Component({
  tag: 'ir-arrivals',
  styleUrls: ['ir-arrivals.css'],
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
  @State() roomGuestState: RoomGuestsPayload = null;
  @State() countries: ICountry[];

  private tokenService = new Token();
  private roomService = new RoomService();
  private bookingService = new BookingService();

  private paymentFolioRef: HTMLIrPaymentFolioElement;

  componentWillLoad() {
    if (this.ticket) {
      this.tokenService.setToken(this.ticket);
      this.init();
    }
    onArrivalsStoreChange('today', _ => {
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

  @Listen('payBookingBalance')
  handleBookingPayment(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { booking_nbr, payment } = e.detail;
    this.booking = arrivalsStore.bookings.find(b => b.booking_nbr === booking_nbr);
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

  @Listen('openBookingDetails')
  handleOpen(e: CustomEvent) {
    this.bookingNumber = e.detail;
  }

  private async init() {
    try {
      this.isPageLoading = true;
      const [_, __, countries, setupEntries] = await Promise.all([
        this.roomService.getExposedProperty({ id: this.propertyid || 0, language: this.language, aname: this.p }),
        this.roomService.fetchLanguage(this.language),
        this.bookingService.getCountries(this.language),
        this.bookingService.getSetupEntriesByTableNameMulti(['_BED_PREFERENCE_TYPE', '_DEPARTURE_TIME', '_PAY_TYPE', '_PAY_TYPE_GROUP', '_PAY_METHOD']),
        this.getBookings(),
      ]);
      this.countries = countries;
      const { pay_type, pay_type_group, pay_method } = this.bookingService.groupEntryTablesResult(setupEntries);

      this.paymentEntries = { types: pay_type, groups: pay_type_group, methods: pay_method };
    } catch (error) {
    } finally {
      this.isPageLoading = false;
    }
  }

  private async getBookings() {
    const { bookings, total_count } = await this.bookingService.getRoomsToCheckIn({
      property_id: this.propertyid?.toString(),
      check_in_date: arrivalsStore.today,
      page_index: arrivalsStore.pagination.currentPage,
      page_size: arrivalsStore.pagination.pageSize,
    });
    setArrivalsTotal(total_count ?? 0);
    initializeArrivalsStore(bookings);
  }

  private async handlePaginationChange(event: CustomEvent<PaginationChangeEvent>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const nextPage = event.detail?.currentPage ?? 1;
    if (nextPage === arrivalsStore.pagination.currentPage) {
      return;
    }
    setArrivalsPage(nextPage);
    await this.getBookings();
  }

  private async handlePaginationPageSizeChange(event: CustomEvent<PaginationChangeEvent>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const nextPageSize = event.detail?.pageSize;
    if (!Number.isFinite(nextPageSize)) {
      return;
    }
    const normalizedPageSize = Math.floor(Number(nextPageSize));
    if (normalizedPageSize === arrivalsStore.pagination.pageSize) {
      return;
    }
    setArrivalsPageSize(normalizedPageSize);
    await this.getBookings();
  }
  private handleCheckingRoom(event: CustomEvent<RoomGuestsPayload>): void {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.roomGuestState = event.detail;
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
        <ir-arrivals-table
          onCheckInRoom={event => this.handleCheckingRoom(event as CustomEvent<RoomGuestsPayload>)}
          onRequestPageChange={event => this.handlePaginationChange(event as CustomEvent<PaginationChangeEvent>)}
          onRequestPageSizeChange={event => this.handlePaginationPageSizeChange(event as CustomEvent<PaginationChangeEvent>)}
        ></ir-arrivals-table>
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
            '--ir-drawer-padding-top': '0',
            '--ir-drawer-padding-bottom': '0',
            '--ir-drawer-padding-right': '0',
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
        <ir-room-guests
          open={this.roomGuestState !== null}
          countries={this.countries}
          language={this.language}
          identifier={this.roomGuestState?.identifier}
          bookingNumber={this.roomGuestState?.booking_nbr?.toString()}
          roomName={this.roomGuestState?.roomName}
          totalGuests={this.roomGuestState?.totalGuests}
          sharedPersons={this.roomGuestState?.sharing_persons}
          checkIn={this.roomGuestState?.checkin}
          onCloseModal={() => (this.roomGuestState = null)}
        ></ir-room-guests>
      </Host>
    );
  }
}
