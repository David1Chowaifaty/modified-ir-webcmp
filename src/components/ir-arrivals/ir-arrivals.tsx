import type { PaginationChangeEvent } from '@/components/ir-pagination/ir-pagination';
import { Booking } from '@/models/booking.dto';
import Token from '@/models/Token';
import { BookingService } from '@/services/booking-service/booking.service';
import { RoomService } from '@/services/room.service';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { Payment, PaymentEntries, RoomGuestsPayload } from '../ir-booking-details/types';
import { arrivalsStore, initializeArrivalsStore, onArrivalsStoreChange, setArrivalsPage, setArrivalsPageSize, setArrivalsTotal } from '@/stores/arrivals.store';
import { ICountry } from '@/models/IBooking';
import calendar_data from '@/stores/calendar-data';

@Component({
  tag: 'ir-arrivals',
  styleUrls: ['ir-arrivals.css'],
  scoped: true,
})
export class IrArrivals {
  /**
   * Authentication token issued by the PMS backend.
   * Required for initializing the component and making API calls.
   */
  @Prop() ticket: string;

  /**
   * ID of the property (hotel) for which arrivals should be displayed.
   * Used in API calls related to rooms, bookings, and check-ins.
   */
  @Prop() propertyid: number;

  /**
   * Two-letter language code (ISO) used for translations and API locale.
   * Defaults to `'en'`.
   */
  @Prop() language: string = 'en';

  /**
   * Property alias or short identifier used by backend endpoints (aname).
   * Passed to `getExposedProperty` when initializing the component.
   */
  @Prop() p: string;

  /**
   * Number of arrivals to load per page in the arrivals table.
   * Used to configure pagination via Arrivals Store.
   * Defaults to `20`.
   */
  @Prop() pageSize: number = 20;

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
    setArrivalsPageSize(this.pageSize);
    onArrivalsStoreChange('today', _ => {
      this.getBookings();
    });
  }

  @Watch('pageSize')
  handlePageSizeChange(newValue: number, oldValue: number) {
    if (newValue !== oldValue) setArrivalsPageSize(newValue);
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
  @Listen('resetExposedCancellationDueAmount')
  async handleResetExposedCancellationDueAmount(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    await this.getBookings();
  }
  private async init() {
    try {
      this.isPageLoading = true;

      if (!this.propertyid && !this.p) {
        throw new Error('Missing credentials');
      }
      let propertyId = this.propertyid;

      if (!propertyId) {
        await this.roomService.getExposedProperty({
          id: 0,
          aname: this.p,
          language: this.language,
          is_backend: true,
        });
      }

      const [_, __, countries, setupEntries] = await Promise.all([
        calendar_data?.property ? Promise.resolve(null) : this.roomService.getExposedProperty({ id: this.propertyid || 0, language: this.language, aname: this.p }),
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
      property_id: calendar_data.property?.id?.toString() || this.propertyid?.toString(),
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

  @Listen('updateRoomGuests')
  handleResetBooking(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.getBookings();
  }
  // @Listen("resetBookingEvt")
  // handleResetBookings(e:CustomEvent){
  //   e.stopImmediatePropagation();
  //   e.stopPropagation();
  //   this.
  // }
  render() {
    if (this.isPageLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host>
        <ir-toast></ir-toast>
        <ir-interceptor handledEndpoints={['/Get_Rooms_To_Check_in']}></ir-interceptor>
        <div class="ir-page__container">
          <h3 class="page-title">Check-ins</h3>
          {/* <ir-arrivals-filters></ir-arrivals-filters> */}
          <ir-arrivals-table
            onCheckInRoom={event => this.handleCheckingRoom(event as CustomEvent<RoomGuestsPayload>)}
            onRequestPageChange={event => this.handlePaginationChange(event as CustomEvent<PaginationChangeEvent>)}
            onRequestPageSizeChange={event => this.handlePaginationPageSizeChange(event as CustomEvent<PaginationChangeEvent>)}
          ></ir-arrivals-table>
          <ir-booking-details-drawer
            open={!!this.bookingNumber}
            propertyId={this.propertyid as any}
            bookingNumber={this.bookingNumber?.toString()}
            ticket={this.ticket}
            language={this.language}
            onBookingDetailsDrawerClosed={() => (this.bookingNumber = null)}
          ></ir-booking-details-drawer>
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
        </div>
      </Host>
    );
  }
}
